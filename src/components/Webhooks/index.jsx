import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import api from '../../services/api';
// import NewWebhook from './NewWebhook';
import ConfirmationModal from '../ConfirmationModal';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  tableRow: {
    height: '58px',
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
      // padding: '10px 0px 10px 0px',

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

export default class Webhooks extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      webhooks: [],
      webhook: null,
      loading: true,
      open: false,
      confirmWebhookOpen: false,
      message: '',
      new: false,
      submitFail: false,
      submitMessage: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      api.getAppWebhooks(this.props.app).then((response) => {
        this.setState({
          webhooks: response.data,
          loading: false,
        });
      });
    }
  }

  getWebhooks() {
    return this.state.webhooks.map(webhook => (
      <TableRow className={webhook.id} key={webhook.id} style={style.tableRow}>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{webhook.url}</div>
          <div style={style.tableRowColumn.sub}>{webhook.id}</div>
        </TableRowColumn>
        <TableRowColumn>
          <div style={style.tableRowColumn.events}>
            {webhook.events.map((event, idx) => { //eslint-disable-line
              if (idx === webhook.events.length - 1) {
                return <span key={event} style={style.tableRowColumn.event}>{event} </span>;
              } else { //eslint-disable-line
                return <span key={event} style={style.tableRowColumn.event}>{event},</span>;
              }
            })}
          </div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton className="webhook-remove" onTouchTap={() => this.handleWebhookConfirmation(webhook)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  handleNewWebhook = () => {
    this.setState({ new: true });
  }

  handleNewWebhookCancel = () => {
    this.setState({ new: false });
  }

  handleRemoveWebhook = () => {
  //   this.setState({ loading: true });
  //   api.deleteWebhook(this.props.app, this.state.addon.id).then(() => {
  //     this.reload('Addon Deleted');
  //   }).catch((error) => {
  //     this.setState({
  //       submitMessage: error.response.data,
  //       submitFail: true,
  //       loading: false,
  //       new: false,
  //       confirmAddonOpen: false,
  //       confirmaAttachmentOpen: false,
  //       attach: false,
  //     });
  //   });
  }

  handleWebhookConfirmation = (webhook) => {
    this.setState({
      confirmWebhookOpen: true,
      webhook,
    });
  }

  handleCancelWebhookConfirmation = () => {
    this.setState({
      confirmWebhookOpen: false,
      webhook: null,
    });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  handleDialogClose= () => {
    this.setState({ submitFail: false });
  }

  reload = (message) => {
    this.setState({ loading: true });
    api.getAppWebhooks(this.props.app).then((response) => {
      this.setState({
        webhooks: response.data,
        loading: false,
        new: false,
        message,
        open: true,
        confirmWebhookOpen: false,
      });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          {!this.state.new && (
            <Paper zDepth={0}>
              <IconButton
                className="new-webhook"
                onTouchTap={this.handleNewWebhook}
                tooltip="New Webhook"
                tooltipPosition="bottom-left"
              >
                <AddIcon />
              </IconButton>
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton className="webhook-cancel" onTouchTap={this.handleNewWebhookCancel}><RemoveIcon /></IconButton>
              {/* <NewAddon app={this.props.app} onComplete={this.reload} /> */}
            </div>
          )}
          <Table className="webhook-list">
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
              <TableRow>
                <TableHeaderColumn>Webhook</TableHeaderColumn>
                <TableHeaderColumn>Events</TableHeaderColumn>
                <TableHeaderColumn style={style.tableRowColumn.icon}>Remove</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
              {this.getWebhooks()}
            </TableBody>
          </Table>
          <ConfirmationModal className="remove-webhook-confirm" open={this.state.confirmWebhookOpen} onOk={this.handleRemoveWebhook} onCancel={this.handleCancelWebhookConfirmation} message="Are you sure you want to delete this webhook?" />
          <Dialog
            className="webhook-error"
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                className="ok"
                label="Ok"
                primary
                onTouchTap={this.handleDialogClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
          <Snackbar
            className="webhook-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

Webhooks.propTypes = {
  app: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

