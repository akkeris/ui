import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import SaveIcon from 'material-ui/svg-icons/content/save';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import Checkbox from 'material-ui/Checkbox';
import api from '../../services/api';

import ConfirmationModal from '../ConfirmationModal';

const defaultEvents = ['release', 'build', 'formation_change', 'logdrain_change', 'addon_change', 'config_change', 'destroy', 'preview', 'crashed', 'released'];

const style = {
  enabled: {
    color: 'black',
  },
  toggle: {
    width: '35%',
  },
  disabled: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
  noPadding: {
    padding: 0,
  },
  tableRow: {
    height: '58px',
  },
  eventsTwoColumns: {
    columnCount: '2',
  },
  eventsTwoColumnsRow: {
    display: 'block',
  },
  tableRowNoBorder: {
    borderBottom: 0,
    overflow: 'visible',
  },
  tableRowColumn: {
    title: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
    events: {
      fontSize: '14px',
      display: 'flex',
      flexWrap: 'wrap',
    },
    event: {
      padding: '0px 2px 0px 2px',
    },
    end: {
      float: 'right',
    },
  },
};

export default class Webhook extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      message: '',
      errorMessage: '',
      events: this.props.webhook.events.slice(),
      edit: false,
      urlErrorText: '',
      secretErrorText: '',
      url: '',
      secret: '',
      active: this.props.webhook.active,
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
      />
    ));
  }

  getEvents() {
    return this.props.webhook.events.map((event, idx) => <span key={event} style={style.tableRowColumn.event}>{event}{idx === this.props.webhook.events.length - 1 ? '' : ','} </span>);
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

  reset = (events) => {
    this.setState({
      message: '',
      errorMessage: '',
      events: events.slice(),
      edit: false,
      urlErrorText: '',
      secretErrorText: '',
      url: '',
      secret: '',
      active: this.props.webhook.active,
    });
  }

  render() {
    return (
      <TableRow
        className={this.props.webhook.id}
        key={this.props.webhook.id}
        style={style.tableRow}
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
                    style={style.tableRow}
                  >
                    <TableRowColumn>
                      <div className={'webhook-title-url'} style={style.tableRowColumn.title}>{this.props.webhook.url}</div>
                      <div className={'webhook-title-id'} style={style.tableRowColumn.sub}>{this.props.webhook.id}</div>
                    </TableRowColumn>
                    <TableRowColumn>
                      <div style={style.tableRowColumn.events}>
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
                  <TableRow style={style.rowNoBorder} selectable={false}>
                    <TableRowColumn>
                      <div>
                        <TextField
                          className="edit-url"
                          floatingLabelFixed="true"
                          floatingLabelText="Edit URL"
                          type="text"
                          hintText={this.props.webhook.url}
                          value={this.state.url}
                          onChange={this.handleURLChange}
                          errorText={this.state.urlErrorText}
                          disabled={!this.state.edit}
                          floatingLabelStyle={this.state.edit ? style.enabled : null}
                        />
                      </div>
                    </TableRowColumn>
                    <TableRowColumn>
                      <div>
                        <TextField
                          className="edit-secret"
                          floatingLabelFixed="true"
                          floatingLabelText="Edit Secret"
                          type="text"
                          hintText="**********"
                          value={this.state.secret}
                          onChange={this.handleSecretChange}
                          errorText={this.state.secretErrorText}
                          disabled={!this.state.edit}
                          floatingLabelStyle={this.state.edit ? style.enabled : null}
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
                      <div style={style.tableRowColumn.end}>
                        {!this.state.edit && (
                          <IconButton className="webhook-edit" tooltip="Edit" tooltipPosition="top-left" onTouchTap={() => this.setState({ edit: true })} >
                            <EditIcon />
                          </IconButton>
                        )}
                        {this.state.edit && (
                          <span>
                            <IconButton className="webhook-save" tooltip="Save" tooltipPosition="top-left" onTouchTap={this.handlePatchFormation}>
                              <SaveIcon />
                            </IconButton>
                            <IconButton className="webhook-back" tooltip="Back" tooltipPosition="top-left" onTouchTap={this.handleReset} >
                              <BackIcon />
                            </IconButton>
                          </span>
                        )}
                        <IconButton className="webhook-remove" tooltip="Remove" tooltipPosition="bottom-left" onTouchTap={() => this.handleConfirmation(this.props.webhook)} >
                          <ConfirmationModal className="delete-webhook" open={this.state.open} onOk={this.handleRemoveWebhook} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this webhook?" />
                          <RemoveIcon />
                        </IconButton>
                      </div>
                    </TableRowColumn>
                  </TableRow>
                  <TableRow selectable={false} style={style.eventsTwoColumnsRow}>
                    <TableRowColumn>
                      <div>
                        <h3 style={this.state.edit ? null : style.disabled}>Events</h3>
                        <div style={style.eventsTwoColumns} className="events">
                          {this.getEventCheckboxes(this.props.webhook)}
                        </div>
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
  onComplete: PropTypes.func.isRequired,
};
