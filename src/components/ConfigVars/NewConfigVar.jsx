import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, TextField, Collapse,
  Typography,
} from '@material-ui/core';
import ConfirmationModal from '../ConfirmationModal';

import api from '../../services/api';

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
  h6: {
    marginBottom: '12px',
  },
  bold: {
    fontWeight: 'bold',
  },
};

export default class NewConfigVar extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      errorText: null,
      key: '',
      value: '',
    };
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if ((stepIndex === 1 && this.state.value === '') || (stepIndex === 0 && this.state.key === '')) {
      this.setState({ errorText: 'field required' });
    } else if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 2,
        loading: stepIndex >= 2,
        errorText: null,
      });
    }
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex - 1,
        loading: false,
        errorText: null,
      });
    }
  }

  handleKeyTextChange = (event) => {
    this.setState({
      key: event.target.value,
    });
  }

  handleValueChange = (event) => {
    this.setState({
      value: event.target.value,
    });
  }

  submitConfig = async () => {
    try {
      await api.patchConfig(this.props.app, this.state.key, this.state.value);
      this.props.onComplete('Added Config Var');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        errorText: null,
        key: '',
        value: '',
      });
    }
  }

  renderStepContent(stepIndex) {
    const { key, errorText, value } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="config-key"
              label="Key"
              value={key}
              onChange={this.handleKeyTextChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Config Var Key'}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              className="config-value"
              label="Value"
              multiline
              fullWidth
              value={value}
              onChange={this.handleValueChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Config Var Value'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div className="new-config-summary">
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The environment variable '}
              <span style={style.bold}>{key}</span>
              {' = '}
              <span style={style.bold}>{value}</span>
              {' will be added to this app.'}
            </Typography>
          </div>
        );
        // need this otherwise "You're a long way ..." shows up when you hit finish
      case 3:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  render() {
    const { loading, stepIndex, submitFail, submitMessage, finished, key, value } = this.state;
    const contentStyle = { margin: '0 56px' };
    if (finished) {
      this.submitConfig();
    }

    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;

    return (
      <div style={style.stepper}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(key)}>
                Key Name
            </StepLabel>
          </Step>
          <Step>
            <StepLabel className="step-1-label" optional={stepIndex > 1 && renderCaption(value)}>
                Key Value
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirm</StepLabel>
          </Step>
        </Stepper>
        <Collapse in={!loading}>
          <div style={contentStyle}>
            <div>{this.renderStepContent(stepIndex)}</div>
            <div style={style.buttons.div}>
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
              >{stepIndex === 2 ? 'Finish' : 'Next'}</Button>
            </div>
          </div>
        </Collapse>
        <ConfirmationModal
          open={submitFail}
          onOk={this.handleClose}
          message={submitMessage}
          title="Error"
          className="new-config-error"
        />
      </div>
    );
  }
}

NewConfigVar.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
