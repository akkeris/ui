import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import { Card, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import InfoIcon from 'material-ui/svg-icons/action/info';
import CPUIcon from 'material-ui/svg-icons/hardware/memory';
import MetricIcon from 'material-ui/svg-icons/action/track-changes';
import AddonIcon from 'material-ui/svg-icons/action/shopping-basket';
import LogIcon from 'material-ui/svg-icons/action/visibility';
import ConfigIcon from 'material-ui/svg-icons/image/tune';
import AppIcon from 'material-ui/svg-icons/action/exit-to-app';
import ReleaseIcon from 'material-ui/svg-icons/file/cloud';
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

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  tabs: {
    backgroundColor: '#3c4146',
  },
});

const style = {
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
    },
  },
  tabs: {
    backgroundColor: '#3c4146',
  },
  card: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
  rightIcon: {
    float: 'right',
    cursor: 'pointer',
  },
};

const tabs = ['info', 'dynos', 'releases', 'addons', 'config', 'logs', 'metrics', 'webhooks'];

export default class AppInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app: {},
      loading: true,
      submitMessage: '',
      submitFail: false,
      open: false,
      message: '',
      currentTab: 'info',
      baseHash: `#/apps/${this.props.match.params.app}/`,
      basePath: `/apps/${this.props.match.params.app}`,
    };
  }


  componentDidMount() {
    api.getApp(this.props.match.params.app).then((response) => {
      const hashPath = window.location.hash;
      let currentTab = hashPath.replace(this.state.baseHash, '');
      if (!tabs.includes(currentTab)) {
        currentTab = 'info';
        window.location.hash = `${this.state.baseHash}info`;
      }
      this.setState({ currentTab });
      this.setState({
        app: response.data,
        loading: false,
      });
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
      });
    });
  }

  componentDidUpdate(prevProps) {
    // If we changed locations AND it was a 'pop' history event (back or forward button)
    const routeHasChanged = prevProps.location.pathname !== this.props.location.pathname;
    if (routeHasChanged && this.props.history.action === 'POP') {
      // If hitting back took us to the base path without a tab, hit back again
      if (this.props.location.pathname === `${this.state.basePath}` ||
          this.props.location.pathname === `${this.state.basePath}/`) {
        window.history.back();
        return;
      }
      const hashPath = window.location.hash;
      if (hashPath.includes(this.state.baseHash)) {
        let currentTab = hashPath.replace(this.state.baseHash, '');
        if (!tabs.includes(currentTab)) {
          currentTab = 'info';
          window.location = `${this.state.baseHash}info`;
        }
        // Since we check conditions before setState we avoid infinite loops
        this.setState({ currentTab }); // eslint-disable-line react/no-did-update-set-state
      }
    }
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleNotFoundClose = () => {
    window.location = '/#/apps';
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
    console.log(`changeActiveTab: ${newTab}`);
    this.setState({
      currentTab: newTab,
    });
    this.props.history.push(`${newTab}`);
  }

  render() {
    const { currentTab } = this.state;
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
            <Dialog
              className="not-found-error"
              open={this.state.submitFail}
              modal
              actions={
                <FlatButton
                  label="Ok"
                  primary
                  onClick={this.handleNotFoundClose}
                />}
            >
              {this.state.submitMessage}
            </Dialog>
          </div>
        </MuiThemeProvider>);
    }
    let git = (
      <div style={style.rightIcon}>
        <IconButton
          className="github"
          href={this.state.app.git_url}
          tooltip="Github Repo"
          tooltipPosition="top-left"
        >
          <GitIcon />
        </IconButton>
      </div>);
    if (!this.state.app.git_url) {
      git = null;
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={{ marginBottom: '12px' }}>
          <Card className="card" style={style.card}>
            <CardHeader
              className="header"
              title={this.state.app.name}
              subtitle={this.state.app.organization.name}
            >
              <IconButton
                className="live-app"
                style={style.rightIcon}
                href={this.state.app.web_url}
                tooltip="Live App"
                tooltipPosition="top-left"
              >
                <AppIcon />
              </IconButton>
              {git}
            </CardHeader>
            <Tabs value={this.state.currentTab} onChange={this.changeActiveTab}>
              <Tab
                className="info-tab"
                icon={<InfoIcon />}
                label="Info"
                value="info"
              />
              <Tab
                className="dynos-tab"
                icon={<CPUIcon />}
                label="Dynos"
                value="dynos"
              />
              <Tab
                className="releases-tab"
                icon={<ReleaseIcon />}
                label="Activity"
                value="releases"
              />
              <Tab
                className="addons-tab"
                icon={<AddonIcon />}
                label="Addons"
                value="addons"
              />
              <Tab
                className="webhooks-tab"
                icon={<WebhookIcon />}
                label="Webhooks"
                value="webhooks"
              />
              <Tab
                className="config-tab"
                icon={<ConfigIcon />}
                label="Config"
                value="config"
              />
              <Tab
                className="metrics-tab"
                icon={<MetricIcon />}
                label="Metrics"
                value="metrics"
              />
              <Tab
                className="logs-tab"
                icon={<LogIcon />}
                label="Logs"
                value="logs"
              />
            </Tabs>
            {currentTab === 'info' && (
              <AppOverview app={this.state.app} onComplete={this.reload} />
            )}
            {currentTab === 'dynos' && (
              <Formations
                app={this.state.app.name}
                active={this.state.currentTab === 'dynos'}
              />
            )}
            {currentTab === 'releases' && (
              <Releases
                app={this.state.app.name}
                active={this.state.currentTab === 'releases'}
              />
            )}
            {currentTab === 'addons' && (
              <Addons
                app={this.state.app.name}
                active={this.state.currentTab === 'addons'}
              />
            )}
            {currentTab === 'webhooks' && (
              <Webhooks
                app={this.state.app.name}
                active={this.state.currentTab === 'webhooks'}
              />
            )}
            {currentTab === 'config' && (
              <Config
                app={this.state.app.name}
                active={this.state.currentTab === 'config'}
              />
            )}
            {currentTab === 'metrics' && (
              <Metrics
                active={this.state.currentTab === 'metrics'}
                app={this.state.app.name}
                appName={this.state.app.simple_name}
                space={this.state.app.space.name}
              />
            )}
            {currentTab === 'logs' && (
              <Logs
                active={this.state.currentTab === 'logs'}
                app={this.state.app.name}
                appName={this.state.app.simple_name}
                space={this.state.app.space.name}
              />
            )}
          </Card>
          <Dialog
            className="app-error"
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                label="Ok"
                primary
                onClick={this.handleClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
          <Snackbar
            className="app-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

AppInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
