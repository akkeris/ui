import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, FormControlLabel, Switch, Typography, FormControl, Radio, RadioGroup, FormLabel,
  Step, Stepper, StepLabel, Button, TextField, CircularProgress,
} from '@material-ui/core';
import gh from 'parse-github-url';
import ReactGA from 'react-ga';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';

const style = {
  buttons: {
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
  root: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
    minHeight: 200,
    paddingBottom: '12px',
  },
  stepper: {
    height: '40px',
  },
  contentContainer: {
    margin: '0 32px', height: '280px', display: 'flex', flexDirection: 'column',
  },
  stepContainer: {
    flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  buttonContainer: {
    paddingTop: '12px',
  },
  refresh: {
    div: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexGrow: 1,
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  userSelection: {
    textField: {
      width: '275px',
    },
    container: {
      paddingTop: '12px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  },
};

export default class NewAutoBuild extends BaseComponent {
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
      await this.api.createAutoBuild(
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
      if (!this.isCancel(error)) {
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
              placeholder="master"
              label="Branch"
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
            </FormControl>
            {userSelection === 'user' && (
              <div style={style.userSelection.container}>
                <TextField
                  label="User"
                  value={username}
                  onChange={this.handleChange('username')}
                  helperText={'The username to access the repo as'}
                  error={errorText && errorText.length > 0}
                  onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
                  autoFocus
                  style={style.userSelection.textField}
                />
                <TextField
                  label="Token"
                  value={token}
                  onChange={this.handleChange('token')}
                  helperText={"The user's token"}
                  error={errorText && errorText.length > 0}
                  onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
                  style={style.userSelection.textField}
                />
              </div>
            )}
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
    const { stepIndex, loading } = this.state;
    return (
      <div style={style.contentContainer}>
        {!loading ? (
          <div style={style.stepContainer}>
            {this.renderStepContent(stepIndex)}
          </div>
        ) : (
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} status="loading" />
          </div>
        )}
        <div style={style.buttonContainer}>
          <Button
            className="back"
            disabled={stepIndex === 0}
            onClick={this.handlePrev}
            style={style.buttons.back}
          >Back</Button>
          <Button
            variant="contained"
            className="next"
            color="primary"
            onClick={this.handleNext}
            disabled={loading || stepIndex > 4}
          >{stepIndex === 4 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      stepIndex, submitFail, submitMessage,
      repo, branch, username, userSelection,
    } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    const account = userSelection === 'bot' ? 'Service Account' : username;
    return (
      <div style={style.root}>
        <Stepper style={style.stepper} activeStep={stepIndex}>
          <Step>
            <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(gh(repo).repo)}>
                GitHub Repo
            </StepLabel>
          </Step>
          <Step>
            <StepLabel className="step-1-label" optional={stepIndex > 1 && renderCaption(branch.length === 0 ? 'master' : branch)}>
                Branch
            </StepLabel>
          </Step>
          <Step>
            <StepLabel className="step-2-label" optional={stepIndex > 2 && renderCaption(account)}>
                GitHub User
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
        {this.renderContent()}
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
