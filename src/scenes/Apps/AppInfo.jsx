import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import { Card, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
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
      dynosActive: false,
      releasesActive: false,
      addonsActive: false,
      configActive: false,
      logsActive: false,
      metricsActive: false,
      webhooksActive: false,
    };
  }

  componentDidMount() {
    api.getApp(this.props.match.params.app).then((response) => {
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

  infoTabActive = () => {
    this.setState({
      dynosActive: false,
      releasesActive: false,
      addonsActive: false,
      configActive: false,
      logsActive: false,
      metricsActive: false,
      webhooksActive: false,
    });
  }
  dynosTabActive = () => {
    this.setState({
      dynosActive: true,
      releasesActive: false,
      addonsActive: false,
      configActive: false,
      logsActive: false,
      metricsActive: false,
      webhooksActive: false,
    });
  }
  releasesTabActive = () => {
    this.setState({
      dynosActive: false,
      releasesActive: true,
      addonsActive: false,
      configActive: false,
      logsActive: false,
      metricsActive: false,
      webhooksActive: false,
    });
  }
  addonsTabActive = () => {
    this.setState({
      dynosActive: false,
      releasesActive: false,
      addonsActive: true,
      configActive: false,
      logsActive: false,
      metricsActive: false,
      webhooksActive: false,
    });
  }
  webhooksTabActive = () => {
    this.setState({
      dynosActive: false,
      releasesActive: false,
      addonsActive: false,
      configActive: false,
      logsActive: false,
      metricsActive: false,
      webhooksActive: true,
    });
  }
  configTabActive = () => {
    this.setState({
      dynosActive: false,
      releasesActive: false,
      addonsActive: false,
      configActive: true,
      logsActive: false,
      metricsActive: false,
      webhooksActive: false,
    });
  }
  metricsTabActive = () => {
    this.setState({
      dynosActive: false,
      releasesActive: false,
      addonsActive: false,
      configActive: false,
      logsActive: false,
      metricsActive: true,
      webhooksActive: false,
    });
  }
  logsTabActive = () => {
    this.setState({
      dynosActive: false,
      releasesActive: false,
      addonsActive: false,
      configActive: false,
      logsActive: true,
      metricsActive: false,
      webhooksActive: false,
    });
  }

  render() {
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
                  onTouchTap={this.handleNotFoundClose}
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
            <Tabs>
              <Tab
                className="info-tab"
                icon={<InfoIcon />}
                label="Info"
                onActive={this.infoTabActive}
              >
                <AppOverview app={this.state.app} onComplete={this.reload} />
              </Tab>
              <Tab
                className="dynos-tab"
                icon={<CPUIcon />}
                label="Dynos"
                onActive={this.dynosTabActive}
              >
                <Formations
                  app={this.state.app.name}
                  active={this.state.dynosActive}
                />
              </Tab>
              <Tab
                className="releases-tab"
                icon={<ReleaseIcon />}
                label="Activity"
                onActive={this.releasesTabActive}
              >
                <Releases
                  app={this.state.app.name}
                  active={this.state.releasesActive}
                />
              </Tab>
              <Tab
                className="addons-tab"
                icon={<AddonIcon />}
                label="Addons"
                onActive={this.addonsTabActive}
              >
                <Addons
                  app={this.state.app.name}
                  active={this.state.addonsActive}
                />
              </Tab>
              <Tab
                className="webhooks-tab"
                icon={<WebhookIcon />}
                label="Webhooks"
                onActive={this.webhooksTabActive}
              >
                <Webhooks
                  app={this.state.app.name}
                  active={this.state.webhooksActive}
                />
              </Tab>

              <Tab
                className="config-tab"
                icon={<ConfigIcon />}
                label="Config"
                onActive={this.configTabActive}
              >
                <Config
                  app={this.state.app.name}
                  active={this.state.configActive}
                />
              </Tab>
              <Tab
                className="metrics-tab"
                icon={<MetricIcon />}
                label="Metrics"
                onActive={this.metricsTabActive}
              >
                <Metrics
                  active={this.state.metricsActive}
                  app={this.state.app.name}
                  appName={this.state.app.simple_name}
                  space={this.state.app.space.name}
                />
              </Tab>
              <Tab
                className="logs-tab"
                icon={<LogIcon />}
                label="Logs"
                onActive={this.logsTabActive}
              >
                <Logs
                  active={this.state.logsActive}
                  app={this.state.app.name}
                  appName={this.state.app.simple_name}
                  space={this.state.app.space.name}
                />
              </Tab>
            </Tabs>
          </Card>
          <Dialog
            className="app-error"
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                label="Ok"
                primary
                onTouchTap={this.handleClose}
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
};
