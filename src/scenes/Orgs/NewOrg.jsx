import React, { Component } from 'react';
import {
  Step, Stepper, StepLabel, Button, TextField, Collapse, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

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
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
  div: {
    width: '100%',
    margin: 'auto',
  },
};

export default class NewOrg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      finished: false,
      errorText: null,
      stepIndex: 0,
      org: '',
      description: '',
      submitFail: false,
      submitMessage: '',
    };
  }

  handleNext = () => {
    if ((this.state.stepIndex === 0 && this.state.org === '') || (this.state.stepIndex === 1 && this.state.description === '')) {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      if (!this.state.loading) {
        this.setState({
          loading: stepIndex >= 1,
          stepIndex: stepIndex + 1,
          finished: stepIndex >= 1,
          errorText: null,
        });
      }
    }
  };

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        loading: false,
        stepIndex: stepIndex - 1,
        errorText: null,
      });
    }
  };

  handleOrgChange = (event) => {
    this.setState({
      org: event.target.value,
    });
  };

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  };

  handleDescriptionChange = (event) => {
    this.setState({
      description: event.target.value,
    });
  };

  submitOrg = async () => {
    try {
      await api.createOrg(this.state.org, this.state.description);
      window.location = '#/orgs';
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        org: '',
        description: '',
        loading: false,
      });
    }
  };

  renderStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="org-name"
              label="Org name"
              value={this.state.org}
              onChange={this.handleOrgChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
            />
            <p>
              Create an akkeris org! Enter a name that will define your org.
              This org will be used for attribution and grouping of apps/spaces.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              className="org-description"
              label="Org description"
              value={this.state.description}
              onChange={this.handleDescriptionChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
            />
            <p>
              Give a description of your org.
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

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 58px', overflow: 'hidden' };

    if (finished) {
      this.submitOrg();
    }

    return (
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
          >{stepIndex === 1 ? 'Submit' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;

    return (
      <MuiThemeProvider theme={muiTheme}>
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex}>
              <Step>
                <StepLabel>Create org name</StepLabel>
              </Step>
              <Step>
                <StepLabel>Describe org </StepLabel>
              </Step>
            </Stepper>
            {
              <Collapse in={!loading}>
                {this.renderContent()}
              </Collapse>
            }
            <Dialog
              className="error"
              open={this.state.submitFail}
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>{this.state.submitMessage}</DialogContent>
              <DialogActions>
                <Button
                  className="ok"
                  color="primary"
                  onClick={this.handleClose}
                >OK</Button>
              </DialogActions>
            </Dialog>
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }
}
