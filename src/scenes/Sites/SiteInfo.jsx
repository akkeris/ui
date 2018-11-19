import React, { Component } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import {
  Tab, Tabs, CircularProgress, Snackbar, Card, CardHeader, Button,
  Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import MapIcon from '@material-ui/icons/Map';
import PropTypes from 'prop-types';

import SiteOverView from '../../components/Sites/SiteOverview';
import RouteList from '../../components/Sites/RouteList';
import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: {       main: '#0097a7',     },
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
  },
});

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '15%',
      marginBottom: '5%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
      color: 'white',
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

  changeActiveTab = (event, newTab) => {
    if (this.state.currentTab !== newTab) {
      this.setState({
        currentTab: newTab,
      });
      this.props.history.push(`${newTab}`);
    }
  }

  render() {
    const { currentTab } = this.state;
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
            <Dialog
              className="not-found-error"
              open={this.state.submitFail}
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>{this.state.submitMessage}</DialogContent>
              <DialogActions>
                <Button
                  className="ok"
                  color="primary"
                  onClick={this.handleNotFoundClose}
                >Ok</Button>
              </DialogActions>
            </Dialog>
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <Card className="card" style={style.card}>
            <CardHeader
              className="header"
              title={this.state.site.domain}
              subheader={this.state.site.region.name}
            />
            <Tabs
              fullWidth
              value={this.state.currentTab}
              onChange={this.changeActiveTab}
              scrollButtons="off"
            >
              <Tab
                className="info-tab"
                icon={<InfoIcon />}
                label="Info"
                value="info"
              />
              <Tab
                className="routes-tab"
                icon={<MapIcon />}
                label="Routes"
                value="routes"
              />
            </Tabs>
            {currentTab === 'info' && <SiteOverView site={this.state.site} />}
            {currentTab === 'routes' && <RouteList site={this.state.site.domain} onError={this.handleError} />}
          </Card>
          <Dialog
            className="error"
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

SiteInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
