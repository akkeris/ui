import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@material-ui/core';
import BaseComponent from '../../BaseComponent';

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

export default class Logs extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      logs: '',
      loading: true,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    intv = setInterval(async () => {
      try {
        const {
          data: buildResult,
        } = await this.api.getBuildResult(this.props.app, this.props.build);
        const logs = buildResult.lines.join('\n');
        if (!this.props.open || !buildResult.build || (buildResult.build.status !== 'pending' && buildResult.build.status !== 'queued')) {
          clearInterval(intv);
        }
        this.setState({ logs, loading: false });
        this.scrollBuildDown();
      } catch (error) {
        if (!this.isCancel(error)) {
          clearInterval(intv);
          this.setState({
            loading: false,
          });
        }
      }
    }, 1000);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
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
      <pre style={style.logs}>{this.state.logs}</pre>
    );
  }
}

Logs.propTypes = {
  build: PropTypes.string.isRequired,
  app: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
};
