import React, { Component } from 'react';
import { CircularProgress } from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { LazyLog, ScrollFollow } from 'react-lazylog';
import Ansi from 'ansi-to-react';
import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
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
  return <Ansi className="ansi">{data.replace(/^([A-z0-9\:\-\+\.]+Z) ([A-z\-0-9]+) ([A-z\.0-9\/\[\]\-]+)\: /gm, '\u001b[36m$1\u001b[0m $2 \u001b[38;5;104m$3:\u001b[0m ')}</Ansi>; // eslint-disable-line
}

export default class Logs extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      reading: false,
      logs: 'Logplex ready, waiting for logs..\n',
      url: '',
    };
    this.loadLogs('constructor');
  }

  loadLogs(mode) {
    if (mode !== 'constructor') {
      this.setState({ logs: this.state.logs });
    }
    api.getLogSession(this.props.app).then((response) => {
      this.setState({ reading: true, loading: false, url: `/log-plex/${encodeURIComponent(response.data.logplex_url)}` });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    } else if (this.state.reading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <ScrollFollow
            startFollowing
            render={({ follow, onScroll }) => (
              <LazyLog
                stream
                url={this.state.url}
                follow={follow}
                onScroll={onScroll}
                height={500}
                formatPart={data => highlight(data)}
                extraLines={1}
              />
            )}
          />
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div />
      </MuiThemeProvider>
    );
  }
}

Logs.propTypes = {
  app: PropTypes.string.isRequired,
};
