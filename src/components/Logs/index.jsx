import React from 'react';
import deepmerge from 'deepmerge';
import { CircularProgress, Typography, IconButton } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Refresh, Fullscreen, FullscreenExit } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { LazyLog, ScrollFollow } from 'react-lazylog';
import Loading from 'react-lazylog/build/Loading';
import Ansi from 'ansi-to-react';
import BaseComponent from '../../BaseComponent';

// https://gist.github.com/tcase360/3d0e370eca06189f025670d7dd40fe30
const debounce = (fn, time) => {
  let timeout;
  return function () { // eslint-disable-line
    const functionCall = () => fn.apply(this, arguments);
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  };
};

const theme = parentTheme => deepmerge(parentTheme, {
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
  expanded: {
    position: 'absolute',
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    right: '0',
    left: '0',
    border: '2px solid white',
    borderRadius: '4px',
    overflow: 'hidden',
    top: '0',
    bottom: '0',
    marginTop: '75px',
    marginBottom: 'auto',
    height: '90%',
    zIndex: '1000',
  },
};

function highlight(data) {
  return <Ansi className="ansi">{data.replace(/^([A-z0-9\:\-\+\.]+Z) ([A-z\-0-9]+) ([A-z\.0-9\/\[\]\-]+)\: /gm, '\u001b[36m$1\u001b[0m $2 \u001b[38;5;104m$3:\u001b[0m ')}</Ansi>; // eslint-disable-line
}

export default class Logs extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      reading: false,
      url: '',
      connected: true,
      reload: false,
      expanded: false,
      expandedHeight: 0,
    };
    this.loadLogs();
  }

  componentDidMount() {
    super.componentDidMount();
    window.addEventListener('resize', debounce(this.resize, 150));
  }

  componentDidUpdate() {
    this.resize();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener('resize', debounce(this.resize, 150));
  }

  resize = () => {
    if (this.divElement !== undefined && this.state.expandedHeight !== this.divElement.clientHeight - 60) {
      this.setState({ expandedHeight: this.divElement.clientHeight - 60 });
    }
  }

  loadLogs = async () => {
    try {
      const { data: logSession } = await this.api.getLogSession(this.props.app);
      this.setState({ reading: true, loading: false, connected: true, url: `/log-plex/${encodeURIComponent(logSession.logplex_url)}` });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  handleLogDisconnect = () => {
    this.setState({ connected: false });
  }

  reset = () => {
    this.setState({ reload: true }, () => this.setState({ reload: false, connected: true }));
  }

  render() {
    const { loading, reading, connected, url, reload, expanded, expandedHeight } = this.state;
    const { app } = this.props;
    if (loading) {
      return (
        <MuiThemeProvider theme={theme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    } else if (reading) {
      return (
        <MuiThemeProvider theme={theme}>
          <div style={expanded ? style.expanded : undefined} ref={(divElement) => { this.divElement = divElement; }}>
            <div style={style.logsHeader.rootContainer}>
              <div style={style.logsHeader.statusContainer}>
                <span style={{ ...style.logsHeader.statusIcon, color: connected ? 'green' : 'red' }}>&#9679;</span>
                <Typography variant="subtitle1" color="inherit" style={style.logsHeader.statusText}>{`Logs for ${app}`}</Typography>
              </div>
              {connected ? (
                <Loading style={style.logsHeader.loading} />
              ) : (
                <IconButton onClick={this.reset}><Refresh htmlColor="white" /></IconButton>
              )}
              {expanded ? (
                <IconButton onClick={() => this.setState({ expanded: false })} style={{ marginLeft: 'auto' }}><FullscreenExit htmlColor="white" /></IconButton>
              ) : (
                <IconButton onClick={() => this.setState({ expanded: true })} style={{ marginLeft: 'auto' }}><Fullscreen htmlColor="white" /></IconButton>
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
                    height={expanded ? expandedHeight : 500}
                    formatPart={data => highlight(data)}
                    extraLines={1}
                    onError={this.handleLogDisconnect}
                    onLoad={this.handleLogDisconnect}
                  />
                )}
              />
            )}
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider theme={theme}>
        <div />
      </MuiThemeProvider>
    );
  }
}

Logs.propTypes = {
  app: PropTypes.string.isRequired,
};
