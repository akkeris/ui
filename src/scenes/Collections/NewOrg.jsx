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
    height: '360px',
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
    description: { width: '600px' },
  },
};

export default class NewOrg extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      finished: false,
      errorText: null,
      stepIndex: 0,
      org: '',
      description: '',
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
    if ((this.state.stepIndex === 0 && this.state.org === '') || (this.state.stepIndex === 1 && this.state.description === '')) {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      if (stepIndex + 1 <= 2) {
        this.setState({
          stepIndex: stepIndex + 1,
          errorText: null,
        });
      } else {
        this.setState({
          stepIndex: stepIndex + 1,
        });
        this.submitOrg();
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

  handleOrgChange = (event) => {
    this.setState({
      org: event.target.value,
    });
  };

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  };

  handleDescriptionChange = (event) => {
    this.setState({
      description: event.target.value,
    });
  };

  submitOrg = async () => {
    try {
      await this.api.createOrg(this.state.org, this.state.description);
      ReactGA.event({
        category: 'ORGS',
        action: 'Created new org',
      });
      History.get().push('/orgs');
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          finished: false,
          stepIndex: 0,
          org: '',
          description: '',
          loading: false,
        });
      }
    }
  };

  renderStepContent(stepIndex) {
    const { org, errorText, description } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div style={style.stepContainer}>
            <TextField
              className="org-name"
              label="Org name"
              value={org}
              onChange={this.handleOrgChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              style={style.textField.name}
            />
            <Typography variant="body1" style={style.stepDescription}>
              Enter a name that will define your organization.<br /><br />
              Organizations are used for attribution and grouping of apps and spaces.
            </Typography>
          </div>
        );
      case 1:
        return (
          <div style={style.stepContainer}>
            <TextField
              className="org-description"
              label="Org description"
              value={description}
              onChange={this.handleDescriptionChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              style={style.textField.description}
            />
            <Typography variant="body1" style={style.stepDescription}>
              Give a description of your org.
            </Typography>
          </div>
        );
      case 2:
        return (
          <div className="new-org-summary" style={style.stepContainer}>
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The new org '}
              <span style={style.bold}>{org}</span>
              {' will be created.'}
            </Typography>
          </div>
        );
      case 3:
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
    const { stepIndex, submitFail, submitMessage, org } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    return (
      <MuiThemeProvider theme={this.theme}>
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex} style={style.stepper}>
              <Step>
                <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(truncstr(org, 12))}>
                  Create Org Name
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>Describe Org</StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirm</StepLabel>
              </Step>
            </Stepper>
            <div style={style.contentStyle}>
              {this.renderStepContent(stepIndex)}
              {stepIndex < 3 && (
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
                    >{stepIndex === 2 ? 'Submit' : 'Next'}</Button>
                  </div>
                  <Tooltip title="Documentation" placement="top">
                    <IconButton
                      role="link"
                      tabindex="0"
                      onClick={() => window.open('https://docs.akkeris.io/architecture/apps-api.html#organizations')}
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
