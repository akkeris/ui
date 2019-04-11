import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, Switch, List, ListItem, ListItemText, Button,
  GridList, GridListTile, FormGroup, FormControlLabel, Tooltip, Typography, Collapse, IconButton,
  Snackbar,
  Divider,
} from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Clear';
import AutoBuildIcon from '../Icons/CircuitBoard';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';
import Audits from '../Audits';
import NewAutoBuild from '../Releases/NewAutoBuild';
import History from '../../config/History';

function addRestrictedTooltip(title, children) {
  return (
    <Tooltip title={title} placement="top">
      <div>{children}</div>
    </Tooltip>
  );
}

const style = {
  link: {
    color: 'rgba(0, 0, 0, 0.54)',
    textDecoration: 'none',
  },
  currentImage: {
    visible: {
      padding: '0 24px 20px',
    },
    hidden: {
      padding: '0 24px 20px 24px',
    },
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '10%',
      paddingBottom: '10%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  button: {
    marginRight: '16px',
  },
  gridList: {
    overflowY: 'auto',
    margin: '0px 24px',
  },
  gridListTile: {
    padding: '0px',
  },
  listItem: {
    padding: '12px 0px',
  },
  tableCell: {
    main: {
      fontSize: '16px',
    },
    header: {
      paddingLeft: '24px',
      marginLeft: '0px',
      paddingRight: '16px',
      borderBottom: 'none',
    },
    sub: {
      fontSize: '14px',
      color: 'rgb(0,0,0,0.54)',
    },
    end: {
      float: 'right',
    },
  },
  deleteButtonLabel: {
    paddingRight: '5px',
  },
  removeIcon: {
    paddingRight: '5px',
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
  header: {
    container: {
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 24px',
    },
    title: {
      flex: 1,
    },
    actions: {
      container: {
        width: '112px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      },
      button: {
        width: '50px',
      },
    },
  },
};

class AppOverview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      open: false,
      mOpen: false,
      rOpen: false,
      submitFail: false,
      submitMessage: '',
      isMaintenance: false,
      isElevated: false,
      restrictedSpace: false,
      autoBuild: null,
      newAuto: false,
      snackOpen: false,
    };
  }

  async componentDidMount() {
    const { app, accountInfo } = this.props;

    // If this is a production app, check for the elevated_access role to determine
    // whether or not to enable the delete app button.

    // There is still an API call on the backend that controls access to the actual
    // deletion of the app, this is merely for convienence.

    let isElevated = false;
    let restrictedSpace = false;
    if (app.space.compliance.includes('prod') || app.space.compliance.includes('socs')) {
      // If we don't have the elevated_access object in the accountInfo object,
      // default to enabling the button (access will be controlled on the API)
      isElevated = (accountInfo && 'elevated_access' in accountInfo) ? accountInfo.elevated_access : true;
      restrictedSpace = true;
    }

    let autoBuild;
    try {
      autoBuild = await api.getAutoBuild(this.props.app.name);
    } catch (err) {
      autoBuild = null;
    }

    this.setState({ // eslint-disable-line react/no-did-mount-set-state
      isMaintenance: app.maintenance,
      isElevated,
      restrictedSpace,
      autoBuild: autoBuild ? autoBuild.data : null,
      loading: false,
    });
  }

  getRepo = async () => {
    let autoBuild;
    try {
      autoBuild = await api.getAutoBuild(this.props.app.name);
    } catch (err) {
      this.setState({
        submitMessage: err.response.data,
        submitFail: true,
        rOpen: false,
        loading: false,
        autoBuild: null,
      });
    }

    this.setState({
      autoBuild: autoBuild ? autoBuild.data : null,
      loading: false,
    });
  }

  handleConfirmation = () => {
    this.setState({ open: true });
  }

  handleCancelConfirmation = () => {
    this.setState({ open: false });
  }

  handleMaintenanceConfirmation = (event, isInputChecked) => {
    this.setState({
      mOpen: true,
      isMaintenance: isInputChecked,
    });
  }

  handleCancelMaintenanceConfirmation = () => {
    this.setState({
      mOpen: false,
      isMaintenance: !this.state.isMaintenance,
    });
  }

  handleRepoConfirmation = () => {
    this.setState({
      rOpen: true,
    });
  }

  handleCancelRepoConfirmation = () => {
    this.setState({
      rOpen: false,
    });
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleRemoveApp = async () => {
    try {
      await api.deleteApp(this.props.app.name);
      History.get().push('/apps');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        open: false,
      });
    }
  }

  handleRemoveRepo = async () => {
    try {
      await api.deleteAutoBuild(this.props.app.name);
      this.setState({ autoBuild: null, rOpen: false, loading: false });
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
    this.setState({ newAuto: true });
  }

  handleConfigureAutoBuildCancel = () => {
    this.setState({ newAuto: false });
  }

  handleSnackClose() {
    this.setState({ snackOpen: false });
  }

  handleMaintenanceToggle = async () => {
    this.setState({ loading: true });
    try {
      await api.patchApp(this.props.app.name, this.state.isMaintenance);
      this.props.onComplete('Maintenance Mode Updated');
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

  reload = (message) => {
    this.setState({
      loading: false,
      newAuto: false,
      snackOpen: true,
      message,
    });
    this.getRepo();
  }

  render() {
    const { isElevated, restrictedSpace } = this.state;
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }

    let deleteButton = (
      <Button
        variant="contained"
        className="delete"
        style={style.button}
        onClick={this.handleConfirmation}
        color="secondary"
        disabled={(restrictedSpace && !isElevated)}
      >
        <RemoveIcon style={style.removeIcon} nativeColor={isElevated ? 'white' : undefined} />
        <span style={style.deleteButtonLabel}>Delete App</span>
      </Button>
    );

    const deleteRepoButton = (
      <Button
        variant="contained"
        className="deleteRepo"
        style={style.button}
        onClick={this.handleRepoConfirmation}
        color="primary"
      >
        <RemoveIcon style={style.removeIcon} nativeColor={isElevated ? 'white' : undefined} />
        <span style={style.deleteButtonLabel}>Remove Repo</span>
      </Button>
    );

    const configureRepoButton = (
      <Button
        variant="contained"
        className="configureRepo"
        style={style.button}
        onClick={this.handleConfigureAutoBuild}
        color="primary"
      >
        <AutoBuildIcon style={style.removeIcon} nativeColor={isElevated ? 'white' : undefined} />
        <span style={style.deleteButtonLabel}>Configure Repo</span>
      </Button>
    );

    // Wrap the delete button in a tooltip to avoid confusion as to why it is disabled
    if (restrictedSpace && !isElevated) {
      deleteButton = addRestrictedTooltip('Elevated access required', deleteButton);
    }

    return (
      <div>
        <Divider />
        <GridList style={style.gridList} cellHeight={'auto'}>
          <GridListTile style={{ padding: '0px' }}>
            <List>
              <ListItem style={style.listItem}>
                <ListItemText primary="Organization" secondary={this.props.app.organization.name} />
              </ListItem>
              <ListItem style={style.listItem}>
                <ListItemText primary="ID" secondary={`${this.props.app.id}`} />
              </ListItem>
            </List>
          </GridListTile>
          <GridListTile style={{ padding: '0px' }}>
            <List>
              <ListItem style={style.listItem}>
                <ListItemText
                  primary="URL"
                  secondary={
                    <a style={style.link} href={this.props.app.web_url}>
                      {this.props.app.web_url}
                    </a>
                  }
                />
              </ListItem>
              <ListItem style={style.listItem}>
                <ListItemText primary="Discovery" secondary={`${this.props.app.simple_name.toUpperCase()}_SERVICE_HOST, ${this.props.app.simple_name.toUpperCase()}_SERVICE_PORT`} />
              </ListItem>
            </List>
          </GridListTile>
        </GridList>
        <ListItemText
          style={this.props.app.repo ? style.currentImage.visible : style.currentImage.hidden}
          primary="Current Image"
          secondary={this.props.app.image}
        />
        {this.state.autoBuild ? (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0px 24px' }}>
            <div>
              <div style={style.tableCell.main}>
                {'Git Repo'}
              </div>
              <div style={style.tableCell.sub}>
                <a style={style.link} href={this.state.autoBuild.repo}>
                  {this.state.autoBuild.repo}
                </a>
              </div>
            </div>
            <div>
              <div style={style.tableCell.main}>
                {'Branch'}
              </div>
              <div style={style.tableCell.sub}>
                {this.state.autoBuild.branch}
              </div>
            </div>
            <div>
              <div style={style.tableCell.main}>
                {'User'}
              </div>
              <div style={style.tableCell.sub}>
                {this.state.autoBuild.username}
              </div>
            </div>
            <div>{deleteRepoButton}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0px 24px' }}>
            <div>
              <div style={style.tableCell.main}>
                {'Git Repo'}
              </div>
              <div style={style.tableCell.sub}>
                {'Not Configured'}
              </div>
            </div>

            {!this.state.newAuto && configureRepoButton }
          </div>
        )}
        <div>
          <Collapse unmountOnExit mountOnEnter in={this.state.newAuto}>
            <div style={style.collapse.container}>
              <div style={style.collapse.header.container}>
                <Typography style={style.collapse.header.title} variant="overline">{'Attach to Repo'}</Typography>
                <div >
                  <IconButton style={style.iconButton} className="auto-cancel" onClick={() => { this.handleConfigureAutoBuildCancel(); }}><RemoveIcon /></IconButton>
                </div>
              </div>
              <div>
                <NewAutoBuild
                  app={this.props.app.name}
                  onComplete={message => this.reload(message)}
                />
              </div>
            </div>
          </Collapse>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}>
          <div>
            <div style={style.tableCell.main}>
              {'Last Release and Most Recent Changes'}
            </div>
            <div style={style.tableCell.sub}>
              {new Date(this.props.app.released_at).toString()}
            </div>
          </div>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  className="toggle"
                  checked={this.state.isMaintenance}
                  onChange={this.handleMaintenanceConfirmation}
                />
              }
              label="Maintenance"
              labelPlacement="start"
            />
          </FormGroup>
          <div>{deleteButton}</div>
        </div>
        <Audits app={this.props.app} />
        <ConfirmationModal className="delete-confirm" open={this.state.open} onOk={this.handleRemoveApp} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this app?" />
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
          className="error"
          open={this.state.loading || this.state.submitFail}
          onOk={this.handleClose}
          message={this.state.submitMessage}
          title="Error"
        />
        <Snackbar
          className="auto-snack"
          open={this.state.snackOpen}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={() => { this.handleSnackClose(); }}
        />
      </div>
    );
  }
}

AppOverview.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onComplete: PropTypes.func.isRequired,
  accountInfo: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default AppOverview;
