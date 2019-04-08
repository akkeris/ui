import React, { Component } from 'react';
import {
  Tab, Tabs, CircularProgress, Snackbar, Card, CardHeader,
  Tooltip, IconButton, Menu, MenuItem, Divider,
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
};

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
      message: '',
      currentTab: 'info',
      basePath: `/apps/${this.props.match.params.app}`,
    };
  }

  async componentDidMount() {
    try {
      const appResponse = await api.getApp(this.props.match.params.app);
      const favoriteResponse = await api.getFavorites();
      const accountResponse = await api.getAccount();

      // If current tab not provided or invalid, rewrite it to be /info
      let currentTab = this.props.match.params.tab;
      if (!currentTab || !tabs.includes(currentTab)) {
        currentTab = 'info';
        history.replaceState(null, '', `${this.state.basePath}/info`);
      }
      this.setState({
        currentTab,
        app: appResponse.data,
        accountInfo: accountResponse.data,
        isFavorite: favoriteResponse.data.findIndex(x => x.name === appResponse.data.name) > -1,
        loading: false,
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
    // If we changed tabs through the back or forward button, update currentTab
    if (prevProps.match.params.tab !== this.props.match.params.tab && this.props.history.action === 'POP') {
      let currentTab = this.props.match.params.tab;
      if (!tabs.includes(currentTab)) {
        currentTab = 'info';
        history.replaceState(null, '', `${this.state.basePath}/info`);
      }
      this.setState({ currentTab }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  handleMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  handleFavorite = () => {
    if (this.state.isFavorite) {
      api.deleteFavorite(this.state.app.name);
      this.setState({ isFavorite: false });
    } else {
      api.createFavorite(this.state.app.name);
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
      message,
    });
  }

  changeActiveTab = (event, newTab) => {
    if (this.state.currentTab !== newTab) {
      this.setState({
        currentTab: newTab,
      });
      history.pushState(null, '', `${this.state.basePath}/${newTab}`);
    }
  }

  renderHeaderActions() {
    const { anchorEl } = this.state;
    const menuOpen = Boolean(anchorEl);
    return (
      <div style={{ display: 'flex', justifyContent: this.state.app.git_url ? 'space-between' : 'space-evenly' }}>
        {this.state.app.git_url && (
          <Tooltip title="Github Repo" placement="top-end">
            <IconButton
              style={style.iconButton}
              className="github"
              onClick={() => window.open(this.state.app.git_url, '_blank')}
            >
              <GitIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Live App" placement="top-end">
          <IconButton
            style={style.iconButton}
            className="live-app"
            onClick={() => window.open(this.state.app.web_url, '_blank')}
          >
            <AppIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Favorite" placement="top-end">
          <IconButton
            style={style.iconButton}
            className="favorite-app"
            onClick={this.handleFavorite}
          >
            {this.state.isFavorite ? <IsFavoriteIcon /> : <FavoriteIcon />}
          </IconButton>
        </Tooltip>

        <IconButton
          onClick={this.handleMenuClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          open={menuOpen}
          anchorEl={anchorEl}
          onClose={this.handleMenuClose}
        >
          <MenuItem onClick={this.handleClose}>
                Merp
          </MenuItem>
          <Divider />
          <MenuItem />
        </Menu>
      </div>
    );
  }

  render() {
    const { currentTab, loading, submitMessage, submitFail } = this.state;
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
            value={this.state.currentTab}
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
          {currentTab === 'info' && (
            <AppOverview
              app={this.state.app}
              onComplete={this.reload}
              accountInfo={this.state.accountInfo}
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
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
