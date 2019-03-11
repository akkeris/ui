import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, Button, IconButton, Paper, Snackbar, Typography,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell, Tooltip, Grid,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';

import api from '../../services/api';
import NewWebhook from './NewWebhook';
import Webhook from './Webhook';

const style = {
  headerLeftPadding: {
    paddingLeft: '36px',
    minWidth: '50%',
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
    this.getWebhooks();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getWebhooks = async () => {
    const { data: webhooks } = await api.getAppWebhooks(this.props.app);
    if (this._isMounted) {
      this.setState({ webhooks, loading: false });
    }
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

  reload = async (message) => {
    this.setState({ loading: true });
    const { data: webhooks } = await api.getAppWebhooks(this.props.app);
    this.setState({
      webhooks,
      loading: false,
      new: false,
      message,
      open: true,
      confirmWebhookOpen: false,
    });
  }

  renderWebhooks() {
    return this.state.webhooks.map((webhook, rowindex) => (
      <TableRow key="webhook.id">
        <TableCell style={{ padding: 0 }}>
          <Webhook
            webhook={webhook}
            rowindex={rowindex}
            app={this.props.app}
            onComplete={this.reload}
            onError={this.handleError}
            key={webhook.id}
          />
        </TableCell>
      </TableRow>
    ));
  }

  render() {
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div>
        {!this.state.new ? (
          <Paper elevation={0}>
            <Tooltip placement="bottom-end" title="New Webhook">
              <IconButton
                className="new-webhook"
                onClick={this.handleNewWebhook}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        ) : (
          <div>
            <IconButton className="webhook-cancel" onClick={this.handleNewWebhookCancel}><RemoveIcon /></IconButton>
            { <NewWebhook app={this.props.app} onComplete={this.reload} /> }
          </div>
        )}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ padding: 0, paddingBottom: '10px' }}>
                <Grid container>
                  <Grid item xs={6} style={style.headerLeftPadding}>Webhook</Grid>
                  <Grid item xs={6}>Events</Grid>
                </Grid>
              </TableCell>
            </TableRow>
          </TableHead>
          {this.state.webhooks && this.state.webhooks.length > 0 && (
            <TableBody className="webhook-list">
              {this.renderWebhooks()}
            </TableBody>
          )}
        </Table>
        <Dialog
          open={this.state.submitFail}
          className="webhook-error"
        >
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
            <Button label="Ok" color="primary" onClick={this.handleDialogClose}>Ok</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          className="webhook-snack"
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

Webhooks.propTypes = {
  app: PropTypes.string.isRequired,
};
