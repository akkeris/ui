import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, Collapse,
  Typography, List, ListItemText, ListItem, Divider,
} from '@material-ui/core';
import ConfirmationModal from '../ConfirmationModal';
import KeyValue from './KeyValue';

import api from '../../services/api';

const style = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
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

export default class NewConfigVar extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      errorText: null,
      values: [],
    };
  }

  getConfig() {
    const { values } = this.state;
    console.log(values);
    return (
      values.map((val, idx) => (
        <div key={idx}>
          {val.key && (
            <div>
              <ListItem key={idx} className={values[idx].key}>
                <ListItemText primary={values[idx].key} secondary={values[idx].value} />
              </ListItem>
              <Divider />
            </div>
          )}
        </div>
      ))
    );
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleNext = (values, event) => {
    const { stepIndex } = this.state;
    if (values.every(a => a.key === '')) {
      this.setState({ errorText: 'Must enter at least one valid keypair' });
      return;
    }
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 1,
        loading: stepIndex >= 1,
        values,
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

  handleKeyTextChange = (event) => {
    this.setState({
      key: event.target.value,
    });
  }

  handleValueChange = (event) => {
    this.setState({
      value: event.target.value,
    });
  }

  submitConfig = async () => {
    // remap
    const config = await this.state.values.reduce((aggr, item) => {
      if (item.key && item.value) {
        aggr[item.key] = item.value;
      }
      return aggr;
    }, {});
    try {
      await api.patchConfig(this.props.app, config);
      this.props.onComplete('Added Config Var');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        errorText: null,
        values: [],
      });
    }
  }

  renderStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <KeyValue onSubmit={this.handleNext} values={this.state.values} errorText={this.state.errorText} />
          </div>
        );
      case 1:
        return (
          <div className="new-config-summary">
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The following environment variables will be added to the app: '}
            </Typography>
            <List className="config-summary-list">
              {this.getConfig()}
            </List>
          </div>
        );
        // need this otherwise "You're a long way ..." shows up when you hit finish
      case 2:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  render() {
    const { loading, stepIndex, submitFail, submitMessage, finished, key, value } = this.state;
    const contentStyle = { margin: '0 32px' };
    if (finished) {
      this.submitConfig();
    }

    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;

    return (
      <div style={style.stepper}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel className="step-0-label" >
              Add Variables
            </StepLabel>
          </Step>
          <Step>
            <StepLabel className="step-1-label" >
              Summary
            </StepLabel>
          </Step>

        </Stepper>
        <Collapse in={!loading}>
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
              {stepIndex > 0 && (
                <Button
                  variant="contained"
                  className="next"
                  color="primary"
                  onClick={this.handleNext.bind(this, this.state.values)}
                >{stepIndex === 1 ? 'Finish' : 'Next'}</Button>
              )}
            </div>
          </div>
        </Collapse>
        <ConfirmationModal
          open={submitFail}
          onOk={this.handleClose}
          message={submitMessage}
          title="Error"
          className="new-config-error"
        />
      </div>
    );
  }
}

NewConfigVar.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
