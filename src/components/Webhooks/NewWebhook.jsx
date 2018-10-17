import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, Checkbox, Grid, TextField, IconButton, Typography,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip, FormControlLabel,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import { blue } from '@material-ui/core/colors';
import api from '../../services/api';
import eventDescriptions from './EventDescriptions.js'; // eslint-disable-line import/extensions

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiCheckbox: {
      root: {
        padding: '2px 12px',
      },
    },
  },
});

const style = {
  eventsHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70px',
  },
  eventsLabel: {
    // color: 'rgba(0, 0, 0, 0.3)',
    fontSize: '14px',
    paddingRight: '8px',
  },
  checkAllContainer: {
    borderTop: '1px solid black',
    marginTop: '5px',
    paddingTop: '5px',
  },
  gridContainer: {
    width: '350px',
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
  eventsError: {
    color: 'red',
    paddingTop: '20px',
  },
  eventsInfoButton: {
    // icon: {
    //   height: '18px', width: '18px',
    // },

    padding: '0',
    height: '18px',
    width: '18px',
    // color: lightBaseTheme.palette.accent1Color,
  },
  eventsInfoIcon: {
    height: '18px',
    width: '18px',
    // color: lightBaseTheme.palette.accent1Color,
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
            <TextField
              className="webhook-url"
              label="URL"
              type="text"
              value={this.state.url}
              onChange={this.handleChange('url')}
              helperText={this.state.errorText ? this.state.errorText : ''}
              error={this.state.errorText}
            />
            <p>
              Enter a URL for the new webhook (defaults to http).
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <div style={style.eventsHeader}>
              <p style={style.eventsLabel}>Events</p>
              <Tooltip placement="right-center" title="Click for Descriptions">
                <IconButton
                  className="events-info-button"
                  onClick={this.openEventsInfoDialog}
                  style={style.eventsInfoButton}
                >
                  <HelpIcon style={style.eventsInfoIcon} color="secondary" />
                </IconButton>
              </Tooltip>
            </div>
            {this.renderEventsInfoDialog()}
            <div className="events">
              <Grid container spacing={8} style={style.gridContainer}>
                {this.getEventCheckboxes(this.webhook)}
                <Grid item xs={12} style={style.checkAllContainer}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value="Check All"
                        key="Check All"
                        className="checkbox-check-all"
                        checked={this.state.checkedAll}
                        onChange={this.handleCheckAll}
                      />
                    }
                    label="Check All"
                  />
                </Grid>
              </Grid>
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
              label="Secret"
              type="password"
              value={this.state.secret}
              onChange={this.handleChange('secret')}
              helperText={this.state.errorText ? this.state.errorText : ''}
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
      <Grid item xs={6}>
        <FormControlLabel
          control={
            <Checkbox
              className={`checkbox-${event}`}
              key={event}
              value={event}
              checked={this.state.events.includes(event)}
              onChange={this.handleCheck}
            />
          }
          label={event}
        />
      </Grid>
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

  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
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
    if (/^(HTTP|HTTP|http(s)?:\/\/)?[A-Za-z0-9]+([\-\.]{1}[A-Za-z0-9]+)*\.[A-Za-z]{2,40}(:[0-9]{1,40})?(\/.*)?$/.test(url)) { // eslint-disable-line no-useless-escape
      if (!/^(HTTP|HTTP|http(s)?:\/\/)/.test(url)) {
        this.setState({ url: `http://${this.state.url}` });
      }
      return true;
    }
    return false;
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
      <Dialog open={this.state.eventsDialogOpen} className="events-info-dialog">
        <DialogTitle>Description of Events</DialogTitle>
        <DialogContent>
          <div>
            {eventDescriptions.data.map((event, index) => (
              <p key={`${event}.length`}><b>{defaultEvents[index]}</b><br />{event}</p>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            className="ok"
            color="primary"
            onClick={this.closeEventsInfoDialog}
          >Ok</Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 57px', overflow: 'visible' };
    if (finished) {
      this.submitWebHook();
    } else {
      return (
        <div style={contentStyle}>
          <div>{this.getStepContent(stepIndex)}</div>
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
            >{stepIndex === 2 ? 'Finish' : 'Next'}</Button>
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { stepIndex } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
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
          <Dialog open={this.state.submitFail} className="new-webhook-error">
            <DialogTitle>
              <Typography variant="h6">
                Error
              </Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {this.state.submitMessage}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button label="Ok" color="primary" onClick={this.handleClose}>Ok</Button>
            </DialogActions>
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
