import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, IconButton, Snackbar, Typography, CircularProgress, Dialog,
  Tooltip, Table, TableHead, TableBody, TableRow, TableCell,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import AttachIcon from '@material-ui/icons/CallMerge';
import RemoveIcon from '@material-ui/icons/Clear';
import { blue } from '@material-ui/core/colors';
import api from '../../services/api';
import NewAddon from './NewAddon';
import AttachAddon from './AttachAddon';
import ConfirmationModal from '../ConfirmationModal';

// fastest way to check for an empty object (https://stackoverflow.com/questions/679915)
function isEmpty(obj) {
  let empty = true;
  Object.keys(obj).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) { empty = false; }
  });
  return empty;
}

const muiTheme = createMuiTheme({
  palette: {
    primary: {       main: '#0097a7',     },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiPaper: {
      root: {
        boxShadow: '0 !important',
      },
    },
    MuiDialog: {
      paper: {
        width: '40%',
      },
    },
  },
});

const style = {
  iconButton: {
    color: 'black',
  },
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
        hover
        className={addon.addon_service.name}
        key={addon.id}
        style={style.tableRowPointer}
      >
        <TableCell
          onClick={() => this.setState({ currentAddon: addon, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{addon.addon_service.name}</div>
          <div style={style.tableRowColumn.sub}>{addon.id}</div>
        </TableCell>
        <TableCell
          onClick={() => this.setState({ currentAddon: addon, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{addon.plan.name}</div>
        </TableCell>
        <TableCell style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton style={style.iconButton} className="addon-remove" onClick={() => this.handleAddonConfirmation(addon)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>
    ));
  }

  getAddonAttachments() {
    return this.state.addonAttachments.map((attachment, index) => (
      <TableRow
        hover
        className={`${attachment.name} addon-attachment-list-${index}`}
        key={attachment.id}
        style={style.tableRowPointer}
      >
        <TableCell
          onClick={() => this.setState({ currentAddon: attachment, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{attachment.name}</div>
          <div style={style.tableRowColumn.sub}>{attachment.id}</div>
        </TableCell>
        <TableCell
          onClick={() => this.setState({ currentAddon: attachment, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{attachment.addon.plan.name}</div>
        </TableCell>
        <TableCell
          onClick={() => this.setState({ currentAddon: attachment, addonDialogOpen: true })}
        >
          <div style={style.tableRowColumn.title}>{attachment.addon.app.name}</div>
        </TableCell>
        <TableCell style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton style={style.iconButton} className="attachment-remove" onClick={() => this.handleAddonAttachmentConfirmation(attachment)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>
    ));
  }

  getDialogTitle() {
    if (this.state.addonsLoaded && this.state.currentAddon) {
      const currentAddon = this.state.currentAddon;
      return (
        <div>
          <Typography variant="h5">Attached Apps</Typography>
          <Typography className="addon-name" variant="subtitle1" style={{ marginTop: '10px' }}>
            {currentAddon.addon_service ? (currentAddon.addon_service.name) : (currentAddon.name)}
            {currentAddon.addon_service ? (` (${currentAddon.name})`) : ''}
          </Typography>
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
      <TableRow className={`attachment-${index}`} style={style.tableRow} key={attachment.id}>
        <TableCell colSpan="2">
          <div className="attachment-name" style={style.tableRowColumn.title}>{attachment.name}</div>
          <div style={style.tableRowColumn.sub}>{attachment.id}</div>
        </TableCell>
        <TableCell>
          {attachment.owner && (
            <div className="attachment-owner" style={{ color: muiTheme.palette.secondary.main }}>Owner</div>
          )}
        </TableCell>
      </TableRow>
    );
  }

  handleAddonDialogClose = () => {
    this.setState({ addonDialogOpen: false });
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
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={{ overflow: 'visible' }}>
          {(!this.state.new && !this.state.attach) && (
            <div>
              <Tooltip title="New Addon" placement="bottom-end">
                <IconButton
                  className="new-addon"
                  onClick={this.handleNewAddon}
                  style={style.iconButton}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Attach Addon" placement="bottom-end">
                <IconButton
                  className="attach-addon"
                  onClick={this.handleAttachAddon}
                  style={style.iconButton}
                >
                  <AttachIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}
          {this.state.new && (
            <div>
              <IconButton style={style.iconButton} className="addon-cancel" onClick={this.handleNewAddonCancel}><RemoveIcon /></IconButton>
              <NewAddon app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          {this.state.attach && (
            <div>
              <IconButton style={style.iconButton} className="attach-cancel" onClick={this.handleAttachAddonCancel}><RemoveIcon /></IconButton>
              <AttachAddon app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          <Table className="addon-list">
            <TableHead>
              <TableRow>
                <TableCell>Addon</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell style={style.tableRowColumn.icon}>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.addons.length > 0 ? this.getAddons() : (
                <TableRow><TableCell /><TableCell>No Results</TableCell><TableCell /></TableRow>
              )}
            </TableBody>
          </Table>
          {this.state.addonAttachments.length > 0 && (
            <Table className="addon-attachment-list">
              <TableHead>
                <TableRow>
                  <TableCell>Attachment</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell style={style.tableRowColumn.icon}>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.getAddonAttachments()}
              </TableBody>
            </Table>
          )}
          <Dialog
            className="attached-apps-dialog"
            onClose={this.handleAddonDialogClose}
            open={this.state.addonDialogOpen}
          >
            <DialogTitle>
              {this.getDialogTitle()}
            </DialogTitle>
            <DialogContent>
              {!isEmpty(this.state.currentAddon) && (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan="2">App</TableCell>
                      <TableCell>Ownership</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.currentAddon.attached_to &&
                      this.state.currentAddon.attached_to.map((attachment, index) =>
                        this.formatAttachment(attachment, index),
                      )}
                  </TableBody>
                </Table>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                className="ok"
                color="primary"
                onClick={this.handleAddonDialogClose}
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
          <ConfirmationModal
            className="remove-addon-confirm"
            open={this.state.confirmAddonOpen}
            onOk={this.handleRemoveAddon}
            onCancel={this.handleCancelAddonConfirmation}
            message="Are you sure you want to delete this addon?"
          />
          <ConfirmationModal
            className="remove-attachment-confirm"
            open={this.state.confirmAttachmentOpen}
            onOk={this.handleRemoveAddonAttachment}
            onCancel={this.handleCancelAddonAttachmentConfirmation}
            message="Are you sure you want to delete this attachment?"
          />
          <Dialog
            className="addon-error"
            open={this.state.submitFail}
          >
            <DialogContent>
              <DialogContentText>{this.state.submitMessage}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                className="ok"
                color="primary"
                onClick={this.handleDialogClose}
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            className="addon-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onClose={this.handleRequestClose}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

Addons.propTypes = {
  app: PropTypes.string.isRequired,
};
