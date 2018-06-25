import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';

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
  events: {
    paddingLeft: '14px',
  },
};

const events = ['release', 'build', 'formation_change', 'logdrain_change', 'addon_change', 'config_change', 'destroy'];

export default class NewWebhook extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      events: [],
      url: '',
      secret: '',
      errorText: '',
    };
  }

  // componentDidMount() {
  // }

  // componentDidUpdate(prevProps, prevState) {
  // }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField className="webhook-url" floatingLabelText="URL" type="text" value={this.state.url} onChange={this.handleURLChange} errorText={this.state.errorText} />
            <p>
              Enter a URL for the new webhook.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <h3>Events</h3>
            <div style={style.events}>
              {this.getEvents()}
            </div>
          </div>
        );
      case 2:
        return (
          <TextField className="webhook-secret" floatingLabelText="Secret" type="text" value={this.state.secret} onChange={this.handleSecretChange} errorText={this.state.errorText} />
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  getEvents = () => events.map(event => (
    <Checkbox
      className={`checkbox-${event}`}
      key={event}
      onCheck={this.handleCheck}
      value={event}
      label={event}
      checked={this.state.events.indexOf(event) !== -1}
    />
  ))

  handleCheck = (event, checked) => {
    const { events } = this.state; // eslint-disable-line
    if (checked) {
      events.push(event.target.value);
    } else {
      events.splice(events.indexOf(event.target.value), 1);
    }
    this.setState({ events });
  }

  handleURLChange = (event, value) => {
    this.setState({
      url: value,
    });
  }

  handleSecretChange = (event, value) => {
    this.setState({
      secret: value,
    });
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if (stepIndex === 0 && !this.checkURL(this.state.url)) {
      this.setState({ errorText: 'Invalid URL' });
    } else if (stepIndex === 2 && /[^a-zA-Z0-9]/.test(this.state.secret)) {
      this.setState({ errorText: 'Alphanumeric characters only' });
    } else if (stepIndex === 2 && !this.state.secret) {
      this.setState({ errorText: 'Field required' });
    } else {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 2,
        errorText: '',
      });
    }
  }

  // regex from https://stackoverflow.com/questions/1303872
  checkURL(url) { // eslint-disable-line
      return /^HTTP|HTTP|http(s)?:\/\/(www\.)?[A-Za-z0-9]+([\-\.]{1}[A-Za-z0-9]+)*\.[A-Za-z]{2,40}(:[0-9]{1,40})?(\/.*)?$/.test(url) // eslint-disable-line
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex - 1,
    });
  }

  submitWebHook = () => {
    api.createWebHook(this.props.app, this.state.url, this.state.events, this.state.secret).then(() => { // eslint-disable-line
      this.props.onComplete('Webhook Created');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        events: [],
        url: '',
        secret: '',
      });
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitWebHook();
    } else {
      return (
        <div style={contentStyle}>
          <div>{this.getStepContent(stepIndex)}</div>
          <div style={style.buttons.div}>
            {stepIndex > 0 && (<FlatButton
              className="back"
              label="Back"
              disabled={stepIndex === 0}
              onTouchTap={this.handlePrev}
              style={style.buttons.Back}
            />)}
            <RaisedButton
              className="next"
              label={stepIndex === 2 ? 'Finish' : 'Next'}
              primary
              onTouchTap={this.handleNext}
            />
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { stepIndex } = this.state;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel>Choose URL</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Events</StepLabel>
            </Step>
            <Step>
              <StepLabel>Choose Secret</StepLabel>
            </Step>
          </Stepper>
          <div>
            {this.renderContent()}
          </div>
          <Dialog
            className="new-webhook-error"
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
      </MuiThemeProvider>
    );
  }
}

NewWebhook.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
