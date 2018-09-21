import React, { Component } from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { LazyStream, ScrollFollow } from 'react-lazylog';
import api from '../../services/api';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '350px',
      paddingTop: '100px',
      paddingBottom: '100px',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
};

// TODO: make it actually highlight, not currently used
function highlight(data) { // eslint-disable-line no-unused-vars
  return data.replace(/^([A-z0-9\:\-\+\.]+Z) ([A-z\-0-9]+) ([A-z\.0-9\/\[\]\-]+)\: /gm, '\u001b[36m$1\u001b[0m $2 \u001b[38;5;104m$3:\u001b[0m '); // eslint-disable-line
}

export default class Logs extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      reading: false,
      logs: 'Logplex ready, waiting for logs..\n',
      url: '',
    };
    this.loadLogs('constructor');
  }

  componentDidMount() {
    this._isMounted = true;
  }

  /*
  componentDidUpdate() {
    if (!this.state.reading) {
      this.loadLogs('update');
    }
  }
  */

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadLogs(mode) {
    if (this._isMounted) {
      if (mode !== 'constructor') {
        this.setState({ logs: this.state.logs, loading: true });
      }
      api.getLogSession(this.props.app).then((response) => {
        this.setState({ reading: true, loading: false, url: `/log-plex/${encodeURIComponent(response.data.logplex_url)}` });
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    } else if (this.state.reading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <ScrollFollow startFollowing>
            {({ follow, onScroll }) => (
              <LazyStream height={500} url={this.state.url} follow={follow} onScroll={onScroll} />
            )}
          </ScrollFollow>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div />
      </MuiThemeProvider>
    );
  }
}

Logs.propTypes = {
  app: PropTypes.string.isRequired,
};
