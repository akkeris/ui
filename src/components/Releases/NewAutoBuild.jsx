import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, FormControlLabel, Switch, Typography, FormControl, Radio, RadioGroup, FormLabel,
  Step, Stepper, StepLabel, Button, TextField, Collapse,
} from '@material-ui/core';
import gh from 'parse-github-url';
import ConfirmationModal from '../ConfirmationModal';
import ReactGA from 'react-ga';

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
      marginBottom: 24,
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
        finished: stepIndex >= 4,
        loading: stepIndex >= 4,
        errorText: null,
      });
      if (stepIndex >= 4) {
        this.submitBuild();
      }
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

  submitBuild = async () => {
    try {
      await api.createAutoBuild(
        this.props.app,
        this.state.repo,
        (this.state.branch === '' ? 'master' : this.state.branch),
        this.state.statusCheck,
        this.state.autoDeploy,
        this.state.username,
        this.state.token,
      );
      this.props.onComplete('Auto Build Connected');
      ReactGA.event({
        category: 'Apps',
        action: 'App attached to repo',
      });
    } catch (error) {
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
    }
  }

  renderStepContent(stepIndex) {
    const {
      errorText, repo, branch, userSelection, username, token, autoDeploy, statusCheck,
    } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="Repo"
              label="Repo"
              value={repo}
              onChange={this.handleChange('repo')}
              helperText={errorText}
              error={errorText && errorText.length > 0}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              fullWidth
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'The repo URL (e.g. https://github.com/foo/bar).'}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              label="Master"
              value={branch}
              onChange={this.handleChange('branch')}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'The branch on the repo to watch and deploy from.'}
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
                value={userSelection}
                onChange={this.handleChange('userSelection')}
              >
                <FormControlLabel value="bot" control={<Radio />} label="Service Account" />
                <FormControlLabel value="user" control={<Radio />} label="User Account" />
              </RadioGroup>
              {userSelection === 'user' && (
                <div>
                  <TextField
                    label="User"
                    value={username}
                    onChange={this.handleChange('username')}
                    helperText={errorText}
                    error={errorText && errorText.length > 0}
                    onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
                    autoFocus
                  />
                  <Typography variant="body1" style={style.stepDescription}>
                    {'The username to access the repo as.'}
                  </Typography>
                  <TextField
                    label="Token"
                    value={token}
                    onChange={this.handleChange('token')}
                    helperText={errorText}
                    error={errorText && errorText.length > 0}
                    onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
                  />
                  <Typography variant="body1" style={style.stepDescription}>
                    {'The user\'s token.'}
                  </Typography>
                </div>
              )}
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
                    checked={autoDeploy}
                    onChange={this.handleAutoDeploy}
                    color="primary"
                  />
                }
                label="Auto Deploy"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={statusCheck}
                    onChange={this.handleStatusCheck}
                    color="primary"
                  />
                }
                label="Status Check"
              />
            </FormGroup>
          </div>
        );
      case 4:
        return (
          <div>
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The '}
              {userSelection === 'bot' ? (
                <span style={style.bold}>service account</span>
              ) : (
                <React.Fragment>
                  {'user '}
                  <span style={style.bold}>{username}</span>
                </React.Fragment>
              )}
              {' will be used to access the '}
              <span style={style.bold}>{gh(repo).repo}</span>
              {' repo, and the '}
              <span style={style.bold}>{branch.length === 0 ? 'master' : branch}</span>
              {' branch will be monitored for this app. Auto Deploy '}
              <span style={style.bold}>{autoDeploy ? 'will' : 'will not'}</span>
              {' be enabled. Status Checks '}
              <span style={style.bold}>{statusCheck ? 'will' : 'will not'}</span>
              {' be enabled.'}
            </Typography>
          </div>
        );
      // Have to have this otherwise it displays "you're a long way from home sonny jim" on submit
      case 5:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'hidden' };

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
          >{stepIndex === 4 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      loading, stepIndex, submitFail, submitMessage,
      repo, branch, username, userSelection,
    } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    const account = userSelection === 'bot' ? 'Service Account' : username;
    return (
      <div style={style.stepper}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(gh(repo).repo)}>
                Input Repo
            </StepLabel>
          </Step>
          <Step>
            <StepLabel className="step-1-label" optional={stepIndex > 1 && renderCaption(branch.length === 0 ? 'master' : branch)}>
                Input Branch
            </StepLabel>
          </Step>
          <Step>
            <StepLabel className="step-2-label" optional={stepIndex > 2 && renderCaption(account)}>
                Input GitHub User
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
                Options
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirm</StepLabel>
          </Step>
        </Stepper>
        <Collapse in={!loading}>
          {this.renderContent()}
        </Collapse>
        <ConfirmationModal
          open={submitFail}
          onOk={this.handleClose}
          message={submitMessage}
          title="Error"
          className="new-auto-build-error"
        />
      </div>
    );
  }
}

NewAutoBuild.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
