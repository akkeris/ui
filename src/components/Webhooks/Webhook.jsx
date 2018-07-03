import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import ActiveIcon from 'material-ui/svg-icons/social/notifications';
import InactiveIcon from 'material-ui/svg-icons/social/notifications-paused';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import SaveIcon from 'material-ui/svg-icons/content/save';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import Checkbox from 'material-ui/Checkbox';
import api from '../../services/api';

import ConfirmationModal from '../ConfirmationModal';

const defaultEvents = ['release', 'build', 'formation_change', 'logdrain_change', 'addon_change', 'config_change', 'destroy', 'preview', 'crashed', 'released'];

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
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
      <TableRow key={prefix ? `${prefix}.${key}` : key}>
        <TableRowColumn colSpan="2">
          <div>
            <b>{prefix ? `${prefix}.${key}` : key}</b>
          </div>
          <div style={{ wordWrap: 'break-word' }}>
            {input[key]}
          </div>
        </TableRowColumn>
      </TableRow>
    );
  });
}

const style = {
  buttonMargin: {
    marginRight: '20px',
  },
  checkboxWidth: {
    width: '175px',
  },
  dialogTitle: {
    fontSize: '22px',
    lineHeight: '32px',
    fontWeight: '400',
  },
  dialogSubTitle: {
    fontSize: '16px',
  },
  eventsError: {
    color: 'red',
    paddingTop: '20px',
  },
  eventsTwoColumns: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '200%',
  },
  historyDialog: {
    width: '55%',
    maxWidth: 'none',
    border: '0',
  },
  icon: {
    activeIcon: {
      height: '18px',
      width: '18px',
      color: 'green',
      position: 'relative',
      padding: '0 10px 0 10px',
    },
    inactiveIcon: {
      height: '18px',
      width: '18px',
      color: 'grey',
      position: 'relative',
      padding: '0 10px 0 10px',
    },
  },
  label: {
    enabled: {
      color: 'black',
    },
    disabled: {
      color: 'rgba(0, 0, 0, 0.3)',
    },
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
  tableRow: {
    column: {
      end: {
        float: 'right',
      },
      event: {
        padding: '0px 2px 0px 2px',
      },
      events: {
        fontSize: '14px',
        display: 'flex',
        flexWrap: 'wrap',
      },
      noLeftPadding: {
        paddingLeft: '0px',
      },
      sub: {
        fontSize: '11px',
        textTransform: 'uppercase',
      },
      title: {
        fontSize: '16px',
      },
    },
    eventsRow: {
      display: 'block',
      overflow: 'visible',
    },
    noBorder: {
      borderBottom: 0,
      overflow: 'visible',
    },
    standardHeight: {
      height: '58px',
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
    };
  }

  getEventCheckboxes() { // eslint-disable-line class-methods-use-this
    return defaultEvents.map(event => (
      <Checkbox
        className={`checkbox-${event}`}
        key={event}
        value={event}
        label={event}
        disabled={!this.state.edit}
        checked={this.state.events.includes(event)}
        onCheck={this.handleCheck}
        style={style.checkboxWidth}
      />
    ));
  }

  getEvents() {
    return this.props.webhook.events.map((event, idx) =>
      (<span key={event} style={style.tableRow.column.event}>
        {event}{idx === this.props.webhook.events.length - 1 ? '' : ','}
      </span>));
  }

  getHistory() {
    if (this.state.itemSelected) {
      return (
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false} selectable={false} showRowHover={false}>
            {objectToTable('', this.state.history[this.state.historyIndex])}
          </TableBody>
        </Table>
      );
    }
    return (
      <Table style={{ paddingLeft: '10px' }}>
        <TableBody displayRowCheckbox={false} selectable={false} showRowHover>
          {this.state.history.length > 0 ? (
            this.state.history.map((historyItem, idx) => (
              <TableRow
                className={`historyItem-${idx}`}
                key={historyItem.id}
                style={style.tableRow.standardHeight}
                onTouchTap={() => this.setState({
                  itemSelected: true,
                  historyIndex: idx,
                  dialogSubtitle: this.formatHistoryItemTitle(idx, true),
                })}
              >
                <TableRowColumn style={style.noPadding}>
                  {this.formatHistoryItemTitle(idx, false)}
                </TableRowColumn>
              </TableRow>
            ))
          ) : (<p><i>No history events found.</i></p>)
          }
        </TableBody>
      </Table>
    );
  }

  getDialogTitle() {
    return (
      <div>
        <span style={style.dialogTitle}>Webhook History</span>
        <br />
        <span style={style.dialogSubTitle}>{this.state.dialogSubtitle}</span>
      </div>
    );
  }

  getHistoryDialog() {
    return (
      <Dialog
        className="history-dialog"
        open={this.state.historyOpen}
        title={this.getDialogTitle()}
        repositionOnUpdate
        autoScrollBodyContent
        contentStyle={style.historyDialog}
        actions={
          <span>
            {this.state.itemSelected && (
              <FlatButton className="back" label="Back" secondary onTouchTap={this.handleHistoryDialogBack} />
            )}
            <FlatButton className="ok" label="Ok" primary onTouchTap={this.handleHistoryDialogOk} />
          </span>
        }
      >
        {this.state.loading ? (
          <MuiThemeProvider muiTheme={muiTheme}>
            <div style={style.refresh.div}>
              <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
            </div>
          </MuiThemeProvider>
        ) : (this.getHistory())}
      </Dialog>
    );
  }

  loadHistoryFromApi() {
    api.getWebhookResults(this.props.app, this.props.webhook.id).then(result => (
      this.setState({ history: result.data, loading: false })
    )).catch((error) => {
      this.props.onError(error);
    });
  }

  handleHistoryDialogOk = () => {
    this.setState({
      historyOpen: false,
      itemSelected: false,
      historyIndex: 0,
    });
  }

  handleHistoryDialogBack= () => {
    this.setState({
      itemSelected: false,
      historyIndex: 0,
      dialogSubtitle: 'Select an item to view detailed information.',
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

  handleCheck = (event, checked) => {
    const events = this.state.events;
    if (checked) {
      events.push(event.target.value);
    } else {
      events.splice(events.indexOf(event.target.value), 1);
    }
    this.setState({ events });
  }

  handleReset = () => {
    this.reset(this.props.webhook.events);
  }

  patchWebhook = () => {
    api.patchWebhook(
      this.props.app,
      this.props.webhook.id,
      this.state.url,
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
    this.loadHistoryFromApi();
    this.setState({ historyOpen: true, loading: true });
  }

  // regex from https://stackoverflow.com/questions/1303872, modified to have http(s) optional
  checkURL(url) { // eslint-disable-line
    return /^(HTTP|HTTP|http(s)?:\/\/)?(www\.)?[A-Za-z0-9]+([\-\.]{1}[A-Za-z0-9]+)*\.[A-Za-z]{2,40}(:[0-9]{1,40})?(\/.*)?$/.test(url) // eslint-disable-line
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
    });
  }

  render() {
    return (
      <TableRow
        className={this.props.webhook.id}
        key={this.props.webhook.id}
        style={style.tableRow.standardHeight}
      >
        <TableRowColumn style={style.noPadding}>
          <Card style={{ boxShadow: 'none' }} className={`webhook-item-${this.props.rowindex}`}>
            <CardTitle
              style={style.noPadding}
              actAsExpander
              showExpandableButton
              className={'webhook-title'}
            >
              <Table className="webhook-title-table">
                <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
                  <TableRow
                    className={this.props.webhook.id}
                    key={this.props.webhook.id}
                    style={style.tableRow.standardHeight}
                  >
                    <TableRowColumn style={style.tableRow.column.noLeftPadding}>
                      <div style={style.titleContainer}>
                        {this.props.webhook.active && (
                          <ActiveIcon style={style.icon.activeIcon} />
                        )}
                        {!this.props.webhook.active && (
                          <InactiveIcon style={style.icon.inactiveIcon} />
                        )}
                        <div>
                          <div className={`webhook-title-url-${this.props.rowindex}`} style={style.tableRow.column.title}>
                            {this.props.webhook.url}
                          </div>
                          <div className={'webhook-title-id'} style={style.tableRow.column.sub}>
                            {this.props.webhook.id}
                          </div>
                        </div>
                      </div>
                    </TableRowColumn>
                    <TableRowColumn>
                      <div style={style.tableRow.column.events}>
                        {this.getEvents(this.props.webhook)}
                      </div>
                    </TableRowColumn>
                  </TableRow>
                </TableBody>
              </Table>
            </CardTitle>
            <CardText expandable className={`${this.props.webhook.id}-info`}>
              <Table wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
                <TableBody displayRowCheckbox={false} showRowHover={false} selectable={false}>
                  <TableRow style={style.tableRow.noBorder} selectable={false}>
                    <TableRowColumn>
                      <div>
                        <TextField
                          className="edit-url"
                          floatingLabelFixed
                          floatingLabelText="Edit URL"
                          type="text"
                          default={this.props.webhook.url}
                          value={this.state.url}
                          onChange={this.handleURLChange}
                          errorText={this.state.urlErrorText}
                          disabled={!this.state.edit}
                          floatingLabelStyle={this.state.edit ? style.label.enabled : null}
                        />
                      </div>
                    </TableRowColumn>
                    <TableRowColumn>
                      <div>
                        <TextField
                          maxLength="20"
                          className="edit-secret"
                          floatingLabelFixed
                          floatingLabelText="Edit Secret"
                          type="password"
                          hintText="**********"
                          value={this.state.secret}
                          onChange={this.handleSecretChange}
                          errorText={this.state.secretErrorText}
                          disabled={!this.state.edit}
                          floatingLabelStyle={this.state.edit ? style.label.enabled : null}
                        />
                      </div>
                    </TableRowColumn>
                    <TableRowColumn>
                      <div>
                        <Toggle
                          label="Active"
                          style={style.toggle}
                          disabled={!this.state.edit}
                          toggled={this.state.active}
                          onToggle={() => { this.setState({ active: !this.state.active }); }}
                        />
                      </div>
                    </TableRowColumn>
                    <TableRowColumn style={{ overflow: 'visible' }}>
                      <div style={style.tableRow.column.end}>
                        {!this.state.edit ? (
                          <IconButton
                            style={style.buttonMargin}
                            className="webhook-edit"
                            tooltip="Edit"
                            tooltipPosition="top-left"
                            onTouchTap={() => this.setState({ edit: true })}
                          >
                            <EditIcon />
                          </IconButton>
                        ) : (
                          <span>
                            <IconButton
                              style={style.buttonMargin}
                              className="webhook-save"
                              tooltip="Save"
                              tooltipPosition="top-left"
                              onTouchTap={this.handleSave}
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton
                              style={style.buttonMargin}
                              className="webhook-back"
                              tooltip="Back"
                              tooltipPosition="top-left"
                              onTouchTap={this.handleReset}
                            >
                              <BackIcon />
                            </IconButton>
                          </span>
                        )}
                        <IconButton
                          style={style.buttonMargin}
                          className="webhook-history"
                          tooltip="History"
                          tooltipPosition="top-left"
                          onTouchTap={this.handleHistoryIcon}
                        >
                          <HistoryIcon />
                          {this.getHistoryDialog()}
                        </IconButton>
                        <IconButton
                          className="webhook-remove"
                          tooltip="Remove"
                          tooltipPosition="top-left"
                          onTouchTap={() => this.handleConfirmation(this.props.webhook)}
                        >
                          <ConfirmationModal
                            className="delete-webhook"
                            open={this.state.open}
                            onOk={this.handleRemoveWebhook}
                            onCancel={this.handleCancelConfirmation}
                            message="Are you sure you want to delete this webhook?"
                          />
                          <RemoveIcon />
                        </IconButton>
                      </div>
                    </TableRowColumn>
                  </TableRow>
                  <TableRow selectable={false} style={style.tableRow.eventsRow}>
                    <TableRowColumn style={{ overflow: 'visible' }}>
                      <div>
                        <h3 style={this.state.edit ? null : style.label.disabled}>Events</h3>
                        <div style={style.eventsTwoColumns} className="events">
                          {this.getEventCheckboxes(this.props.webhook)}
                        </div>
                        {this.state.eventErrorText && (
                          <div style={style.eventsError} className="events-errorText">
                            {this.state.eventErrorText}
                          </div>
                        )}
                      </div>
                    </TableRowColumn>
                  </TableRow>
                </TableBody>
              </Table>
            </CardText>
          </Card>
        </TableRowColumn>
      </TableRow>
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
