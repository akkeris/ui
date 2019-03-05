import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, Checkbox, Grid, TextField, IconButton, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, FormControlLabel,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import api from '../../services/api';
import eventDescriptions from './EventDescriptions.js'; // eslint-disable-line import/extensions
import ConfirmationModal from '../ConfirmationModal';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
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
    padding: '0',
    height: '18px',
    width: '18px',
  },
  eventsInfoIcon: {
    height: '18px',
    width: '18px',
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

const defaultEvents = ['release', 'build', 'formation_change', 'logdrain_change', 'addon_change', 'config_change', 'destroy', 'preview', 'preview-released', 'released', 'crashed'];

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
        finished: stepIndex >= 3,
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

  submitWebHook = async () => {
    try {
      await api.createWebHook(this.props.app, this.state.url, this.state.events, this.state.secret ? this.state.secret : ' ');
      this.props.onComplete('Webhook Created');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data || 'Tick tock, Captain Hook!',
        submitFail: true,
        finished: false,
        stepIndex: 0,
        events: [],
        url: '',
        secret: '',
      });
    }
  }

  renderStepContent(stepIndex) {
    const { url, events, errorText, secret, checkedAll } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="webhook-url"
              label="URL"
              type="text"
              value={url}
              onChange={this.handleChange('url')}
              helperText={errorText || ''}
              error={!!errorText}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Enter a URL for the new webhook (defaults to http).'}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <div style={style.eventsHeader}>
              <p style={style.eventsLabel}>Events</p>
              <Tooltip placement="right" title="Click for Descriptions">
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
                {this.renderEventCheckboxes(this.webhook)}
                <Grid item xs={12} style={style.checkAllContainer}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value="Check All"
                        key="Check All"
                        className="checkbox-check-all"
                        checked={checkedAll}
                        onChange={this.handleCheckAll}
                      />
                    }
                    label="Check All"
                  />
                </Grid>
              </Grid>
            </div>
            {errorText && (
              <div style={style.eventsError} className="events-errorText">
                {errorText}
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
              value={secret}
              onChange={this.handleChange('secret')}
              helperText={errorText || ''}
              errorText={errorText}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Define a secret for calculation of SHA (optional).'}
            </Typography>
          </div>
        );
      case 3:
        return (
          <div className="new-webhook-summary">
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The URL '}
              <span style={style.bold}>{url}</span>
              {' will receive the following hooks: '}
              <span style={style.bold}>{events.join(', ')}</span>
            </Typography>
          </div>
        );
        // Have to have this otherwise it displays "Error- Captain Hook not found" on submit
      case 4:
        return '';
      default:
        return 'Error- Captain Hook not found';
    }
  }

  renderEventCheckboxes() { // eslint-disable-line class-methods-use-this
    return defaultEvents.map(event => (
      <Grid key={`checkbox-${event}`} item xs={6}>
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
            >{stepIndex === 3 ? 'Finish' : 'Next'}</Button>
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { stepIndex, submitFail, submitMessage } = this.state;
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
            <Step>
              <StepLabel>Confirm</StepLabel>
            </Step>
          </Stepper>
          <div>
            {this.renderContent()}
          </div>
          <ConfirmationModal
            open={submitFail}
            onOk={this.handleClose}
            message={submitMessage}
            title="Error"
            className="new-webhook-error"
          />
        </div>
      </MuiThemeProvider>
    );
  }
}


NewWebhook.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
