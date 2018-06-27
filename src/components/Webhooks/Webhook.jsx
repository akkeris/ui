import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import Checkbox from 'material-ui/Checkbox';
import api from '../../services/api';

import ConfirmationModal from '../ConfirmationModal';

const style = {
  toggle: {
    width: '35%',
  },
  noPadding: {
    padding: 0,
  },
  table: {
    overflow: 'auto',
  },
  tableRow: {
    height: '58px',
  },
  tableRowColumn: {
    div: {
      overflow: 'visible',
    },
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
    icon: {
      width: '58px',
    },
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '350px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
};

export default class Webhook extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      confirmWebhookOpen: false,
      message: '',
      new: false,
      submitFail: false,
      submitMessage: '',
      events: [],
      edit: false,
      urlErrorText: '',
      secretErrorText: '',
      url: '',
      secret: '',
    };
  }

  getEventCheckboxes() { // eslint-disable-line class-methods-use-this
    return this.props.webhook.events.map(event => (
      <Checkbox
        className={`checkbox-${event}`}
        key={event}
        value={event}
        label={event}
      />
    ));
  }

  getEvents() { // eslint-disable-line class-methods-use-this
    return this.props.webhook.events.map((event, idx) => {
      if (idx === this.props.webhook.events.length - 1) {
        return <span key={event} style={style.tableRowColumn.event}>{event} </span>;
      } else { //eslint-disable-line
        return <span key={event} style={style.tableRowColumn.event}>{event},</span>;
      }
    });
  }

  handleConfirmation = () => {
    this.setState({ open: true });
  }

  handleCancelConfirmation = () => {
    this.setState({ open: false });
  }

  handleRemoveWebhook = () => {
    // this.setState({ loading: true });
    api.deleteWebhook(this.props.app, this.props.webhook.id).then(() => {
      this.props.onComplete('Webhook Deleted');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        loading: false,
        new: false,
        confirmWebhookOpen: false,
      });
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
                  <TableRow style={{ borderBottom: 0, overflow: 'visible' }} selectable={false}>
                    <TableRowColumn>
                      <div>
                        <TextField className="edit-url" floatingLabelFixed="true" floatingLabelText="Edit URL" type="text" hintText={this.props.webhook.url} value={this.state.url} onChange={this.handleURLChange} errorText={this.state.urlErrorText} disabled={!this.state.edit} />
                      </div>
                    </TableRowColumn>
                    <TableRowColumn>
                      <div>
                        <TextField className="edit-secret" floatingLabelFixed="true" floatingLabelText="Edit Secret" type="text" hintText="**********" value={this.state.secret} onChange={this.handleSecretChange} errorText={this.state.secretErrorText} disabled={!this.state.edit} />
                      </div>
                    </TableRowColumn>
                    <TableRowColumn>
                      <div>
                        <Toggle
                          label="Active"
                          style={style.toggle}
                          disabled={!this.state.edit}
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
                          <IconButton className="webhook-save" tooltip="Save" tooltipPosition="top-left" onTouchTap={this.handlePatchFormation}>
                            <SaveIcon />
                          </IconButton>
                        )}
                        <IconButton className="webhook-remove" tooltip="Remove" tooltipPosition="bottom-left" onTouchTap={() => this.handleConfirmation(this.props.webhook)} >
                          <ConfirmationModal className="delete-webhook" open={this.state.open} onOk={this.handleRemoveWebhook} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this webhook?" />
                          <RemoveIcon />
                        </IconButton>
                      </div>
                    </TableRowColumn>
                  </TableRow>
                  <TableRow selectable={false}>
                    <TableRowColumn>
                      <div>
                        {!this.state.edit && (
                          <h3 style={style.disabled}>Events</h3>
                        )}
                        {this.state.edit && (
                          <h3>Events</h3>
                        )}
                        <div style={style.events} className="events">
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
