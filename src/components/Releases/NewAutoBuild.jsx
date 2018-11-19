import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Step, Stepper, StepLabel, Button, TextField, Collapse,
  FormGroup, FormControlLabel, Switch, Typography, FormControl, Radio, RadioGroup, FormLabel,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#0097a7',
    },
  },
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
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

export default class NewAutoBuild extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      errorText: null,
      branch: '',
      repo: '',
      autoDeploy: true,
      username: null,
      token: null,
      statusCheck: true,
      userSelection: 'bot',
    };
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="Repo"
              label="Repo"
              value={this.state.repo}
              onChange={this.handleChange('repo')}
              helperText={this.state.errorText}
              error={this.state.errorText && this.state.errorText.length > 0}
            />
            <Typography variant="body">
              The repo URL (e.g., https://github.com/foo/bar)
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField label="Master" value={this.state.branch} onChange={this.handleChange('branch')} />
            <Typography variant="body">
              The branch on the repo to watch and deploy from
            </Typography>
          </div>
        );
      case 2:
        return (
          <div>
            <FormControl component="fieldset" className="FormControl">
              <FormLabel component="legend">GitHub User</FormLabel>
              <RadioGroup
                name="User Selection"
                className="UserRadio"
                value={this.state.userSelection}
                onChange={this.handleChange('userSelection')}
              >
                <FormControlLabel value="bot" control={<Radio />} label="Service Account" />
                <FormControlLabel value="user" control={<Radio />} label="User Account" />
                {this.state.userSelection === 'user' && (
                  <div>
                    <TextField
                      label="User"
                      value={this.state.username}
                      onChange={this.handleChange('username')}
                      helperText={this.state.errorText}
                      error={this.state.errorText && this.state.errorText.length > 0}
                    />
                    <Typography variant="body">
                      The username to access repo as
                    </Typography>
                    <TextField
                      label="Token"
                      value={this.state.token}
                      onChange={this.handleChange('token')}
                      helperText={this.state.errorText}
                      error={this.state.errorText && this.state.errorText.length > 0} 
                    />
                    <Typography variant="body">
                      The users token
                    </Typography>
                  </div>
                )}
              </RadioGroup>
            </FormControl>
          </div>
        );
      case 3:
        return (
          <div>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.autoDeploy}
                    onChange={this.handleAutoDeploy}
                    color="primary"
                  />
                }
                label="Auto Deploy"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.statusCheck}
                    onChange={this.handleStatusCheck}
                    color="primary"
                  />
                }
                label="Status Check"
              />
            </FormGroup>
          </div>
        );
      // Have to have this otherwise it displays "you're a long way from home sonny jim" on submit
      case 4:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if ((stepIndex === 0 && this.state.repo === '') || (stepIndex === 2 && (this.state.userSelection === 'user' && (!this.state.username || !this.state.token)))) {
      this.setState({ errorText: 'field required' });
    } else if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 3,
        loading: stepIndex >= 3,
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

  // Handles changes for repo, username, branch
  handleChange = name => (event) => {
    if (event.target.value === 'bot' && name === 'userSelection') {
      this.setState({
        [name]: event.target.value,
        username: null,
        token: null,
      });
    } else {
      this.setState({ [name]: event.target.value });
    }
  }

  handleAutoDeploy = (event, isInputChecked) => {
    this.setState({ autoDeploy: isInputChecked });
  }

  handleStatusCheck = (event, isInputChecked) => {
    this.setState({ statusCheck: isInputChecked });
  }

  submitBuild = () => {
    api.createAutoBuild(this.props.app, this.state.repo, (this.state.branch === '' ? 'master' : this.state.branch), this.state.statusCheck, this.state.autoDeploy, this.state.username, this.state.token).then(() => {
      this.props.onComplete('Auto Build Connected');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        branch: '',
        repo: '',
        autoDeploy: true,
        username: null,
        statusCheck: true,
      });
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'hidden' };
    if (finished) {
      this.submitBuild();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (<Button
            className="back"
            disabled={stepIndex === 0}
            onClick={this.handlePrev}
            style={style.buttons.back}
          >Back</Button>)}
          <Button
            variant="contained"
            className="next"
            color="primary"
            onClick={this.handleNext}
          >{stepIndex === 3 ? 'Finish' : 'Next'}</Button>
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
              <StepLabel>Input Repo</StepLabel>
            </Step>
            <Step>
              <StepLabel>Input Branch</StepLabel>
            </Step>
            <Step>
              <StepLabel>Input GitHub User</StepLabel>
            </Step>
            <Step>
              <StepLabel>Options</StepLabel>
            </Step>
          </Stepper>
          {
            <Collapse in={!loading}>
              {this.renderContent()}
            </Collapse>
          }
          <Dialog open={this.state.submitFail}>
            <DialogTitle>
              <Typography variant="h6">
                Error
              </Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {this.state.submitMessage}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button label="Ok" color="primary" onClick={this.handleClose}>Ok</Button>
            </DialogActions>
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

NewAutoBuild.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
