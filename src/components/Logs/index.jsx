import React, { Component } from 'react';
import { CircularProgress, Typography } from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { LazyLog, ScrollFollow } from 'react-lazylog';
import Spinner from 'react-spinkit';
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

function highlight(data) {
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
      connected: true,
    };
    this.loadLogs('constructor');
  }

  loadLogs = async (mode) => {
    if (mode !== 'constructor') {
      this.setState({ logs: this.state.logs });
    }
    const { data: logSession } = await api.getLogSession(this.props.app);
    this.setState({ reading: true, loading: false, connected: true, url: `/log-plex/${encodeURIComponent(logSession.logplex_url)}` });
  }

  handleLogError = () => {
    this.setState({ connected: false });
  }

  render() {
    const { loading, reading, connected, url } = this.state;
    const { app } = this.props;

    let status;
    if (connected) {
      status = <span style={{ color: 'green', fontSize: '1rem', marginRight: '12px' }}>&#9679;</span>;
    } else {
      status = <span style={{ color: 'red', fontSize: '1rem', marginRight: '12px' }}>&#9679;</span>;
    }
    if (loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    } else if (reading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={{ padding: '12px', backgroundColor: '#222222', color: '#d6d6d6', display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px solid grey' }}>
            <div style={{ marginRight: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {status}
              <Typography variant="subtitle1" color="inherit" style={{ marginRight: '12px' }}>{`Logs for ${app}`}</Typography>
            </div>
            {connected && (
              <span style={{ maxHeight: '15px' }}><Spinner name="three-bounce" color="#d6d6d6" /></span>
            )}
          </div>
          <ScrollFollow
            startFollowing
            render={({ follow, onScroll }) => (
              <LazyLog
                stream
                url={url}
                follow={follow}
                onScroll={onScroll}
                height={500}
                formatPart={data => highlight(data)}
                extraLines={1}
                onError={this.handleLogError}
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
