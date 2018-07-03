import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import InfoIcon from 'material-ui/svg-icons/action/info';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import { IconButton } from 'material-ui';
import { GridList } from 'material-ui/GridList';

import api from '../../services/api';
import eventDescriptions from './EventDescriptions';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  eventsHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80px',
  },
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
  eventsError: {
    color: 'red',
    paddingTop: '20px',
  },
  eventsInfoButton: {
    icon: {
      height: '18px', width: '18px',
    },
    padding: '1px 0 0 0',
    height: '24px',
    width: '24px',
  },
};

const defaultEvents = ['release', 'build', 'formation_change', 'logdrain_change', 'addon_change', 'config_change', 'destroy', 'preview', 'released', 'crashed'];

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
      checkedAll: false,
      eventsDialogOpen: false,
    };
  }

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
            <div style={style.eventsHeader}>
              <h3>Events</h3>
              <IconButton
                className="events-info-button"
                onTouchTap={this.openEventsInfoDialog}
                style={style.eventsInfoButton}
                iconStyle={style.eventsInfoButton.icon}
                tooltip="Descriptions"
                tooltipPosition="top-right"
              >
                <InfoIcon />
              </IconButton>
            </div>
            {this.renderEventsInfoDialog()}
            <div className="events">
              <GridList cellHeight="auto" style={{ width: '350px' }}>
                {this.getEventCheckboxes(this.webhook)}
                <Checkbox
                  label="Check All"
                  value="Check All"
                  key="Check All"
                  className="checkbox-check-all"
                  checked={this.state.checkedAll}
                  onCheck={this.handleCheckAll}
                />
              </GridList>
            </div>
            {this.state.errorText && (
              <div style={style.eventsError} className="events-errorText">
                {this.state.errorText}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <TextField
              className="webhook-secret"
              floatingLabelText="Secret"
              type="password"
              value={this.state.secret}
              onChange={this.handleSecretChange}
              errorText={this.state.errorText}
            />
            <p>
              Define a secret for calculation of SHA (optional).
            </p>
          </div>
        );
      default:
        return 'Error- Captain Hook not found';
    }
  }

  getEventCheckboxes() { // eslint-disable-line class-methods-use-this
    return defaultEvents.map(event => (
      <Checkbox
        className={`checkbox-${event}`}
        key={event}
        value={event}
        label={event}
        checked={this.state.events.includes(event)}
        onCheck={this.handleCheck}
        style={style.checkboxWidth}
      />
    ));
  }

  getEvents() {
    return this.state.events.map((event, idx) => <span key={event} style={style.tableRow.column.event}>{event}{idx === this.state.events.length - 1 ? '' : ','} </span>);
  }

  openEventsInfoDialog = () => {
    this.setState({ eventsDialogOpen: true });
  }

  closeEventsInfoDialog = () => {
    this.setState({ eventsDialogOpen: false });
  }

  handleCheck = (event, checked) => {
    const currEvents = this.state.events;
    if (checked) {
      currEvents.push(event.target.value);
    } else {
      currEvents.splice(currEvents.indexOf(event.target.value), 1);
    }
    this.setState({
      events: currEvents,
      checkedAll: currEvents.length === defaultEvents.length,
    });
  }

  handleCheckAll = (event, checked) => {
    let currEvents = [];
    if (checked) {
      for (let i = 0; i < defaultEvents.length; i++) { currEvents.push(defaultEvents[i]); }
      this.setState({ checkedAll: true });
    } else {
      currEvents = [];
      this.setState({ checkedAll: false });
    }
    this.setState({ events: currEvents });
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
    } else if (stepIndex === 1 && this.state.events.length === 0) {
      this.setState({ errorText: 'Must select at least one event' });
    } else if (stepIndex === 2 && this.state.secret.length > 20) {
      this.setState({ errorText: 'Secret must be less than 20 characters' });
    } else {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 2,
        errorText: '',
      });
    }
  }

  // regex from https://stackoverflow.com/questions/1303872, modified to have http(s) optional
  checkURL(url) { // eslint-disable-line
      return /^(HTTP|HTTP|http(s)?:\/\/)?(www\.)?[A-Za-z0-9]+([\-\.]{1}[A-Za-z0-9]+)*\.[A-Za-z]{2,40}(:[0-9]{1,40})?(\/.*)?$/.test(url) // eslint-disable-line
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex - 1,
      errorText: '',
    });
  }

  submitWebHook = () => {
    if (!this.state.secret) {
      this.state.secret = ' ';
    }
    api.createWebHook(this.props.app, this.state.url, this.state.events, this.state.secret).then(() => { // eslint-disable-line
      this.props.onComplete('Webhook Created');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data || 'Tick tock, Captain Hook!',
        submitFail: true,
        finished: false,
        stepIndex: 0,
        events: [],
        url: '',
        secret: '',
      });
    });
  }

  renderEventsInfoDialog() {
    return (
      <Dialog
        className="events-info-dialog"
        open={this.state.eventsDialogOpen}
        title="Description of Events"
        autoScrollBodyContent
        actions={
          <FlatButton
            className="ok"
            label="Ok"
            primary
            onTouchTap={this.closeEventsInfoDialog}
          />
        }
      >
        <div>
          {eventDescriptions.getEventDescriptions().map((event, index) => (
            <p key={`${event}.length`}><b>{defaultEvents[index]}</b><br />{event}</p>
          ))}
        </div>
      </Dialog>
    );
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'visible' };
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
