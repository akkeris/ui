import React from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel, Button, TextField, CircularProgress, Typography } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import deepmerge from 'deepmerge';
import ReactGA from 'react-ga';

import History from '../../config/History';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';


const style = {
  stepper: {
    width: '100%',
    margin: 'auto',
    maxWidth: 700,
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

export default class NewPipeline extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      finished: false,
      errorText: null,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      pipeline: '',
    };
  }

  theme = parentTheme => deepmerge(parentTheme, {
    overrides: {
      MuiStepper: {
        root: {
          padding: '24px 0px',
        },
      },
    },
  });

  handleNext = () => {
    if ((this.state.stepIndex === 0 && this.state.pipeline === '')) {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 0,
        errorText: null,
      });
    }
  };

  handlePrev = () => {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex - 1,
      errorText: null,
    });
  };

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  };

  handlePipelineChange = (event) => {
    this.setState({
      pipeline: event.target.value,
    });
  };

  submitPipeline = async () => {
    try {
      await this.api.createPipeline(this.state.pipeline);
      this.props.onComplete('Pipeline Added');
      ReactGA.event({
        category: 'PIPELINES',
        action: 'Created new pipeline',
      });
      History.get().push(`/pipelines/${this.state.pipeline}/review`);
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          finished: false,
          stepIndex: 0,
          errorText: null,
          pipeline: '',
        });
      }
    }
  };

  renderStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="pipeline-name"
              label="Name"
              type="text"
              value={this.state.pipeline}
              onChange={this.handlePipelineChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'The name of the pipeline, less than 24 characters, alpha numeric only.'}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div style={{ margin: '0 auto', width: '1%' }}><CircularProgress /></div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'hidden' };

    if (finished) {
      this.submitPipeline();
    }

    return (
      <div style={contentStyle}>
        <div>{this.renderStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex < 1 && (
            <span>
              {stepIndex > 0 && (
                <Button
                  className="back"
                  disabled={stepIndex === 0}
                  onClick={this.handlePrev}
                  style={style.buttons.back}
                >Back
                </Button>
              )}
              <Button
                variant="contained"
                className="next"
                color="primary"
                onClick={this.handleNext}
              >{stepIndex === 0 ? 'Finish' : 'Next'}
              </Button>
            </span>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { stepIndex, submitFail, submitMessage } = this.state;
    return (
      <MuiThemeProvider theme={this.theme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel>Create Pipeline</StepLabel>
            </Step>
          </Stepper>
          {this.renderContent()}
          <ConfirmationModal
            open={submitFail}
            onOk={this.handleClose}
            message={submitMessage}
            title="Error"
            className="new-pipeline-error"
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

NewPipeline.propTypes = {
  onComplete: PropTypes.func.isRequired,
};
