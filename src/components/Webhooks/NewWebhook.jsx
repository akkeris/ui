import React from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, Checkbox, Grid, TextField, IconButton, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, FormControlLabel, CircularProgress,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import HelpIcon from '@material-ui/icons/Help';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';

const style = {
  checkbox: {
    marginRight: '6px',
    padding: '6px',
  },
  eventsHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70px',
  },
  eventsLabel: {
    fontSize: '14px',
    paddingRight: '8px',
  },
  checkAllContainer: {
    borderTop: '1px solid black',
    marginTop: '5px',
    paddingTop: '5px',
  },
  gridContainer: {
    width: '550px',
  },
  root: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
    paddingBottom: '12px',
  },
  stepper: {
    height: '40px',
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
  refresh: {
    div: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexGrow: 1,
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  contentContainer: {
    margin: '0 32px', height: '412px', display: 'flex', flexDirection: 'column',
  },
  stepContainer: {
    flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  buttonContainer: {
    paddingTop: '12px',
  },
};

export default class NewWebhook extends BaseComponent {
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
      loading: false,
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
      checkedAll: currEvents.length === this.props.availableHooks.length,
    });
  }

  handleCheckAll = (event, checked) => {
    let currEvents = [];
    if (checked) {
      this.props.availableHooks.forEach(e => currEvents.push(e.type));
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
      this.setState({ loading: true });
      await this.api.createWebHook(this.props.app, this.state.url, this.state.events, this.state.secret ? this.state.secret : ' ');
      ReactGA.event({
        category: 'WEBHOOK',
        action: 'Created new webhook',
      });

      // Add a pleasing amount of loading instead of flashing the indicator
      // for a variable amount of time
      setTimeout(() => this.props.onComplete('Webhook Created', true), 1000);
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data || 'Tick tock, Captain Hook!',
          submitFail: true,
          finished: false,
          stepIndex: 0,
          events: [],
          url: '',
          secret: '',
          loading: false,
          checkedAll: false,
        });
      }
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
              fullWidth
            />
            <Typography variant="body2" style={style.stepDescription}>
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
            <div className="events" style={{ padding: '6px' }}>
              <Grid container spacing={1} style={style.gridContainer} className="new-webhook-events-grid">
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
                        style={style.checkbox}
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
            <Typography variant="body2" style={style.stepDescription}>
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
      default:
        return 'Error- Captain Hook not found';
    }
  }

  renderEventCheckboxes() { // eslint-disable-line class-methods-use-this
    return this.props.availableHooks.map(event => (
      <Grid key={`checkbox-${event.type}`} item xs={4}>
        <FormControlLabel
          control={
            <Checkbox
              className={`checkbox-event-${event.type}`}
              key={event.type}
              value={event.type}
              checked={this.state.events.includes(event.type)}
              onChange={this.handleCheck}
              style={style.checkbox}
            />
          }
          label={event.type}
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
            {this.props.availableHooks.map(event => (
              <p key={`${event.type}_description`}><b>{event.type}</b><br />{event.description}</p>
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
    const { loading, stepIndex } = this.state;
    return (
      <div style={style.contentContainer}>
        {!loading ? (
          <div style={style.stepContainer}>
            {this.renderStepContent(stepIndex)}
          </div>
        ) : (
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} status="loading" />
          </div>
        )}
        <div style={style.buttonContainer}>
          <Button
            className="back"
            disabled={stepIndex === 0}
            onClick={this.handlePrev}
            style={style.buttons.back}
          >
            Back
          </Button>
          <Button
            variant="contained"
            className="next"
            color="primary"
            onClick={stepIndex > 2 ? this.submitWebHook : this.handleNext}
            disabled={stepIndex > 3}
          >
            {stepIndex < 3 ? 'Next' : 'Finish'}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { stepIndex, submitFail, submitMessage } = this.state;
    return (
      <div style={style.root}>
        <Stepper style={style.stepper} activeStep={stepIndex}>
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
        {this.renderContent()}
        <ConfirmationModal
          open={submitFail}
          onOk={this.handleClose}
          message={submitMessage}
          title="Error"
          className="new-webhook-error"
        />
      </div>
    );
  }
}


NewWebhook.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
  availableHooks: PropTypes.arrayOf(PropTypes.object).isRequired,
};
