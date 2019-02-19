import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, TextField, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Collapse,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#0097a7',
    },
  },
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
      loading: false,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      errorText: null,
      url: '',
      branch: '',
      version: '',
    };
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if (stepIndex === 0 && this.state.url === '') {
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

  // Handles changes for org, checksum, URL, repo, SHA, branch, and version.
  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
  }

  submitBuild = async () => {
    try {
      await api.createBuild(
        this.props.app, this.props.org, null, this.state.url,
        null, null, this.state.branch, this.state.version,
      );
      this.props.onComplete('New Deployment Requested');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        errorText: null,
        url: '',
        branch: null,
        version: null,
      });
    }
  }

  renderStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
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
      case 1:
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
      case 2:
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
      case 3:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'hidden' };
    if (finished) {
      this.submitBuild();
    }

    return (
      <div style={contentStyle}>
        <div>{this.renderStepContent(stepIndex)}</div>
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
              <StepLabel>Url</StepLabel>
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
  org: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
