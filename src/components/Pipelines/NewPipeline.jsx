import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, TextField, CircularProgress, Typography,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import ConfirmationModal from '../ConfirmationModal';
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
  stepper: {
    width: '100%',
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

export default class NewPipeline extends Component {
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
      await api.createPipeline(this.state.pipeline);
      this.props.onComplete('Pipeline Added');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        errorText: null,
        pipeline: '',
      });
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
                >Back</Button>
              )}
              <Button
                variant="contained"
                className="next"
                color="primary"
                onClick={this.handleNext}
              >{stepIndex === 0 ? 'Finish' : 'Next'}</Button>
            </span>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { stepIndex, submitFail, submitMessage } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
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
