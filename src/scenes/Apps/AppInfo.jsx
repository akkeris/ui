import React, { Component } from 'react';
import {
  Tab, Tabs, CircularProgress, Snackbar, Card, CardHeader,
  Tooltip, IconButton, Menu, MenuItem, Divider, ListItemIcon, ListItemText,
  Switch, ListItemSecondaryAction, Collapse, Typography,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import InfoIcon from '@material-ui/icons/Info';
import CPUIcon from '@material-ui/icons/Memory';
import FavoriteIcon from '@material-ui/icons/FavoriteBorder';
import IsFavoriteIcon from '@material-ui/icons/Favorite';
import MetricIcon from '@material-ui/icons/TrackChanges';
import AddonIcon from '@material-ui/icons/ShoppingBasket';
import LogIcon from '@material-ui/icons/Visibility';
import ConfigIcon from '@material-ui/icons/Tune';
import AppIcon from '@material-ui/icons/Launch';
import ReleaseIcon from '@material-ui/icons/Cloud';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RemoveIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import ReactGA from 'react-ga';

import AutoBuildIcon from '../../components/Icons/CircuitBoard';
import GitIcon from '../../components/Icons/GitIcon';
import WebhookIcon from '../../components/Icons/WebhookIcon';
import Formations from '../../components/Formations';
import Webhooks from '../../components/Webhooks';
import Releases from '../../components/Releases';
import Config from '../../components/ConfigVars';
import Metrics from '../../components/Metrics';
import Addons from '../../components/Addons';
import Logs from '../../components/Logs';
import AppOverview from '../../components/Apps/AppOverview';
import api from '../../services/api';
import util from '../../services/util';
import History from '../../config/History';
import ConfirmationModal from '../../components/ConfirmationModal';
import NewAutoBuild from '../../components/Releases/NewAutoBuild';

const style = {
  iconButton: {
    color: 'black',
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
      color: 'white',
    },
  },
  collapse: {
    container: {
      display: 'flex', flexDirection: 'column',
    },
    header: {
      container: {
        display: 'flex', alignItems: 'center', padding: '6px 26px 0px',
      },
      title: {
        flex: 1,
      },
    },
  },
  menuItem: {
    paddingRight: '10px',
    minWidth: '215px',
    paddingTop: '0px',
    paddingBottom: '0px',
    boxSizing: 'unset',
  },
};

function addRestrictedTooltip(title, children) {
  return (
    <Tooltip title={title} placement="top">
      <div>{children}</div>
    </Tooltip>
  );
}

const tabs = ['info', 'dynos', 'releases', 'addons', 'config', 'logs', 'metrics', 'webhooks'];

export default class AppInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFavorite: false,
      app: {},
      accountInfo: {},
      loading: true,
      submitMessage: '',
      submitFail: false,
      anchorEl: null,
      open: false,
      rOpen: false,
      dOpen: false,
      mOpen: false,
      newAuto: false,
      isMaintenance: false,
      isElevated: false,
      restrictedSpace: false,
      message: '',
      basePath: `/apps/${this.props.match.params.app}`,
    };
  }

  async componentDidMount() {
    // Landed on an invalid tab
    const currentTab = this.props.match.params.tab;
    if (!currentTab || !tabs.includes(currentTab)) {
      History.get().replace(`${this.state.basePath}/info`);
    }

    try {
      const appResponse = await api.getApp(this.props.match.params.app);
      const favoriteResponse = await api.getFavorites();
      const accountResponse = await api.getAccount();

      let isElevated = false;
      let restrictedSpace = false;
      if (appResponse.data.space.compliance.includes('prod') || appResponse.data.space.compliance.includes('socs')) {
      // If we don't have the elevated_access object in the accountInfo object,
      // default to enabling the button (access will be controlled on the API)
        isElevated = (accountResponse.data && 'elevated_access' in accountResponse.data) ? accountResponse.data.elevated_access : true;
        restrictedSpace = true;
      }

      this._isMounted = true;

      this.setState({
        app: appResponse.data,
        accountInfo: accountResponse.data,
        isFavorite: favoriteResponse.data.findIndex(x => x.name === appResponse.data.name) > -1,
        loading: false,
        restrictedSpace,
        isElevated,
        isMaintenance: appResponse.data.maintenance,
      });
    } catch (err) {
      this.setState({
        submitMessage: err.response.data,
        submitFail: true,
      });
    }
    util.updateHistory('apps', this.props.match.params.app, this.props.match.params.app);
  }

  componentDidUpdate(prevProps) {
    const currentTab = this.props.match.params.tab;
    const prevTab = prevProps.match.params.tab;
    // Handle bad tab navigation (not provided or not valid)
    if (prevTab !== currentTab) {
      if (!currentTab || !tabs.includes(currentTab)) {
        History.get().replace(`${this.state.basePath}/info`);
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  };

  handleMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  handleRemoveApp = async () => {
    try {
      await api.deleteApp(this.state.app.name);
      ReactGA.event({
        category: 'APPS',
        action: 'Deleted app',
      });
      History.get().push('/apps');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        open: false,
        dOpen: false,
      });
    }
  }

  handleRepoConfirmation = () => {
    this.setState({
      rOpen: true,
      anchorEl: null,
    });
  }

  handleCancelRepoConfirmation = () => {
    this.setState({
      rOpen: false,
      anchorEl: null,
    });
  }

  handleConfirmation = () => {
    this.setState({ dOpen: true, anchorEl: null });
  }

  handleCancelConfirmation = () => {
    this.setState({ dOpen: false, anchorEl: null });
  }

  handleMaintenanceConfirmation = (event, isInputChecked) => {
    this.setState({
      mOpen: true,
      isMaintenance: isInputChecked,
      anchorEl: null,
    });
  }

  handleCancelMaintenanceConfirmation = () => {
    this.setState({
      mOpen: false,
      isMaintenance: !this.state.isMaintenance,
      anchorEl: null,
    });
  }

  handleMaintenanceToggle = async () => {
    try {
      await api.patchApp(this.state.app.name, this.state.isMaintenance);
      this.reload('Maintenance Mode Updated');
      ReactGA.event({
        category: 'APPS',
        action: 'Maintenance mode toggled',
      });
      this.setState({ mOpen: false, loading: false });
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        loading: false,
        mOpen: false,
      });
    }
  }

  handleRemoveRepo = async () => {
    try {
      await api.deleteAutoBuild(this.state.app.name);
      const appResponse = await api.getApp(this.props.match.params.app);
      this.setState({ rOpen: false, loading: false, app: appResponse.data });
      this.reload('Repo Detached');
      ReactGA.event({
        category: 'APPS',
        action: 'Detached repo from app',
      });
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        rOpen: false,
        loading: false,
      });
    }
  }

  handleConfigureAutoBuild = () => {
    this.setState({ newAuto: true, anchorEl: null });
  }

  handleConfigureAutoBuildCancel = () => {
    this.setState({ newAuto: false, anchorEl: null });
  }

  handleFavorite = () => {
    if (this.state.isFavorite) {
      api.deleteFavorite(this.state.app.name);
      ReactGA.event({
        category: 'APPS',
        action: 'Removed favorite',
      });
      this.setState({ isFavorite: false });
    } else {
      api.createFavorite(this.state.app.name);
      ReactGA.event({
        category: 'APPS',
        action: 'Added favorite',
      });
      this.setState({ isFavorite: true });
    }
  }

  handleNotFoundClose = () => {
    History.get().push('/apps');
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  reload = (message) => {
    this.setState({
      open: true,
      newAuto: false,
      message,
    });
  }

  reloadAutoBuild = async (message) => {
    this.setState({ newAuto: false });
    try {
      const appResponse = await api.getApp(this.props.match.params.app);
      if (this._isMounted) {
        this.setState({ open: true, app: appResponse.data, message });
      }
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        rOpen: false,
        loading: false,
      });
    }
  }

  changeActiveTab = (event, newTab) => {
    const currentTab = this.props.match.params.tab;
    if (currentTab !== newTab) {
      History.get().push(`${this.state.basePath}/${newTab}`);
    }
  }

  renderHeaderActions() {
    const { anchorEl, restrictedSpace, isElevated } = this.state;
    const menuOpen = Boolean(anchorEl);

    let deleteButton = (
      <MenuItem
        style={style.menuItem}
        onClick={this.handleConfirmation}
        disabled={(restrictedSpace && !isElevated)}
      >
        <ListItemIcon
          className="delete-app"
        >
          <DeleteIcon color="secondary" htmlColor={isElevated ? 'white' : undefined} />
        </ListItemIcon>
        <ListItemText primary="Delete App" />
      </MenuItem>
    );
    if (restrictedSpace && !isElevated) {
      deleteButton = addRestrictedTooltip('Elevated access required', deleteButton);
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '102px', float: 'right' }}>
        <Tooltip title="Favorite" placement="top-end">
          <IconButton
            style={style.iconButton}
            className="favorite-app"
            onClick={this.handleFavorite}
          >
            {this.state.isFavorite ? <IsFavoriteIcon color={'primary'} /> : <FavoriteIcon color={'primary'} />}
          </IconButton>
        </Tooltip>
        <IconButton
          onClick={this.handleMenuClick}
          className="app-menu-button"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          open={menuOpen}
          anchorEl={anchorEl}
          onClose={this.handleMenuClose}
          className="app-menu"
        >
          <MenuItem style={style.menuItem} onClick={() => window.open(this.state.app.web_url, '_blank')}>
            <ListItemIcon
              className="live-app"
            >
              <AppIcon />
            </ListItemIcon>
            <ListItemText primary="Live App" />
          </MenuItem>
          <MenuItem style={style.menuItem}>
            <ListItemIcon>
              <ReleaseIcon />
            </ListItemIcon>
            <ListItemText primary="Maintenance" />
            <ListItemSecondaryAction>
              <Switch
                className="toggle"
                checked={this.state.isMaintenance}
                onChange={this.handleMaintenanceConfirmation}
              />
            </ListItemSecondaryAction>
          </MenuItem>
          {this.state.app.git_url && (
            <MenuItem style={style.menuItem} onClick={() => window.open(this.state.app.git_url, '_blank')} >
              <ListItemIcon
                className="github"
              >
                <GitIcon />
              </ListItemIcon>
              <ListItemText primary="Github" />
            </MenuItem>
          )}
          {this.state.app.git_url ? (
            <MenuItem style={style.menuItem} onClick={this.handleRepoConfirmation}>
              <ListItemIcon
                className="remove-repo"
              >
                <AutoBuildIcon color="secondary" />
              </ListItemIcon>
              <ListItemText primary="Detach Repo" />
            </MenuItem>
          ) : (
            <MenuItem style={style.menuItem} onClick={this.handleConfigureAutoBuild}>
              <ListItemIcon
                className="configure-repo"
              >
                <AutoBuildIcon />
              </ListItemIcon>
              <ListItemText primary="Configure Repo" />
            </MenuItem>
          )}
          <Divider variant="inset" />
          {deleteButton}
        </Menu>
      </div>
    );
  }

  render() {
    const { loading, submitMessage, submitFail } = this.state;
    const currentTab = this.props.match.params.tab;
    if (loading) {
      let notFoundMessage;
      if (submitFail) {
        // Format the invalid application name in bold.
        try {
          const result = /(The specified application )(.*)( does not exist\.)/g.exec(submitMessage);
          notFoundMessage = (
            <span>
              <span>{result[1]}</span>
              <span style={{ fontWeight: 'bold' }}>{result[2]}</span>
              <span>{result[3]}</span>
            </span>
          );
        } catch (e) { notFoundMessage = submitMessage; }
      }
      return (
        <div style={style.refresh.div}>
          { !submitFail && <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" /> }
          <ConfirmationModal
            open={submitFail}
            onOk={this.handleNotFoundClose}
            message={notFoundMessage || ''}
            title="Error"
            className="not-found-error"
          />
        </div>
      );
    }
    return (
      <div style={{ marginBottom: '12px' }}>
        <Card className="card" style={{ overflow: 'visible' }}>
          <CardHeader
            className="header"
            title={this.state.app.name}
            subheader={this.state.app.organization.name}
            action={
              this.renderHeaderActions()
            }
          />

          <Tabs
            variant="fullWidth"
            value={currentTab}
            onChange={this.changeActiveTab}
            scrollButtons="off"
            indicatorColor="primary"
          >
            <Tab
              disableRipple
              className="info-tab"
              icon={<InfoIcon />}
              label="Info"
              value="info"
            />
            <Tab
              disableRipple
              className="dynos-tab"
              icon={<CPUIcon />}
              label="Dynos"
              value="dynos"
            />
            <Tab
              disableRipple
              className="releases-tab"
              icon={<ReleaseIcon />}
              label="Activity"
              value="releases"
            />
            <Tab
              disableRipple
              className="addons-tab"
              icon={<AddonIcon />}
              label="Addons"
              value="addons"
            />
            <Tab
              disableRipple
              className="webhooks-tab"
              icon={<WebhookIcon />}
              label="Webhooks"
              value="webhooks"
            />
            <Tab
              disableRipple
              className="config-tab"
              icon={<ConfigIcon />}
              label="Config"
              value="config"
            />
            <Tab
              disableRipple
              className="metrics-tab"
              icon={<MetricIcon />}
              label="Metrics"
              value="metrics"
            />
            <Tab
              disableRipple
              className="logs-tab"
              icon={<LogIcon />}
              label="Logs"
              value="logs"
            />
          </Tabs>
          <Collapse
            in={this.state.newAuto}
            unmountOnExit
            mountOnEnter
          >
            <div style={style.collapse.container}>
              <div style={style.collapse.header.container}>
                <Typography style={style.collapse.header.title} variant="overline">Attach Repo</Typography>
                <IconButton className="config-cancel" onClick={this.handleConfigureAutoBuildCancel}><RemoveIcon /></IconButton>
              </div>
              <div>
                <NewAutoBuild
                  app={this.state.app.name}
                  onComplete={message => this.reloadAutoBuild(message)}
                />
              </div>
            </div>
          </Collapse>
          {currentTab === 'info' && (
            <AppOverview
              app={this.state.app}
              onComplete={this.reload}
            />
          )}
          {currentTab === 'dynos' && (
            <Formations
              app={this.state.app}
            />
          )}
          {currentTab === 'releases' && (
            <Releases
              app={this.state.app}
              org={this.state.app.organization.name}
              accountInfo={this.state.accountInfo}
            />
          )}
          {currentTab === 'addons' && (
            <Addons
              app={this.state.app}
              accountInfo={this.state.accountInfo}
            />
          )}
          {currentTab === 'webhooks' && (
            <Webhooks
              app={this.state.app.name}
            />
          )}
          {currentTab === 'config' && (
            <Config
              app={this.state.app.name}
            />
          )}
          {currentTab === 'metrics' && (
            <Metrics
              app={this.state.app.name}
              appName={this.state.app.simple_name}
              space={this.state.app.space.name}
            />
          )}
          {currentTab === 'logs' && (
            <Logs
              app={this.state.app.name}
              appName={this.state.app.simple_name}
              space={this.state.app.space.name}
            />
          )}
        </Card>
        <ConfirmationModal
          className="delete-confirm"
          open={this.state.dOpen}
          onOk={this.handleRemoveApp}
          onCancel={this.handleCancelConfirmation}
          message="Are you sure you want to delete this app?"
        />
        <ConfirmationModal
          className="maintenance-confirm"
          open={this.state.mOpen}
          onOk={this.handleMaintenanceToggle}
          onCancel={this.handleCancelMaintenanceConfirmation}
          message={!this.state.isMaintenance ? (
            'Are you sure you want to take this app out of maintenance?'
          ) : (
            'Are you sure you want to put this app in maintenance?'
          )}
          title="Confirm Maintenance"
        />
        <ConfirmationModal
          className="repo-confirm"
          open={this.state.rOpen}
          onOk={this.handleRemoveRepo}
          onCancel={this.handleCancelRepoConfirmation}
          message={'Are you sure you want to disconnect your repo?'}
          title="Confirm Repo Removal"
        />
        <ConfirmationModal
          open={this.state.submitFail}
          onOk={this.handleClose}
          message={this.state.submitMessage || ''}
          title="Error"
          className="app-error"
        />
        <Snackbar
          className="app-snack"
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

AppInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
