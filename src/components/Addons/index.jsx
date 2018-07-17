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
import AttachIcon from 'material-ui/svg-icons/communication/call-merge';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import api from '../../services/api';
import NewAddon from './NewAddon';
import AttachAddon from './AttachAddon';
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
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      Promise.all([
        api.getAppAddons(this.props.app),
        api.getAddonAttachments(this.props.app),
      ]).then(([r1, r2]) => {
        this.setState({
          addons: r1.data,
          addonAttachments: r2.data,
          loading: false,
        });

        const addons = this.state.addons;
        addons.forEach((addon, index) => {
          api.getAppsAttachedToAddon(this.props.app, addon.id).then((res) => {
            addons[index].attached_to = res.data.attached_to;
            if (addons.every(a => (a.attached_to))) {
              this.setState({ addons, addonsLoaded: true });
            }
          });
        });

        const addonAttachments = this.state.addonAttachments;
        addonAttachments.forEach((attachment, index) => {
          api.getAppsAttachedToAddon(this.props.app, attachment.addon.id).then((res) => {
            addonAttachments[index].attached_to = res.data.attached_to;
            if (addonAttachments.every(a => (a.attached_to))) {
              this.setState({ addonAttachments, attachmentsLoaded: true });
            }
          });
        });
      });
    }
  }

  getAddons() {
    return this.state.addons.map(addon => (
      <TableRow className={addon.addon_service.name} key={addon.id} style={style.tableRow}>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{addon.addon_service.name}</div>
          <div style={style.tableRowColumn.sub}>{addon.id}</div>
          <Dialog
            title="Addon Information"
            actions={
              <FlatButton
                className="ok"
                label="Ok"
                primary
                onTouchTap={this.handleAddonDialogClose}
              />}
            open={this.state.addonDialogOpen}
          >
            { this.state.addonsLoaded && (JSON.stringify(this.state.currentAddon.attached_to, null, 2)) }
          </Dialog>
        </TableRowColumn>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{addon.plan.name}</div>
        </TableRowColumn>
        <TableRowColumn>
          <RaisedButton
            label="Open"
            primary
            onClick={() => { this.setState({ currentAddon: addon, addonDialogOpen: true }); }}
          />
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton className="addon-remove" onTouchTap={() => this.handleAddonConfirmation(addon)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  getAddonAttachments() {
    return this.state.addonAttachments.map(attachment => (
      <TableRow className={attachment.name} key={attachment.id} style={style.tableRow}>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{attachment.name}</div>
          <div style={style.tableRowColumn.sub}>{attachment.id}</div>
          {this.state.attachmentsLoaded && (<div style={style.tableRowColumn.sub}>{JSON.stringify(attachment.attached_to)}</div>)}
        </TableRowColumn>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{attachment.addon.plan.name}</div>
        </TableRowColumn>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{attachment.addon.app.name}</div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton className="attachment-remove" onTouchTap={() => this.handleAddonAttachmentConfirmation(attachment)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  handleAddonDialogClose = () => {
    this.setState({ currentAddon: {}, addonDialogOpen: false });
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
                className="new-addon"
                onTouchTap={this.handleNewAddon}
                tooltip="New Addon"
                tooltipPosition="bottom-left"
              >
                <AddIcon />
              </IconButton>
              <IconButton
                className="attach-addon"
                onTouchTap={this.handleAttachAddon}
                tooltip="Attach Addon"
                tooltipPosition="bottom-left"
              >
                <AttachIcon />
              </IconButton>
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton className="addon-cancel" onTouchTap={this.handleNewAddonCancel}><RemoveIcon /></IconButton>
              <NewAddon app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          {this.state.attach && (
            <div>
              <IconButton className="attach-cancel" onTouchTap={this.handleAttachAddonCancel}><RemoveIcon /></IconButton>
              <AttachAddon app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          <Table className="addon-list">
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
              <TableRow>
                <TableHeaderColumn>Addon</TableHeaderColumn>
                <TableHeaderColumn>Plan</TableHeaderColumn>
                <TableHeaderColumn>Attached To</TableHeaderColumn>
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
          <ConfirmationModal className="remove-addon-confirm" open={this.state.confirmAddonOpen} onOk={this.handleRemoveAddon} onCancel={this.handleCancelAddonConfirmation} message="Are you sure you want to delete this addon?" />
          <ConfirmationModal className="remove-attachment-confirm" open={this.state.confirmAttachmentOpen} onOk={this.handleRemoveAddonAttachment} onCancel={this.handleCancelAddonAttachmentConfirmation} message="Are you sure you want to delete this attachment?" />
          <Dialog
            className="addon-error"
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
  active: PropTypes.bool.isRequired,
};
