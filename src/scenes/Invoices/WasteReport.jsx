import React, { Component } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  Paper, List, ListSubheader, CircularProgress, LinearProgress,
} from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import PropTypes from 'prop-types';
import api from '../../services/api';
import recommendations from '../../services/util/recommendations';

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
});

/* eslint-disable no-console */

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
  toolbar: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  link: {
    textDecoration: 'none',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    marginBottom: '12px',
  },
  menu: {
    height: '48px',
    lineHeight: '48px',
  },
  label: {
    color: 'rgba(0,0,0,0.8)',
  },
  header: {
    padding: '1.5em 1em 1.25em 1em',
    fontSize: '1.75em',
    color: 'rgba(0,0,0,0.6)',
  },
  icon: {
    top: '0px',
  },
  recommendations: {
    margin: '0',
    boxShadow: 'none',
    maxWidth: '50000px',
    padding: '1em',
    borderTop: '1px solid rgba(0,0,0,0.2)',
  },
};

export default class WasteReport extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      sizes: [],
      apps: [],
      loading: true,
      analyzing: false,
      progress: 0,
    };
  }

  componentDidMount() {
    api.getFormationSizes().then((sResp) => {
      api.getApps().then((response) => {
        const apps = response.data.filter(x => x.organization.name === this.props.match.params.org);
        this.setState({
          sizes: sResp.data,
          apps,
          loading: false,
          analyzing: true,
          progress: 0,
        });
        const totalRequests = apps.length * 3;
        const queue = apps.map(x => api.getMetrics.bind(api, x.name))
          .concat(apps.map(x => api.getFormations.bind(api, x.name)))
          .concat(apps.map(x => api.getAppAddons.bind(api, x.name)));
        const results = [];
        const errors = [];
        const done = () => {
          results.forEach((x) => {
            let app = x.config.url.match(/\/api\/apps\/([A-z0-9-]+)\/.*/);
            console.assert(app[1], 'Application name cannot be found in the config uri from axios');
            app = app[1]; // eslint-disable-line prefer-destructuring
            if (x.config.url.indexOf('/formation') !== -1) {
              // formation
              apps.forEach((y) => {
                if (y.name === app) {
                  y.formations = x.data; // eslint-disable-line no-param-reassign
                }
              });
            } else if (x.config.url.indexOf('/metrics?') !== -1) {
              // metric
              apps.forEach((y) => {
                if (y.name === app) {
                  y.metrics = x.data; // eslint-disable-line no-param-reassign
                }
              });
            } else if (x.config.url.indexOf('/addons') !== -1) {
              // addons
              apps.forEach((y) => {
                if (y.name === app) {
                  y.addons = x.data; // eslint-disable-line no-param-reassign
                }
              });
            }
          });
          this.setState({ analyzing: false, progress: 100 });
        };
        const progress = () => {
          this.setState({ progress: ((totalRequests - queue.length) / totalRequests) * 100 });
        };
        const next = () => {
          progress();
          if (queue.length === 0) {
            console.assert(queue.length === 0 && totalRequests === (results.length + errors.length), 'We did not hear back from everyone.');
            done();
            return;
          }
          queue.shift()().then(process).catch(error); // eslint-disable-line no-use-before-define
        };
        let process = (result) => {
          results.push(result);
          next();
        };
        let error = (err) => {
          errors.push(err);
          next();
        };
        next();
      });
    });
  }

  getApps() {
    return this.state.apps.map((app) => {
      const notes = recommendations.execute(
        app.metrics,
        app.formations,
        app.addons,
        this.state.sizes,
      );
      if (notes.length > 0) {
        return (
          <div key={`recommend_${app.name}`} className="recommendations" style={style.recommendations}>
            <ListSubheader>{app.name}</ListSubheader>
            <ul>
              {notes}
            </ul>
          </div>
        );
      }
      return null;
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div className="invoices" style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    } else if (this.state.analyzing) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div className="invoices">
            <Paper style={style.paper}>
              <div className="internal">
                <span style={style.label}>Analyzing...</span>
                <LinearProgress mode="determinate" value={this.state.progress} />
              </div>
            </Paper>
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div className="invoices">
          <Paper style={style.paper}>
            <div style={style.header}>Cost Report for {this.props.match.params.org}</div>
            <List>
              {this.getApps()}
            </List>
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}

WasteReport.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
