import React, { Component } from 'react';
import {
  Step, Stepper, StepLabel, Button, TextField, Collapse, Paper,
  Typography,
} from '@material-ui/core';

import api from '../../services/api';
import History from '../../config/History';
import ConfirmationModal from '../../components/ConfirmationModal';

const style = {
  stepper: {
    width: '100%',
    margin: 'auto',
    maxWidth: 900,
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
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    width: '100%',
  },
  div: {
    width: '100%',
    margin: 'auto',
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
};

export default class NewOrg extends Component {
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

  handleNext = () => {
    if ((this.state.stepIndex === 0 && this.state.org === '') || (this.state.stepIndex === 1 && this.state.description === '')) {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      if (!this.state.loading) {
        if (stepIndex + 1 <= 2) {
          this.setState({
            stepIndex: stepIndex + 1,
            errorText: null,
          });
        } else {
          this.setState({
            finished: true,
            loading: true,
          });
        }
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
      await api.createOrg(this.state.org, this.state.description);
      History.get().push('/collections');
    } catch (error) {
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
  };

  renderStepContent(stepIndex) {
    const { org, errorText, description } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="org-name"
              label="Org name"
              value={org}
              onChange={this.handleOrgChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {`
                Create an akkeris org! Enter a name that will define your org.
                This org will be used for attribution and grouping of apps/spaces.
              `}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              className="org-description"
              label="Org description"
              value={description}
              onChange={this.handleDescriptionChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Give a description of your org.'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div className="new-org-summary">
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The new org '}
              <span style={style.bold}>{org}</span>
              {' will be created.'}
            </Typography>
          </div>
        );
      // need this otherwise "You're a long way ..." shows up when you hit finish
      case 3:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 94px', overflow: 'hidden' };

    if (finished) {
      this.submitOrg();
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
          >{stepIndex === 2 ? 'Submit' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex, submitFail, submitMessage, org } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    return (
      <Paper style={style.paper}>
        <div style={style.div}>
          <Stepper activeStep={stepIndex} style={style.stepper}>
            <Step>
              <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(org)}>
                  Create org name
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>Describe org</StepLabel>
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
            className="error"
          />
        </div>
      </Paper>
    );
  }
}
