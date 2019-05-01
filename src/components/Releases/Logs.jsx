import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@material-ui/core';
import Ansi from 'ansi-to-react';

import api from '../../services/api';

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
    intv = setInterval(async () => {
      try {
        const { data: buildResult } = await api.getBuildResult(this.props.app, this.props.build);
        const logs = buildResult.lines.join('\n');
        if (!this.props.open || !buildResult.build || (buildResult.build.status !== 'pending' && buildResult.build.status !== 'queued')) {
          clearInterval(intv);
        }
        this.setState({ logs, loading: false });
        this.scrollBuildDown();
      } catch (error) {
        clearInterval(intv);
        this.setState({
          loading: false,
        });
      }
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
        <div style={style.refresh.div}>
          <CircularProgress size={50} style={style.refresh.indicator} />
        </div>
      );
    }
    return (
      <pre style={style.logs}><Ansi>{this.state.logs}</Ansi></pre>
    );
  }
}

Logs.propTypes = {
  build: PropTypes.string.isRequired,
  app: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
};
