import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {
  Tab, Tabs, CircularProgress, Snackbar, Card, CardHeader, CardContent,
  Tooltip, Button, IconButton, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import InfoIcon from '@material-ui/icons/Info';
import CPUIcon from '@material-ui/icons/Memory';
import MetricIcon from '@material-ui/icons/TrackChanges';
import AddonIcon from '@material-ui/icons/ShoppingBasket';
import LogIcon from '@material-ui/icons/Visibility';
import ConfigIcon from '@material-ui/icons/Tune';
import AppIcon from '@material-ui/icons/ExitToApp';
import ReleaseIcon from '@material-ui/icons/Cloud';
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

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiTabs: {
      root: {
        backgroundColor: '#3c4146',
        color: 'white',
        maxWidth: '1024px',
      },
    },
    MuiTab: {
      root: {
        minWidth: '120px !important',
      },
    },
    MuiCardContent: {
      root: {
        display: 'flex',
        flexFlow: 'row-reverse',
        padding: '0px 16px 0px 0px !important',
      },
    },
    MuiCard: {
      root: {
        maxWidth: '1024px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '12px',
      },
    },
    MuiCardHeader: {
      root: {
        padding: '16px 16px 0px 16px !important',
      },
      title: {
        fontSize: '15px',
        fontWeight: '500',
      },
      subheader: {
        fontSize: '14px',
        fontWeight: '500',
      },
    },
  },
});

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
      app: {},
      accountInfo: {},
      loading: true,
      submitMessage: '',
      submitFail: false,
      open: false,
      message: '',
      currentTab: 'info',
      basePath: `/apps/${this.props.match.params.app}`,
    };
  }


  async componentDidMount() {
    try {
      const appResponse = await api.getApp(this.props.match.params.app);
      const accountResponse = await api.getAccount();

      // If current tab not provided or invalid, rewrite it to be /info
      let currentTab = this.props.match.params.tab;
      if (!currentTab || !tabs.includes(currentTab)) {
        currentTab = 'info';
        history.replaceState(null, '', `${this.state.basePath}/info`);
      }
      this.setState({
        currentTab, app: appResponse.data, accountInfo: accountResponse.data, loading: false,
      });
    } catch (err) {
      this.setState({ submitMessage: err.response.data, submitFail: true });
    }
    util.updateHistory('app', this.props.match.params.app);
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

  handleClose = () => {
    this.setState({ submitFail: false });
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
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            { !submitFail && <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" /> }
            <Dialog
              className="not-found-error"
              open={submitFail}
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>
                <DialogContentText>{notFoundMessage}</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handleNotFoundClose}
                  color="primary"
                  autoFocus
                  onKeyDown={e => ['Escape', 'Esc'].includes(e.key) && this.handleNotFoundClose()}
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={{ marginBottom: '12px' }}>
          <Card className="card" style={{ overflow: 'visible' }}>
            <CardHeader
              className="header"
              title={this.state.app.name}
              subheader={this.state.app.organization.name}
            />
            <CardContent>
              <Tooltip title="Live App" placement="top-end">
                <IconButton
                  style={style.iconButton}
                  className="live-app"
                  href={this.state.app.web_url}
                >
                  <AppIcon />
                </IconButton>
              </Tooltip>
              {this.state.app.git_url && (
                <Tooltip title="Github Repo" placement="top-end">
                  <IconButton
                    style={style.iconButton}
                    className="github"
                    href={this.state.app.git_url}
                  >
                    <GitIcon />
                  </IconButton>
                </Tooltip>
              )}
            </CardContent>
            <Tabs
              fullWidth
              value={this.state.currentTab}
              onChange={this.changeActiveTab}
              scrollButtons="off"
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
                app={this.state.app.name}
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
          <Dialog
            className="app-error"
            open={this.state.submitFail}
          >
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
              <DialogContentText>{this.state.submitMessage}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                onClick={this.handleClose}
              >
              Ok
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            className="app-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onClose={this.handleRequestClose}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

AppInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
