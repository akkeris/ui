import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import { Card, CardHeader } from 'material-ui/Card';
import { Tabs, Tab } from 'material-ui/Tabs';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import InfoIcon from 'material-ui/svg-icons/action/info';
import MapIcon from 'material-ui/svg-icons/maps/place';

import SiteOverView from '../../components/Sites/SiteOverview';
import RouteList from '../../components/Sites/RouteList';
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

const tabs = ['info', 'routes'];

export default class SiteInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      site: null,
      loading: true,
      submitMessage: '',
      submitFail: false,
      message: '',
      currentTab: 'info',
      basePath: `/sites/${this.props.match.params.site}`,
      baseHash: `#/sites/${this.props.match.params.site}/`,
    };
  }

  componentDidMount() {
    api.getSite(this.props.match.params.site).then((response) => {
      const hashPath = window.location.hash;
      let currentTab = hashPath.replace(this.state.baseHash, '');
      if (!tabs.includes(currentTab)) {
        currentTab = 'info';
        window.location.hash = `${this.state.baseHash}info`;
      }
      this.setState({ currentTab });
      this.setState({
        site: response.data,
        loading: false,
      });
    }).catch((error) => {
      this.setState({
        submitFail: true,
        submitMessage: error.response.data,
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

  handleError = (message) => {
    this.setState({
      submitMessage: message,
      submitFail: true,
      loading: false,
      open: false,
      message: '',
    });
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleNotFoundClose = () => {
    window.location = '/#/sites';
  }

  reload = (message) => {
    this.setState({
      open: true,
      message,
    });
  }

  changeActiveTab = (newTab) => {
    this.setState({
      currentTab: newTab.props.value,
    });
    this.props.history.push(`${newTab.props.value}`);
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
                  className="ok"
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
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Card className="card" style={style.card}>
            <CardHeader
              className="header"
              title={this.state.site.domain}
              subtitle={this.state.site.region.name}
            />
            <Tabs value={this.state.currentTab}>
              <Tab
                className="info-tab"
                icon={<InfoIcon />}
                label="Info"
                value="info"
                onActive={this.changeActiveTab}
              >
                <SiteOverView site={this.state.site} />
              </Tab>
              <Tab
                className="routes-tab"
                icon={<MapIcon />}
                label="Routes"
                value="routes"
                onActive={this.changeActiveTab}
              >
                <RouteList site={this.state.site.domain} onError={this.handleError} />
              </Tab>
            </Tabs>
          </Card>
          <Dialog
            className="error"
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                className="ok"
                label="Ok"
                primary
                onTouchTap={this.handleClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
          <Snackbar
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

SiteInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
