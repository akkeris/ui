import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton, CircularProgress, Tooltip,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Checkbox, FormControlLabel, Switch,
  Table, TableBody, TableRow, TableCell,
  ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import ActiveIcon from '@material-ui/icons/Notifications';
import InactiveIcon from '@material-ui/icons/NotificationsPaused';
import HistoryIcon from '@material-ui/icons/History';
import HelpIcon from '@material-ui/icons/Help';
import RemoveIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import BackIcon from '@material-ui/icons/ArrowBack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { blue } from '@material-ui/core/colors';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';
import eventDescriptions from './EventDescriptions.js'; // eslint-disable-line import/extensions

const defaultEvents = ['release', 'build', 'formation_change', 'logdrain_change', 'addon_change', 'config_change', 'destroy', 'preview', 'released', 'crashed'];

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiExpansionPanelSummary: {
      root: {
        padding: 0,
      },
      content: {
        padding: 0,
        '& > :last-child': {
          paddingRight: 0,
        },
      },
    },
    MuiDialog: {
      paper: {
        width: '55%',
        maxWidth: 'none',
        border: '0',
      },
    },
    MuiCheckbox: {
      root: {
        padding: '2px 12px',
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: 'none',
      },
    },
  },
});

function objectToTable(prefix, input) {
  if (input === null) {
    return null;
  }
  return Object.keys(input).map((key) => {
    if (typeof input[key] === 'object') {
      return objectToTable(prefix ? `${prefix}.${key}` : key, input[key]);
    }
    return (
      <TableRow hover key={prefix ? `${prefix}.${key}` : key}>
        <TableCell colSpan="2">
          <div>
            <b>{prefix ? `${prefix}.${key}` : key}</b>
          </div>
          <div style={{ wordWrap: 'break-word' }}>
            {input[key]}
          </div>
        </TableCell>
      </TableRow>
    );
  });
}

const style = {
  infoIcon: {
    height: '18px', width: '18px',
  },
  infoButton: {
    padding: 0,
  },
  expansionPanel: {
    boxShadow: 'none',
  },
  eventsHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70px',
  },
  urlTextField: {
    maxWidth: '250px',
  },
  secretTextField: {
    marginLeft: '20px',
    maxWidth: '200px',
  },
  checkAllContainer: {
    inactive: {
      borderTop: '1px solid rgba(0, 0, 0, 0.3)',
      marginTop: '5px',
      paddingTop: '5px',
    },
    active: {
      borderTop: '1px solid black',
      marginTop: '5px',
      paddingTop: '5px',
    },
  },
  eventsError: {
    color: 'red',
    paddingTop: '20px',
  },
  eventsTwoColumns: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    width: '200%',
  },
  gridContainer: {
    width: '350px',
  },
  statusIcon: {
    height: '18px',
    width: '18px',
    position: 'relative',
    padding: '0 10px 0 10px',
  },
  eventsLabel: {
    color: 'rgba(0, 0, 0, 0.3)',
    fontSize: '12px',
  },
  noPadding: {
    padding: 0,
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  toggle: {
    width: '35%',
  },
  historyDialogTable: {
    paddingLeft: '10px',
  },
  dialogTitleContainer: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
    marginBottom: '2px',
  },
  dialogTitle: {
    fontSize: '22px',
    lineHeight: '32px',
    fontWeight: '400',
  },
  dialogSubtitle: {
    fontSize: '16px',
  },
  eventsContainer: {
    fontSize: '14px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  webhookUrl: {
    fontSize: '16px',
  },
  webhookId: {
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  eventsRow: {
    display: 'block',
    overflow: 'visible',
  },
  iconButtonCell: {
    width: '58px',
    paddingRight: '10px',
    overflow: 'visible',
  },
  eventSpan: {
    padding: '0px 2px 0px 2px',
  },
  tableRowHeight: {
    height: '58px',
  },
  eventsCell: {
    overflow: 'visible',
    borderBottom: 'none',
  },
  titleGrid: {
    paddingRight: '0 !important',
    left: {
      paddingLeft: '0px',
      minWidth: '50%',
    },
    right: {
      paddingRight: '32px',
      display: 'flex',
      alignItems: 'center',
    },
  },
};

export default class Webhook extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      errorMessage: '',
      events: this.props.webhook.events.slice(),
      edit: false,
      urlErrorText: '',
      secretErrorText: '',
      eventErrorText: '',
      url: this.props.webhook.url.slice(),
      secret: '',
      active: this.props.webhook.active,
      open: false,
      history: [],
      historyOpen: false,
      itemSelected: false,
      historyIndex: 0,
      dialogSubtitle: 'Select an item to view detailed information.',
      loading: false,
      checkedAll: this.props.webhook.events.length === defaultEvents.length,
      eventsDialogOpen: false,
    };
  }

  getEventCheckboxes() { // eslint-disable-line class-methods-use-this
    return defaultEvents.map(event => (
      <Grid item xs={6} key={event}>
        <FormControlLabel
          label={event}
          control={
            <Checkbox
              className={`checkbox-${event}`}
              key={event}
              value={event}
              checked={this.state.events.includes(event)}
              onChange={this.handleCheck}
              disabled={!this.state.edit}
            />}
        />
      </Grid>
    ));
  }

  getEvents() {
    return this.props.webhook.events.map((event, idx) =>
      (<span key={event} style={style.eventSpan}>
        {event}{idx === this.props.webhook.events.length - 1 ? '' : ','}
      </span>));
  }

  getDialogTitle() {
    return (
      <div style={style.dialogTitleContainer}>
        <span style={style.dialogTitle}>Webhook History</span>
        <br />
        <span style={style.dialogSubtitle} className="history-dialog-subtitle">{this.state.dialogSubtitle}</span>
      </div>
    );
  }

  getHookHistory() {
    api.getWebhookResults(this.props.app, this.props.webhook.id).then(result => (
      this.setState({ history: result.data, loading: false })
    )).catch((error) => {
      this.props.onError(error);
    });
  }

  handleHistoryDialogBack= () => {
    this.setState({
      itemSelected: false,
      historyIndex: 0,
      dialogSubtitle: 'Select an item to view detailed information.',
    });
  }

  handleHistoryDialogOk = () => {
    this.setState({
      historyOpen: false,
      itemSelected: false,
      historyIndex: 0,
    });
  }

  formatHistoryItemTitle(index, subtitle) {
    const date = new Date(this.state.history[index].last_attempt.updated_at).toLocaleString();
    const action = this.state.history[index].last_attempt.request.body.action;
    return subtitle ? `Selected Item: ${date} - ${action}` : `${date} - ${action}`;
  }

  handleConfirmation = () => {
    this.setState({ open: true });
  }

  handleCancelConfirmation = () => {
    this.setState({ open: false });
  }

  handleRemoveWebhook = () => {
    api.deleteWebhook(this.props.app, this.props.webhook.id).then(() => {
      this.props.onComplete('Webhook Deleted');
    }).catch((error) => {
      this.setState({
        loading: false,
        errorMessage: error.response.data,
      });
    });
  }

  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
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

  handleReset = () => {
    this.reset(this.props.webhook.events);
  }

  patchWebhook = () => {
    api.patchWebhook(
      this.props.app,
      this.props.webhook.id,
      /^(HTTP|HTTP|http(s)?:\/\/)/.test(this.state.url) ? this.state.url : `http://${this.state.url}`,
      this.state.events,
      this.state.secret === '' ? null : this.state.secret,
      this.state.active,
    ).then(() => {
      this.props.onComplete('Updated Webhook');
    }).catch((error) => {
      this.reset(this.props.webhook.events);
      this.props.onError(error.response.data);
    });
  }

  handleSave = () => {
    if (!this.checkURL(this.state.url)) {
      this.setState({ urlErrorText: 'Invalid URL' });
    } else if (this.state.events.length === 0) {
      this.setState({ eventErrorText: 'Must select at least one event' });
    } else if (this.state.secret.length > 20) {
      this.setState({ secretErrorText: 'Secret must be less than 20 characters' });
    } else {
      this.setState({
        urlErrorText: '',
        eventErrorText: '',
        secretErrorText: '',
      });
      this.patchWebhook();
    }
  }

  handleHistoryIcon = () => {
    this.getHookHistory();
    this.setState({ historyOpen: true, loading: true });
  }

  openEventsInfoDialog = () => {
    if (this.state.edit) { this.setState({ eventsDialogOpen: true }); }
  }

  closeEventsInfoDialog = () => {
    this.setState({ eventsDialogOpen: false });
  }

  // regex from https://stackoverflow.com/questions/1303872, modified to have http(s) optional
  checkURL(url) { // eslint-disable-line
    return /^(HTTP|HTTP|http(s)?:\/\/)?[A-Za-z0-9]+([\-\.]{1}[A-Za-z0-9]+)*\.[A-Za-z]{2,40}(:[0-9]{1,40})?(\/.*)?$/.test(url); // eslint-disable-line no-useless-escape
  }

  reset = (events) => {
    this.setState({
      errorMessage: '',
      events: events.slice(),
      edit: false,
      urlErrorText: '',
      secretErrorText: '',
      eventErrorText: '',
      url: this.props.webhook.url.slice(),
      secret: '',
      active: this.props.webhook.active,
      open: false,
      history: [],
      checkedAll: this.props.webhook.events.length === defaultEvents.length,
      eventsDialogOpen: false,
    });
  }

  renderEventsInfoDialog() {
    return (
      <Dialog
        className="events-info-dialog"
        open={this.state.eventsDialogOpen}
      >
        <DialogTitle>Description of Events</DialogTitle>
        <DialogContent>
          {eventDescriptions.data.map((event, index) => (
            <p key={`${event}.length`}><b>{defaultEvents[index]}</b><br />{event}</p>
          ))}
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

  renderWebhookTitle() {
    return (
      <Grid container style={style.titleGrid}>
        <Grid item xs={6} style={style.titleGrid.left}>
          <div style={style.titleContainer}>
            {this.props.webhook.active ? (
              <ActiveIcon color="primary" style={style.statusIcon} />
            ) : (
              <InactiveIcon style={{ ...style.statusIcon, color: 'rgba(0, 0, 0, 0.3)' }} />
            )}
            <div>
              <div className={`webhook-title-url-${this.props.rowindex}`} style={style.webhookUrl}>
                {this.props.webhook.url}
              </div>
              <div className={'webhook-title-id'} style={style.webhookId}>
                {this.props.webhook.id}
              </div>
            </div>
          </div>
        </Grid>
        <Grid item xs={6} style={style.titleGrid.right}>
          <div style={style.eventsContainer}>
            {this.getEvents(this.props.webhook)}
          </div>
        </Grid>
      </Grid>
    );
  }

  renderWebhookInfo() {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell style={{ display: 'flex', flexDirection: 'row', paddingRight: '10px' }}>
              <TextField
                style={style.urlTextField}
                className="edit-url"
                label="URL"
                type="text"
                value={this.state.url}
                onChange={this.handleChange('url')}
                error={!!this.state.urlErrorText}
                helperText={this.state.urlErrorText ? this.state.urlErrorText : ''}
                disabled={!this.state.edit}
              />
              <TextField
                inputProps={{ maxLength: '30' }}
                style={style.secretTextField}
                className="edit-secret"
                label="Secret"
                type="password"
                placeholder="**********"
                value={this.state.secret}
                onChange={this.handleChange('secret')}
                error={!!this.state.secretErrorText}
                helperText={this.state.secretErrorText ? this.state.secretErrorText : ''}
                disabled={!this.state.edit}
              />
            </TableCell>
            <TableCell>
              <FormControlLabel
                control={
                  <Switch
                    className="active-toggle"
                    label="Active"
                    disabled={!this.state.edit}
                    checked={this.state.active}
                    onChange={() => { this.setState({ active: !this.state.active }); }}
                  />
                }
                labelPlacement="start"
                label="Active"
              />
            </TableCell>
            <TableCell style={style.iconButtonCell}>
              {this.state.edit ? (
                <Tooltip placement="top-start" title="Save">
                  <IconButton className="webhook-save" onClick={this.handleSave}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip placement="top-start" title="Edit">
                  <IconButton
                    className="webhook-edit"
                    onClick={() => this.setState({ edit: true })}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </TableCell>
            <TableCell style={style.iconButtonCell}>
              {!this.state.edit && (
                <Tooltip placement="top-start" title="History">
                  <IconButton
                    className="webhook-history"
                    onClick={this.handleHistoryIcon}
                  >
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
              )}
            </TableCell>
            <TableCell style={style.iconButtonCell}>
              {!this.state.edit ? (
                <Tooltip placement="top-start" title="Remove">
                  <IconButton
                    className="webhook-remove"
                    onClick={() => this.handleConfirmation(this.props.webhook)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Back" placement="top-start">
                  <IconButton
                    className="webhook-back"
                    onClick={this.handleReset}
                  >
                    <BackIcon />
                  </IconButton>
                </Tooltip>
              )}
              <ConfirmationModal
                className="delete-webhook"
                open={this.state.open}
                onOk={this.handleRemoveWebhook}
                onCancel={this.handleCancelConfirmation}
                message="Are you sure you want to delete this webhook?"
              />
            </TableCell>
          </TableRow>
          <TableRow style={style.eventsRow}>
            <TableCell style={style.eventsCell} colSpan={3}>
              <div>
                <div style={style.eventsHeader}>
                  <p style={style.eventsLabel}>Events</p>
                  <Tooltip
                    placement="right"
                    title={this.state.edit ? 'Click for Descriptions' : ''}
                  >
                    <IconButton
                      className="events-info-button"
                      onClick={this.openEventsInfoDialog}
                      color={this.state.edit ? 'secondary' : undefined}
                      style={this.state.edit ? style.infoButton : {
                        ...style.infoButton, color: 'rgba(0,0,0,0.3)',
                      }}
                      disabled={!this.state.edit}
                    >
                      <HelpIcon style={style.infoIcon} />
                    </IconButton>
                  </Tooltip>
                </div>
                {this.renderEventsInfoDialog()}
                <div style={style.eventsTwoColumns} className="events">
                  <Grid container spacing={8} style={style.gridContainer}>
                    {this.getEventCheckboxes(this.props.webhook)}
                    <Grid
                      item
                      xs={12}
                      style={
                        this.state.edit ?
                          style.checkAllContainer.active : style.checkAllContainer.inactive
                      }
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            value="Check All"
                            key="Check All"
                            className="checkbox-check-all"
                            checked={this.state.checkedAll}
                            onChange={this.handleCheckAll}
                            disabled={!this.state.edit}
                          />
                        }
                        label="Check All"
                      />
                    </Grid>
                  </Grid>
                </div>
                {this.state.eventErrorText && (
                  <div style={style.eventsError} className="events-errorText">
                    {this.state.eventErrorText}
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderHistoryDialog() {
    return (
      <Dialog
        className="history-dialog"
        open={this.state.historyOpen}
        onClose={this.handleHistoryDialogOk}
        maxWidth="md"
      >
        <DialogTitle>
          {this.getDialogTitle()}
        </DialogTitle>
        <DialogContent>
          {this.state.loading ? (
            <div style={style.refresh.div}>
              <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
            </div>
          ) : (this.renderHistoryItems())}
        </DialogContent>
        <DialogActions>
          <span>
            {this.state.itemSelected && (
              <Button className="back" color="secondary" onClick={this.handleHistoryDialogBack}>Back</Button>
            )}
            <Button className="ok" color="primary" onClick={this.handleHistoryDialogOk}>Ok</Button>
          </span>
        </DialogActions>
      </Dialog>
    );
  }

  renderHistoryItems() {
    if (this.state.itemSelected) {
      return (
        <Table className="history-info-table">
          <TableBody>
            {objectToTable('', this.state.history[this.state.historyIndex])}
          </TableBody>
        </Table>
      );
    }
    return (
      <Table style={style.historyDialogTable}>
        <TableBody>
          {this.state.history.length > 0 ? (
            this.state.history.map((historyItem, idx) => (
              <TableRow
                className={`historyItem-${idx}`}
                key={historyItem.id}
                style={style.tableRowHeight}
                onClick={() => this.setState({
                  itemSelected: true,
                  historyIndex: idx,
                  dialogSubtitle: this.formatHistoryItemTitle(idx, true),
                })}
                hover
              >
                <TableCell style={style.noPadding}>
                  {this.formatHistoryItemTitle(idx, false)}
                </TableCell>
              </TableRow>
            ))
          ) : (<p className="history-dialog-noEvents"><i>No history events found.</i></p>)
          }
        </TableBody>
      </Table>
    );
  }

  render() {
    return (
      <MuiThemeProvider theme={muiTheme}>
        <ExpansionPanel style={style.expansionPanel} className={`webhook-item-${this.props.rowindex}`}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            className={'webhook-title'}
          >
            {this.renderWebhookTitle()}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="webhook-info">
            {this.renderWebhookInfo()}
          </ExpansionPanelDetails>
        </ExpansionPanel>
        {this.state.historyOpen && this.renderHistoryDialog()}
      </MuiThemeProvider>
    );
  }
}

Webhook.propTypes = {
  app: PropTypes.string.isRequired,
  rowindex: PropTypes.number.isRequired,
  webhook: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onError: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};
