import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, TextField, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
});

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

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="config-key"
              floatingLabelText="Key"
              value={this.state.key}
              onChange={this.handleKeyTextChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
            />
            <p>
              Config Var Key
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              className="config-value"
              floatingLabelText="Value"
              multiLine
              fullWidth
              value={this.state.value}
              onChange={this.handleValueChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
            />
            <p>
              Config Var Value
            </p>
          </div>
        );
        // need this otherwise "You're a long way ..." shows up when you hit finish
      case 2:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
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
        finished: stepIndex >= 1,
        loading: stepIndex >= 1,
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

  submitConfig = () => {
    api.patchConfig(this.props.app, this.state.key, this.state.value).then(() => {
      this.props.onComplete('Added Config Var');
    }).catch((error) => {
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
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 58px', overflow: 'hidden' };
    if (finished) {
      this.submitConfig();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (
            <Button
              className="back"
              label="Back"
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
          >{stepIndex === 1 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel>Describe Var</StepLabel>
            </Step>
            <Step>
              <StepLabel>Input Value</StepLabel>
            </Step>
          </Stepper>
          {
            <Collapse in={!loading}>
              {this.renderContent()}
            </Collapse>
          }
          <Dialog
            className="new-config-error"
            open={this.state.submitFail}
          >
            <DialogTitle>
              Error
            </DialogTitle>
            <DialogContent>
              {this.state.submitMessage}
            </DialogContent>
            <DialogActions>
              <Button
                className="ok"
                label="Ok"
                color="primary"
                onClick={this.handleClose}
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

NewConfigVar.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
