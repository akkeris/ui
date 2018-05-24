import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import Toggle from 'material-ui/Toggle';
import Dialog from 'material-ui/Dialog';

import api from '../../services/api';

const muiTheme = getMuiTheme({
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
            <TextField floatingLabelText="Repo" value={this.state.repo} onChange={this.handleRepoChange} />
            <p>
              The repo URL (e.g., https://github.com/foo/bar)
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField floatingLabelText="Branch (defaults Master)" value={this.state.branch} onChange={this.handleBranchChange} />
            <p>
              The branch on the repo to watch and deploy from
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField floatingLabelText="User" value={this.state.username} onChange={this.handleUsernameChange} />
            <p>
              The username to access repo as
            </p>
          </div>
        );
      case 3:
        return (
          <div>
            <Toggle
              label="Auto Deploy"
              toggled={this.state.autoDeploy}
              onToggle={this.handleAutoDeploy}
            />
            <Toggle
              label="Status Check"
              toggled={this.state.statusCheck}
              onToggle={this.handleStatusCheck}
            />
          </div>
        );
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

  handleRepoChange = (event) => {
    this.setState({
      repo: event.target.value,
    });
  }

  handleUsernameChange = (event) => {
    this.setState({
      username: event.target.value,
    });
  }

  handleBranchChange = (event) => {
    this.setState({
      branch: event.target.value,
    });
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
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitBuild();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (<FlatButton
            label="Back"
            disabled={stepIndex === 0}
            onTouchTap={this.handlePrev}
            style={style.buttons.back}
          />)}
          <RaisedButton
            label={stepIndex === 3 ? 'Finish' : 'Next'}
            primary
            onTouchTap={this.handleNext}
          />
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
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
            <ExpandTransition loading={loading} open>
              {this.renderContent()}
            </ExpandTransition>
          }
          <Dialog
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                label="Ok"
                primary
                onTouchTap={this.handleClose}
              />
            }
          >
            {this.state.submitMessage}
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
