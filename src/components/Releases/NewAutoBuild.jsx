import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Step, Stepper, StepLabel, Button, TextField, Collapse,
  FormGroup, FormControlLabel, Switch, Typography,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
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
      loading: true,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      branch: '',
      repo: '',
      autoDeploy: true,
      username: '',
      token: null,
      statusCheck: true,
    };
  }

  componentDidMount() {
    api.gitHubAuth().then((response) => {
      this.setState({
        token: response.data.token,
        loading: false,
      });
    }).catch((error) => {
      if (error.response.status === 404) {
        window.location = `/github/oauth?url=${encodeURIComponent(window.location)}`;
      }
    });
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField label="Repo" value={this.state.repo} onChange={this.handleChange('repo')} />
            <p>
              The repo URL (e.g., https://github.com/foo/bar)
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField label="Branch (defaults Master)" value={this.state.branch} onChange={this.handleChange('branch')} />
            <p>
              The branch on the repo to watch and deploy from
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField label="User" value={this.state.username} onChange={this.handleChange('username')} />
            <p>
              The username to access repo as
            </p>
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
    this.setState({
      submitFail: false,
    });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 3,
        loading: stepIndex >= 3,
      });
    }
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex - 1,
        loading: false,
      });
    }
  }

   // Handles changes for repo, username, branch
   handleChange = name => (event) => {
     this.setState({ [name]: event.target.value });
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
        username: '',
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
              <StepLabel>Input Git User</StepLabel>
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
