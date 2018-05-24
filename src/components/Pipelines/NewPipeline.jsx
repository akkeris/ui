import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
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

export default class NewPipeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      finished: false,
      errorText: null,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      pipeline: '',
    };
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField className="pipeline-name" floatingLabelText="Name" value={this.state.pipeline} onChange={this.handlePipelineChange} errorText={this.state.errorText} />
            <p>
                          The name of the pipeline, less than 24 characters, alpha numeric only.
            </p>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  handleNext = () => {
    if ((this.state.stepIndex === 0 && this.state.pipeline === '')) {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      if (!this.state.loading) {
        this.setState({
          loading: stepIndex >= 0,
          stepIndex: stepIndex + 1,
          finished: stepIndex >= 0,
          errorText: null,
        });
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

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  };

  handlePipelineChange = (event) => {
    this.setState({
      pipeline: event.target.value,
    });
  };

  submitPipeline = () => {
    api.createPipeline(this.state.pipeline).then(() => {
      this.props.onComplete('Pipeline Added');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        errorText: null,
        pipeline: '',
        loading: false,
      });
    });
  };

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };

    if (finished) {
      this.submitPipeline();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (<FlatButton
            className="back"
            label="Back"
            disabled={stepIndex === 0}
            onTouchTap={this.handlePrev}
            style={style.buttons.back}
          />
          )}
          <RaisedButton
            className="next"
            label={stepIndex === 0 ? 'Submit' : 'Next'}
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
              <StepLabel>Create Pipeline</StepLabel>
            </Step>
          </Stepper>
          <ExpandTransition loading={loading} open>
            {this.renderContent()}
          </ExpandTransition>
          <Dialog
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                label="Ok"
                primary
                onTouchTap={this.handleClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

NewPipeline.propTypes = {
  onComplete: PropTypes.func.isRequired,
};
