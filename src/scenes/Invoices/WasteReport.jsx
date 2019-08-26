import React, { Component } from 'react';
import {
  Paper, List, ListSubheader, CircularProgress, LinearProgress,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import api from '../../services/api';
import recommendations from '../../services/util/recommendations';

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
  loading: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '0 40px 20px',
    },
    label: {
      color: 'rgba(0,0,0,0.8)',
      paddingBottom: '10px',
    },
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
      loadingRecommendations: true,
      appNotes: [],
      progress: 0,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { data: sizes } = await api.getFormationSizes();
    let { data: apps } = await api.getApps();
    apps = apps.filter(x => x.organization.name === this.props.match.params.org);
    this.setState({
      sizes,
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

    const next = () => {
      this.setState({ progress: ((totalRequests - queue.length) / totalRequests) * 100 });
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
  }

  getAppRecommendations = async () => {
    const appNotes = [];

    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array); // eslint-disable-line
      }
    }

    await asyncForEach(this.state.apps, async (app) => {
      const notes = await recommendations.execute(
        app.metrics,
        app.formations,
        app.addons,
        this.state.sizes,
      );
      appNotes.push({ name: app.name, notes });
    });

    this.setState({ appNotes, loadingRecommendations: false });
  }

  renderAppRecommendations() {
    const results = [];
    this.getAppRecommendations();
    if (this.state.loadingRecommendations) {
      return (
        <div style={style.loading.container}>
          <span style={style.loading.label}>Loading recommendations...</span>
          <LinearProgress variant="indeterminate" />
        </div>
      );
    }

    this.state.apps.forEach((app) => {
      const notes = this.state.appNotes.find(note => note.name === app.name);

      if (notes.length > 0) {
        results.push(
          <div key={`recommend_${app.name}`} className="recommendations" style={style.recommendations}>
            <ListSubheader>{app.name}</ListSubheader>
            <ul>
              {notes}
            </ul>
          </div>,
        );
      }
    });

    if (results.length === 0) {
      results.push(
        <div key={'reccomend_empty'} style={style.recommendations}>
          <ListSubheader>
            No recommendations available for {this.props.match.params.org}
          </ListSubheader>
        </div>,
      );
    }
    return results;
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="invoices" style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    } else if (this.state.analyzing) {
      return (
        <div className="invoices">
          <Paper style={style.paper}>
            <div className="internal">
              <span style={style.label}>Analyzing...</span>
              <LinearProgress variant="determinate" value={this.state.progress} />
            </div>
          </Paper>
        </div>
      );
    }
    return (
      <div className="invoices">
        <Paper style={style.paper}>
          <div style={style.header}>Cost Report for {this.props.match.params.org}</div>
          <List>
            {this.renderAppRecommendations()}
          </List>
        </Paper>
      </div>
    );
  }
}

WasteReport.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
