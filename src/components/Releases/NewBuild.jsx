import React from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, TextField, Typography, CircularProgress,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import Url from 'url-parse';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';

const style = {
  root: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
    minHeight: 200,
    paddingBottom: '12px',
  },
  stepper: {
    height: 40,
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
  stepContent: {
    inputStep: {
      root: {
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      },
    },
    summaryStep: {
      root: {
        height: '200px',
        display: 'flex',
        wordWrap: 'anywhere',
        overflowY: 'auto',
      },
      wrapper: {
        height: 'min-content',
        margin: 'auto 0',
      },
    },
  },
  contentContainer: {
    margin: '0 32px', height: '250px', display: 'flex', flexDirection: 'column',
  },
  stepContainer: {
    flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  buttonContainer: {
    paddingTop: '12px',
  },
};

export default class NewBuild extends BaseComponent {
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
      displayUrl: {},
    };
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleNext = () => {
    const { stepIndex } = this.state;

    if (stepIndex === 0 && this.state.url !== '') {
      try {
        // Make sure it's a valid URI
        new URL(this.state.url); // eslint-disable-line no-new
        // Parse URI
        const displayUrl = new Url(this.state.url, '');
        // If password/token exists, shorten and hide it
        if (displayUrl.password !== '') {
          displayUrl.set('password', '[redacted]');
        }
        this.setState({ displayUrl });
      } catch (e) {
        this.setState({ errorText: 'Invalid URI' });
        return;
      }
    }

    if (stepIndex === 0 && this.state.url === '') {
      this.setState({ errorText: 'field required' });
    } else if (stepIndex === 3) {
      this.setState({
        loading: true,
        stepIndex: 4,
      }, () => this.submitBuild());
    } else {
      this.setState({
        stepIndex: stepIndex + 1,
        errorText: null,
      });
    }
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex - 1,
      errorText: null,
    });
  }

  // Handles changes for org, checksum, URL, repo, SHA, branch, and version.
  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
  }

  submitBuild = async () => {
    try {
      await this.api.createBuild(
        this.props.app, this.props.org, null, this.state.url,
        null, null, this.state.branch, this.state.version,
      );
      ReactGA.event({
        category: 'RELEASES',
        action: 'Created new release',
      });

      // Add a pleasing amount of loading instead of flashing the indicator
      // for a variable amount of time
      setTimeout(() => this.props.onComplete('New Deployment Requested'), 1000);
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          finished: false,
          stepIndex: 0,
          loading: false,
          errorText: null,
          url: '',
          displayUrl: {},
          branch: '',
          version: '',
        });
      }
    }
  }

  renderStepContent(stepIndex) {
    const { url, errorText, branch, version } = this.state;

    switch (stepIndex) {
      case 0:
        return (
          <div style={style.stepContent.inputStep.root}>
            <TextField
              className="url"
              label="URL"
              value={url}
              onChange={this.handleChange('url')}
              helperText={errorText}
              error={errorText && errorText.length > 0}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              fullWidth
            />
            <Typography variant="body2" style={style.stepDescription}>
              {'The URI to fetch the image or sources for this build.'}
            </Typography>
            <ul>
              <Typography component="li" variant="body2">A scheme is required (e.g. docker://, https://)</Typography>
              <Typography component="li" variant="body2">If an image is provided, no build will occur. Instead, the image will be fetched.</Typography> {/* eslint-disable-line */}
            </ul>
          </div>
        );
      case 1:
        return (
          <div style={style.stepContent.inputStep.root}>
            <TextField
              className="branch"
              label="Branch (optional)"
              value={branch}
              onChange={this.handleChange('branch')}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body2" style={style.stepDescription}>
              {'Branch of commit that caused the build (shown in logs and build info).'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div style={style.stepContent.inputStep.root}>
            <TextField
              className="version"
              label="Version (optional)"
              value={version}
              onChange={this.handleChange('version')}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body2" style={style.stepDescription}>
              {'An optional version to specify that will show in the logs.'}
            </Typography>
          </div>
        );
      case 3:
        return (
          <div className="new-build-summary" style={style.stepContent.summaryStep.root}>
            <div style={style.stepContent.summaryStep.wrapper}>
              <Typography variant="h6" style={style.h6}>Summary</Typography>
              <Typography variant="subtitle1">
                {'A new build will be created from '}
                <span style={style.bold}>{this.state.displayUrl.toString()}</span>
                {'.'}
                {(branch !== '' || version !== '') && (
                  <React.Fragment>
                    <br />
                    {'The '}{branch !== '' && (
                      <React.Fragment>
                        {'branch '}
                        <span style={style.bold}>{branch}</span>
                        {version !== '' && ' and '}
                      </React.Fragment>
                    )}
                    {version !== '' && (
                      <React.Fragment>
                        {'version '}
                        <span style={style.bold}>{version}</span>
                      </React.Fragment>
                    )}
                    {' will be displayed in the logs and build info.'}
                  </React.Fragment>
                )}
              </Typography>
            </div>
          </div>
        );
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
        <div style={style.buttons.div}>
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
            disabled={loading}
          >{stepIndex === 3 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      stepIndex, submitFail, submitMessage,
    } = this.state;
    return (
      <div style={style.root}>
        <Stepper style={style.stepper} activeStep={stepIndex}>
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
        {this.renderContent()}
        <ConfirmationModal
          open={submitFail}
          onOk={this.handleClose}
          message={submitMessage}
          title="Error"
          className="new-build-error"
        />
      </div>
    );
  }
}

NewBuild.propTypes = {
  app: PropTypes.string.isRequired,
  org: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
