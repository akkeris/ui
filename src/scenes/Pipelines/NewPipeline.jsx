import React from 'react';
import {
  Step, Stepper, StepLabel, Button, TextField, Paper,
  Typography, IconButton, Tooltip, CircularProgress,
} from '@material-ui/core';
import DocumentationIcon from '@material-ui/icons/DescriptionOutlined';
import ReactGA from 'react-ga';
import { MuiThemeProvider } from '@material-ui/core/styles';
import deepmerge from 'deepmerge';

import History from '../../config/History';
import ConfirmationModal from '../../components/ConfirmationModal';
import BaseComponent from '../../BaseComponent';
import { truncstr } from '../../services/util';

const style = {
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '32px',
    width: '100%',
  },
  div: {
    display: 'flex',
    flexDirection: 'column',
    height: '372px',
  },
  contentStyle: {
    margin: '0 94px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  stepper: {
    width: '100%',
    margin: '0 auto',
    maxWidth: 900,
    height: '40px',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    wordBreak: 'break-word',
  },
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 24,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    back: {
      marginRight: 12,
    },
  },
  h6: {
    marginBottom: '12px',
  },
  bold: {
    fontWeight: 'bold',
  },
  stepDescription: {
    marginTop: '24px',
  },
  textField: {
    name: { width: '300px' },
  },
};

export default class NewPipeline extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      finished: false,
      errorText: null,
      stepIndex: 0,
      pipeline: '',
      submitFail: false,
      submitMessage: '',
    };
  }

  theme = parentTheme => deepmerge(parentTheme, {
    overrides: {
      MuiStepper: {
        root: {
          padding: '24px 0px',
        },
      },
    },
  });

  handleNext = () => {
    if ((this.state.stepIndex === 0 && this.state.pipeline === '')) {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      if (stepIndex + 1 <= 1) {
        this.setState({
          stepIndex: stepIndex + 1,
          errorText: null,
        });
      } else {
        this.setState({
          stepIndex: stepIndex + 1,
        });
        this.submitPipeline();
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

  handlePipelineChange = (event) => {
    this.setState({
      pipeline: event.target.value,
    });
  };

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  };

  submitPipeline = async () => {
    try {
      await this.api.createPipeline(this.state.pipeline);
      ReactGA.event({
        category: 'PIPELINES',
        action: 'Created new pipeline',
      });
      History.get().push(`/pipelines/${this.state.pipeline}/review`);
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          finished: false,
          stepIndex: 0,
          errorText: null,
          pipeline: '',
        });
      }
    }
  };

  renderStepContent(stepIndex) {
    const { errorText, pipeline } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div style={style.stepContainer}>
            <TextField
              className="pipeline-name"
              label="Pipeline Name"
              value={pipeline}
              onChange={this.handlePipelineChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              style={style.textField.name}
            />
            <Typography variant="body1" style={style.stepDescription}>
              Enter a name that will define your pipeline.<br />
              (less that 24 characters, alphanumeric only)<br /><br />
              A pipeline is a group of apps that share the same codebase,
              but exist in different environments.
            </Typography>
          </div>
        );
      case 1:
        return (
          <div className="new-pipeline-summary" style={style.stepContainer}>
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The new pipeline '}
              <span style={style.bold}>{pipeline}</span>
              {' will be created.'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div style={style.loadingContainer}>
            <CircularProgress />
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  render() {
    const { stepIndex, submitFail, submitMessage, pipeline } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    return (
      <MuiThemeProvider theme={this.theme}>
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex} style={style.stepper}>
              <Step>
                <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(truncstr(pipeline, 12))}>
                  Pipeline Name
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirm</StepLabel>
              </Step>
            </Stepper>
            <div style={style.contentStyle}>
              {this.renderStepContent(stepIndex)}
              {stepIndex < 2 && (
                <div style={style.buttons.div}>
                  <div>
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
                    >{stepIndex === 1 ? 'Submit' : 'Next'}</Button>
                  </div>
                  <Tooltip title="Documentation" placement="top">
                    <IconButton
                      role="link"
                      tabindex="0"
                      onClick={() => window.open('https://docs.akkeris.io/architecture/pipelines.html')}
                    >
                      <DocumentationIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
            <ConfirmationModal
              open={submitFail}
              onOk={this.handleClose}
              message={submitMessage}
              title="Error"
              className="error"
            />
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }
}
