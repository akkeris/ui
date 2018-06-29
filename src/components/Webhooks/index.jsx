import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import api from '../../services/api';
import NewWebhook from './NewWebhook';
import Webhook from './Webhook';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  headerLeftPadding: {
    paddingLeft: '36px',
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
  table: {
    overflow: 'auto',
  },
};

export default class Webhooks extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      webhooks: [],
      loading: true,
      open: false,
      confirmWebhookOpen: false,
      message: '',
      new: false,
      submitFail: false,
      submitMessage: '',
      events: [],
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
    return this.state.webhooks.map((webhook, rowindex) => (
      <Webhook
        webhook={webhook}
        rowindex={rowindex}
        app={this.props.app}
        onComplete={this.reload}
        onError={this.handleError}
        key={webhook.id}
      />
    ));
  }

  handleError = (message) => {
    this.setState({
      submitMessage: message,
      submitFail: true,
      loading: false,
      open: false,
      message: '',
    });
  }

  handleNewWebhook = () => {
    this.setState({ new: true });
  }

  handleNewWebhookCancel = () => {
    this.setState({ new: false });
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
              { <NewWebhook app={this.props.app} onComplete={this.reload} /> }
            </div>
          )}
          <Table className="webhook-list" style={style.table}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
              <TableRow>
                <TableHeaderColumn style={style.headerLeftPadding}>Webhook</TableHeaderColumn>
                <TableHeaderColumn>Events</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
              {this.getWebhooks()}
            </TableBody>
          </Table>
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
