import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button, IconButton, Snackbar, Paper, CircularProgress, Dialog,
  Tooltip,
} from '@material-ui/core';


import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
// import RefreshIndicator from 'material-ui/RefreshIndicator';
// import IconButton from 'material-ui/IconButton';
// import Snackbar from 'material-ui/Snackbar';
// import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import AddIcon from 'material-ui/svg-icons/content/add';
import AttachIcon from 'material-ui/svg-icons/communication/call-merge';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
// import Dialog from 'material-ui/Dialog';
// import FlatButton from 'material-ui/FlatButton';

import api from '../../services/api';
import NewAddon from './NewAddon';
import AttachAddon from './AttachAddon';
import ConfirmationModal from '../ConfirmationModal';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  addonDialog: {
    width: '35%',
  },
  tableRow: {
    height: '58px',
  },
  tableRowPointer: {
    height: '58px',
    cursor: 'pointer',
  },
  tableRowColumn: {
    title: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
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

export default class Addons extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      addons: [],
      addon: null,
      attachment: null,
      loading: true,
      open: false,
      confirmAddonOpen: false,
      confirmAttachmentOpen: false,
      message: '',
      new: false,
      submitFail: false,
      submitMessage: '',
      attach: false,
      addonAttachments: [],
      addonsLoaded: false,
      attachmentsLoaded: false,
      currentAddon: {},
      addonDialogOpen: false,
    };
    this.loadAddons();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getAddons() {
    return this.state.addons.map(addon => (
      <TableRow
        className={addon.addon_service.name}
        key={addon.id}
        style={style.tableRowPointer}
      >
        <TableRowColumn
          onClick={() => this.setState({ currentAddon: addon, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{addon.addon_service.name}</div>
          <div style={style.tableRowColumn.sub}>{addon.id}</div>
        </TableRowColumn>
        <TableRowColumn
          onClick={() => this.setState({ currentAddon: addon, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{addon.plan.name}</div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton className="addon-remove" onClick={() => this.handleAddonConfirmation(addon)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  getAddonAttachments() {
    return this.state.addonAttachments.map((attachment, index) => (
      <TableRow
        className={`${attachment.name} addon-attachment-list-${index}`}
        key={attachment.id}
        style={style.tableRowPointer}
      >
        <TableRowColumn
          onClick={() => this.setState({ currentAddon: attachment, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{attachment.name}</div>
          <div style={style.tableRowColumn.sub}>{attachment.id}</div>
        </TableRowColumn>
        <TableRowColumn
          onClick={() => this.setState({ currentAddon: attachment, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{attachment.addon.plan.name}</div>
        </TableRowColumn>
        <TableRowColumn
          onClick={() => this.setState({ currentAddon: attachment, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{attachment.addon.app.name}</div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton className="attachment-remove" onClick={() => this.handleAddonAttachmentConfirmation(attachment)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  getDialogTitle() {
    if (this.state.addonsLoaded && this.state.currentAddon) {
      const currentAddon = this.state.currentAddon;
      return (
        <div>
          <span>Attached Apps</span>
          <br />
          <span className="addon-name" style={{ fontSize: '18px' }}>{
            currentAddon.addon_service ? (currentAddon.addon_service.name) : (currentAddon.name)
          } {
            currentAddon.addon_service ? (`(${currentAddon.name})`) : ''
          }</span>
        </div>
      );
    }
    return '';
  }

  getAppsAttachedToAddon() {
    const addons = this.state.addons;
    addons.forEach((addon, index) => {
      api.getAppsAttachedToAddon(this.props.app, addon.id).then((res) => {
        addons[index].attached_to = res.data.attached_to;
        if (addons.every(a => (a.attached_to))) {
          if (this._isMounted) {
            this.setState({ addons, addonsLoaded: true });
          }
        }
      });
    });

    const addonAttachments = this.state.addonAttachments;
    addonAttachments.forEach((attachment, index) => {
      api.getAppsAttachedToAddon(this.props.app, attachment.addon.id).then((res) => {
        addonAttachments[index].attached_to = res.data.attached_to;
        if (addonAttachments.every(a => (a.attached_to))) {
          if (this._isMounted) {
            this.setState({ addonAttachments, attachmentsLoaded: true });
          }
        }
      });
    });
  }

  loadAddons() {
    Promise.all([
      api.getAppAddons(this.props.app),
      api.getAddonAttachments(this.props.app),
    ]).then(([r1, r2]) => {
      if (this._isMounted) {
        this.setState({
          addons: r1.data,
          addonAttachments: r2.data,
          loading: false,
        });
        this.getAppsAttachedToAddon();
      }
    });
  }

  formatAttachment(attachment, index) { // eslint-disable-line class-methods-use-this
    return (
      <TableRow className={`attachment-${index}`} style={style.tableRow} key={attachment.id} selectable={false}>
        <TableRowColumn colSpan="2">
          <div className="attachment-name" style={style.tableRowColumn.title}>{attachment.name}</div>
          <div style={style.tableRowColumn.sub}>{attachment.id}</div>
        </TableRowColumn>
        <TableRowColumn>
          {attachment.owner && (
            <div className="attachment-owner" style={{ color: lightBaseTheme.palette.accent1Color }}>Owner</div>
          )}
        </TableRowColumn>
      </TableRow>
    );
  }

  handleAddonDialogClose = () => {
    this.setState({ addonDialogOpen: false, currentAddon: {} });
  }

  handleNewAddon = () => {
    this.setState({ new: true });
  }

  handleNewAddonCancel = () => {
    this.setState({ new: false });
  }

  handleAttachAddon = () => {
    this.setState({ attach: true });
  }

  handleAttachAddonCancel = () => {
    this.setState({ attach: false });
  }

  handleRemoveAddon = () => {
    this.setState({ loading: true });
    api.deleteAddon(this.props.app, this.state.addon.id).then(() => {
      this.reload('Addon Deleted');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        loading: false,
        new: false,
        confirmAddonOpen: false,
        confirmaAttachmentOpen: false,
        attach: false,
      });
    });
  }

  handleRemoveAddonAttachment = () => {
    this.setState({ loading: true });
    api.deleteAddonAttachment(this.props.app, this.state.attachment.name).then(() => {
      this.reload('Attachment Deleted');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        loading: false,
        new: false,
        confirmAddonOpen: false,
        confirmaAttachmentOpen: false,
        attach: false,
      });
    });
  }

  handleAddonConfirmation = (addon) => {
    this.setState({
      confirmAddonOpen: true,
      addon,
    });
  }

  handleCancelAddonConfirmation = () => {
    this.setState({
      confirmAddonOpen: false,
      addon: null,
    });
  }

  handleAddonAttachmentConfirmation = (attachment) => {
    this.setState({
      confirmAttachmentOpen: true,
      attachment,
    });
  }

  handleCancelAddonAttachmentConfirmation = () => {
    this.setState({
      confirmAttachmentOpen: false,
      attachment: null,
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
    Promise.all([
      api.getAppAddons(this.props.app),
      api.getAddonAttachments(this.props.app),
    ]).then(([r1, r2]) => {
      this.setState({
        addons: r1.data,
        addonAttachments: r2.data,
        loading: false,
        new: false,
        message,
        open: true,
        confirmAddonOpen: false,
        confirmAttachmentOpen: false,
        attach: false,
      });
      this.getAppsAttachedToAddon();
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          {!this.state.new && (
            <Paper zDepth={0}>
              <Tooltip title="New Addon" placement="bottom-end">
                <IconButton
                  className="new-addon"
                  onClick={this.handleNewAddon}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Attach Addon" placement="bottom-end">
                <IconButton
                  className="attach-addon"
                  onClick={this.handleAttachAddon}
                >
                  <AttachIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton className="addon-cancel" onClick={this.handleNewAddonCancel}><RemoveIcon /></IconButton>
              <NewAddon app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          {this.state.attach && (
            <div>
              <IconButton className="attach-cancel" onClick={this.handleAttachAddonCancel}><RemoveIcon /></IconButton>
              <AttachAddon app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          <Table className="addon-list">
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
              <TableRow>
                <TableHeaderColumn>Addon</TableHeaderColumn>
                <TableHeaderColumn>Plan</TableHeaderColumn>
                <TableHeaderColumn style={style.tableRowColumn.icon}>Remove</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
              {this.getAddons()}
            </TableBody>
          </Table>
          {this.state.addonAttachments.length > 0 && (
            <Table className="addon-attachment-list">
              <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
                <TableRow>
                  <TableHeaderColumn>Attachment</TableHeaderColumn>
                  <TableHeaderColumn>Plan</TableHeaderColumn>
                  <TableHeaderColumn>Source</TableHeaderColumn>
                  <TableHeaderColumn style={style.tableRowColumn.icon}>Remove</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
                {this.getAddonAttachments()}
              </TableBody>
            </Table>
          )}
          <Dialog
            className="attached-apps-dialog"
            title={this.getDialogTitle()}
            overlayStyle={{ backgroundColor: 'null' }}
            onRequestClose={this.handleAddonDialogClose}
            contentStyle={style.addonDialog}
            actions={
              <Button
                className="ok"
                label="Ok"
                primary
                onClick={this.handleAddonDialogClose}
              />}
            open={this.state.addonDialogOpen}
          >
            {this.state.addonDialogOpen && (
              <Table>
                <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
                  <TableRow>
                    <TableHeaderColumn colSpan="2">App</TableHeaderColumn>
                    <TableHeaderColumn>Ownership</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} selectable={false}>
                  {this.state.currentAddon.attached_to.map((attachment, index) =>
                    this.formatAttachment(attachment, index),
                  )}
                </TableBody>
              </Table>
            )}
          </Dialog>
          <ConfirmationModal className="remove-addon-confirm" open={this.state.confirmAddonOpen} onOk={this.handleRemoveAddon} onCancel={this.handleCancelAddonConfirmation} message="Are you sure you want to delete this addon?" />
          <ConfirmationModal className="remove-attachment-confirm" open={this.state.confirmAttachmentOpen} onOk={this.handleRemoveAddonAttachment} onCancel={this.handleCancelAddonAttachmentConfirmation} message="Are you sure you want to delete this attachment?" />
          <Dialog
            className="addon-error"
            open={this.state.submitFail}
            modal
            actions={
              <Button
                className="ok"
                label="Ok"
                primary
                onClick={this.handleDialogClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
          <Snackbar
            className="addon-snack"
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

Addons.propTypes = {
  app: PropTypes.string.isRequired,
};
