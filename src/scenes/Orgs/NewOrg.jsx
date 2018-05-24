import React, { Component } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';

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
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
  div: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
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

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField className="org-name" floatingLabelText="Org name" value={this.state.org} onChange={this.handleOrgChange} errorText={this.state.errorText} />
            <p>
              Create an akkeris org! Enter a name that will define your org.
              This org will be used for attribution and grouping of apps/spaces.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField className="org-description" floatingLabelText="Org description" value={this.state.description} onChange={this.handleDescriptionChange} errorText={this.state.errorText} />
            <p>
              Specify the space your app will live in.
              Spaces contain multiple apps and configurations at a similar stage in a pipeline
              (e.g. dev, qa, prod)
            </p>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  handleNext = () => {
    if ((this.state.stepIndex === 0 && this.state.org === '') || (this.state.stepIndex === 1 && this.state.description === '')) {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      if (!this.state.loading) {
        this.setState({
          loading: stepIndex >= 1,
          stepIndex: stepIndex + 1,
          finished: stepIndex >= 1,
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

  submitOrg = () => {
    api.createOrg(this.state.org, this.state.description).then(() => {
      window.location = '#/orgs';
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        org: '',
        description: '',
        loading: false,
      });
    });
  };

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };

    if (finished) {
      this.submitOrg();
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
            label={stepIndex === 1 ? 'Submit' : 'Next'}
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
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex}>
              <Step>
                <StepLabel>Create org name</StepLabel>
              </Step>
              <Step>
                <StepLabel>Describe org </StepLabel>
              </Step>
            </Stepper>
            <ExpandTransition loading={loading} open>
              {this.renderContent()}
            </ExpandTransition>
            <Dialog
              className="error"
              open={this.state.submitFail}
              modal
              actions={
                <FlatButton
                  className="ok"
                  label="Ok"
                  primary
                  onTouchTap={this.handleClose}
                />}
            >
              {this.state.submitMessage}
            </Dialog>
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }
}
