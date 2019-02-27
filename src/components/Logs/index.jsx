import React, { Component } from 'react';
import { CircularProgress, Typography, IconButton } from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Refresh } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { LazyLog, ScrollFollow } from 'react-lazylog';
import Loading from 'react-lazylog/build/Loading';
import Ansi from 'ansi-to-react';
import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiIconButton: {
      root: {
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.15)',
        },
        padding: '6px',
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
      height: '350px',
      paddingTop: '100px',
      paddingBottom: '100px',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  logsHeader: {
    loading: {
      position: 'inherit',
      maxHeight: '30px',
      transform: 'none',
      top: 'auto',
      left: 'auto',
    },
    rootContainer: {
      padding: '12px',
      backgroundColor: '#222222',
      color: '#d6d6d6',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      borderBottom: '1px solid grey',
    },
    statusContainer: {
      marginRight: '12px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      marginRight: '6px',
    },
    statusIcon: {
      fontSize: '1rem',
      marginRight: '12px',
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
      url: '',
      connected: true,
      reload: false,
    };
    this.loadLogs();
  }

  loadLogs = async () => {
    const { data: logSession } = await api.getLogSession(this.props.app);
    this.setState({ reading: true, loading: false, connected: true, url: `/log-plex/${encodeURIComponent(logSession.logplex_url)}` });
  }

  handleLogDisconnect = () => {
    this.setState({ connected: false });
  }

  reset = () => {
    this.setState({ reload: true }, () => this.setState({ reload: false, connected: true }));
  }

  render() {
    const { loading, reading, connected, url, reload } = this.state;
    const { app } = this.props;
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
          <div style={style.logsHeader.rootContainer}>
            <div style={style.logsHeader.statusContainer}>
              <span style={{ ...style.logsHeader.statusIcon, color: connected ? 'green' : 'red' }}>&#9679;</span>
              <Typography variant="subtitle1" color="inherit" style={style.logsHeader.statusText}>{`Logs for ${app}`}</Typography>
            </div>
            {connected ? (
              <Loading style={style.logsHeader.loading} />
            ) : (
              <IconButton onClick={this.reset}><Refresh nativeColor="white" /></IconButton>
            )}
          </div>
          {!reload && (
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
                  onError={this.handleLogDisconnect}
                  onLoad={this.handleLogDisconnect}
                />
              )}
            />
          )}
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
