import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, TextField, Typography, Collapse,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';

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
    const { url, errorText, branch, version } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="url"
              label="URL"
              value={url}
              onChange={this.handleChange('url')}
              helperText={errorText}
              error={errorText && errorText.length > 0}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {`
                The URI to fetch the image or sources for this build.
                If an image is provided no build will occur, but the image will be fetched.
                See Docker Integrations at the top for more information on using build images.
                Data URI's are also allowed to push code rather than pull.
              `}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              className="branch"
              label="Branch (optional)"
              value={branch}
              onChange={this.handleChange('branch')}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Branch of commit that caused the build (shown in logs and build info).'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField
              className="version"
              label="Version (optional)"
              value={version}
              onChange={this.handleChange('version')}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'An optional version to specify that will show in the logs.'}
            </Typography>
          </div>
        );
      case 3:
        return (
          <div>
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'A new build will be created from '}
              <span style={style.bold}>{url}</span>
              {'. '}
              {branch !== '' && (
                <React.Fragment>
                  {'The branch '}
                  <span style={style.bold}>{branch}</span>
                  {' will be displayed in the logs and build info. '}
                </React.Fragment>
              )}
              {version !== '' && (
                <React.Fragment>
                  {'The version '}
                  <span style={style.bold}>{version}</span>
                  {' will be displayed in the logs and build info.'}
                </React.Fragment>
              )}
            </Typography>
          </div>
        );
      // Have to have this otherwise it displays "you're a long way from home sonny jim" on submit
      case 4:
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
          >{stepIndex === 3 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      loading, stepIndex, submitFail, submitMessage,
    } = this.state;
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
            className="new-build-error"
          />
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
