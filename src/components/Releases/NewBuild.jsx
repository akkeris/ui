import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, TextField, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Select, MenuItem, Collapse, CircularProgress,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import api from '../../services/api';

const muiTheme = createMuiTheme({
  typography: {
    // map old typography variants to v2 (still throws warnings)
    useNextVariants: true,
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiStepper: {
      root: {
        padding: '24px 0px',
      },
    },
    MuiButton: {
      root: {
        marginRight: '15px',
      },
    },
    MuiFormControl: {
      root: {
        marginBottom: '15px',
      },
    },
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

export default class NewBuild extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      errorText: null,
      orgs: [],
      org: null,
      checksum: '',
      url: '',
      repo: '',
      sha: '',
      branch: '',
      version: '',
    };
  }

  componentDidMount() {
    api.getOrgs().then((response) => {
      const orgs = response.data.sort((a, b) => a.name > b.name);
      this.setState({
        orgs,
        org: orgs[0].name,
        loading: false,
      });
    });
  }

  getOrgs() {
    return this.state.orgs.map(org => (
      <MenuItem key={org.id} className={org.name} value={org.name}>
        {org.name}
      </MenuItem>
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <Select
              className="org-menu"
              // have to provide '' rather than null on empty: https://github.com/facebook/react/issues/11417
              value={this.state.org || ''}
              onChange={this.handleChange('org')}
            >
              {this.getOrgs()}
            </Select>
            <p>
              Select the org for this build.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              className="url"
              label="URL"
              value={this.state.url}
              onChange={this.handleChange('url')}
              helperText={this.state.errorText}
              error={this.state.errorText && this.state.errorText.length > 0}
            />
            <p>
              The URI to fetch the image or sources for this build.
              If an image is provided no build will occur, but the image will be fetched.
              See Docker Integrations at the top for more information on using build images.
              Data URI&apos;s are also allowed to push code rather than pull.
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField
              className="checksum"
              label="Checksum (optional)"
              value={this.state.checksum}
              onChange={this.handleChange('checksum')}
              helperText={this.state.errorText}
              error={this.state.errorText && this.state.errorText.length > 0}
            />
            <p>
              The sha 256 checksum (prepended with sha256:)
              of the contents specified in the url parameter,
              note if the URL is a base64 data URI then it is the content of
              the base64 content DECODED.
            </p>
          </div>
        );
      case 3:
        return (
          <div>
            <TextField
              className="repo"
              label="Repo (optional)"
              value={this.state.repo}
              onChange={this.handleChange('repo')}
            />
            <p>
              The href of the repo that will show in the logs and build information.
            </p>
          </div>
        );
      case 4:
        return (
          <div>
            <TextField
              className="sha"
              label="Sha (optional)"
              value={this.state.sha}
              onChange={this.handleChange('sha')}
            />
            <p>
              SHA commit value (shown in logs and build info)
            </p>
          </div>
        );
      case 5:
        return (
          <div>
            <TextField
              className="branch"
              label="Branch (optional)"
              value={this.state.branch}
              onChange={this.handleChange('branch')}
            />
            <p>
              Branch of commit that caused the build (shown in logs and build info)
            </p>
          </div>
        );
      case 6:
        return (
          <div>
            <TextField
              className="version"
              label="Version (optional)"
              value={this.state.version}
              onChange={this.handleChange('version')}
            />
            <p>
              An optional version to specify that will show in the logs
            </p>
          </div>
        );
      // Have to have this otherwise it displays "you're a long way from home sonny jim" on submit
      case 7:
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
    if (stepIndex === 1 && this.state.url === '') {
      this.setState({ errorText: 'field required' });
    } else if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 6,
        loading: stepIndex >= 6,
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

  // Handles changes for org, checksum, URL, repo, SHA, branch, and version.
  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
  }

  submitBuild = () => {
    api.createBuild(
      this.props.app, this.state.org, this.state.checksum, this.state.url,
      this.state.repo, this.state.sha, this.state.branch, this.state.version,
    ).then(() => {
      this.props.onComplete('New Deployment Requested');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        errorText: null,
        org: null,
        checksum: null,
        url: '',
        repo: null,
        sha: null,
        branch: null,
        version: null,
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
          >{stepIndex === 6 ? 'Finish' : 'Next'}</Button>
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
              <StepLabel className="select-org" >Select Org</StepLabel>
            </Step>
            <Step>
              <StepLabel>Url</StepLabel>
            </Step>
            <Step>
              <StepLabel>Checksum</StepLabel>
            </Step>
            <Step>
              <StepLabel>Repo</StepLabel>
            </Step>
            <Step>
              <StepLabel>Sha</StepLabel>
            </Step>
            <Step>
              <StepLabel>Branch</StepLabel>
            </Step>
            <Step>
              <StepLabel>Version</StepLabel>
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

NewBuild.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
