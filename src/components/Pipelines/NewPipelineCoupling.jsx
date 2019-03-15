import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Collapse, Typography,
} from '@material-ui/core';

import api from '../../services/api';
import AutoSuggest from '../AutoSuggest';
import util from '../../services/util';

const style = {
  stepper: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
  },
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 12,
    },
    back: {
      marginRight: 12,
    },
  },
  stepDescription: {
    marginTop: '24px',
  },
};

export default class NewPipelineCoupling extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      errorText: null,
      stepIndex: 0,
      apps: [],
      app: '',
    };
  }

  componentDidMount() {
    this.getApps();
  }

  getApps = async () => {
    const { data: apps } = await api.getApps();
    this.setState({ apps, loading: false });
  }

  handleSearch = (searchText) => {
    this.setState({ app: searchText });
    this.handleNext();
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        loading: stepIndex >= 0,
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 0,
        errorText: null,
      });
    }
  };

  submitPipelineCoupling = async () => {
    try {
      await api.createPipelineCoupling(this.props.pipeline, this.state.app, this.props.stage);
      this.props.onComplete('Coupling Added');
    } catch (error) {
      this.setState({
        finished: false,
        stepIndex: 0,
        errorText: null,
        app: '',
        loading: false,
      });
      this.props.onError(error.response.data);
    }
  };

  renderStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <AutoSuggest
              className={`${this.props.stage}-app-search`}
              label="App"
              data={util.filterName(this.state.apps)}
              handleSearch={this.handleSearch}
              color="black"
              errorText={this.state.errorText}
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'The application name or id to add to the pipeline (e.g. my-test-app-dev).'}
            </Typography>
          </div>
        );
      case 1:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  render() {
    const { finished, loading, stepIndex } = this.state;

    if (finished) {
      this.submitPipelineCoupling();
    }

    const contentStyle = { margin: '0 0 40px 57px' };

    return (
      <div style={style.stepper}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Select App</StepLabel>
          </Step>
        </Stepper>
        <Collapse in={!loading}>
          <div style={contentStyle}>
            <div>{this.renderStepContent(stepIndex)}</div>
          </div>
        </Collapse>
      </div>
    );
  }
}

NewPipelineCoupling.propTypes = {
  pipeline: PropTypes.string.isRequired,
  stage: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};
