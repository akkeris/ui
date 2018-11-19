import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: {       main: '#0097a7',     },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
});

const style = {
  logs: {
    backgroundColor: 'rgba(0,0,0,0.025)',
    color: '#666',
    padding: '16px',
    margin: '0px',
    fontSize: '12px',
    height: '500px',
    overflow: 'scroll',
    boxSizing: 'border-box',
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '80px',
      height: '500px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
};
let intv = null;

export default class Logs extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      logs: '',
      loading: true,
    };
  }

  componentDidMount() {
    intv = setInterval(() => {
      api.getBuildResult(this.props.app, this.props.build)
        .then((response) => {
          const logs = response.data.lines.join('\n');
          if (!this.props.open || !response.data.build || (response.data.build.status !== 'pending' && response.data.build.status !== 'queued')) {
            clearInterval(intv);
          }
          this.setState({
            logs,
            loading: false,
          });
          this.scrollBuildDown();
        }).catch(() => {
          clearInterval(intv);
          this.setState({
            loading: false,
          });
        });
    }, 1000);
  }

  componentWillUnmount() {
    if (intv) {
      clearInterval(intv);
    }
  }

  scrollBuildDown = () => {
    const objDiv = document.querySelector('pre');
    if (objDiv) {
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress size={50} style={style.refresh.indicator} />
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <pre style={style.logs}><code>{this.state.logs}</code></pre>
      </MuiThemeProvider>
    );
  }
}

Logs.propTypes = {
  build: PropTypes.string.isRequired,
  app: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
};
