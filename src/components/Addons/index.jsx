import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, IconButton, Snackbar, Typography, CircularProgress, Dialog,
  Tooltip, Table, TableHead, TableBody, TableRow, TableCell,
  DialogTitle, DialogContent, DialogActions, Collapse,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import { withTheme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import NewAddon from './NewAddon';
import AttachAddon from './AttachAddon';
import ConfirmationModal from '../ConfirmationModal';
import AttachmentIcon from '../Icons/AttachmentIcon';
import DeleteAttachmentIcon from '../Icons/DeleteAttachmentIcon';
import BaseComponent from '../../BaseComponent';
import { isEmpty } from '../../services/util';

function addRestrictedTooltip(title, placement, children) {
  return (
    <Tooltip title={title} placement={placement}>
      <div style={{ opacity: 0.35 }}>{children}</div>
    </Tooltip>
  );
}

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
    height: '72px',
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
    icon: {
      width: '58px',
    },
  },
  refresh: {
    tableCell: {
      padding: '0px',
    },
    div: {
      height: '450px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  collapse: {
    container: {
      display: 'flex', flexDirection: 'column',
    },
    header: {
      container: {
        display: 'flex', alignItems: 'center', padding: '6px 24px 0px',
      },
      title: {
        flex: 1,
      },
    },
  },
  headerActions: {
    container: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    button: {
      width: '50px',
    },
  },
  headerCell: {
    paddingTop: '6px',
    paddingBottom: '6px',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

class Addons extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      addons: [],
      addon: null,
      attachment: null,
      loading: true,
      open: false,
      collapse: true,
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
      isElevated: false,
      restrictedSpace: false,
    };
    this.loadAddons();
  }

  componentDidMount() {
    super.componentDidMount();
    const { app, accountInfo } = this.props;

    // If this is a production app, check for the elevated_access role to determine
    // whether or not to enable the delete addon button.

    // There is still an API call on the backend that controls access to the actual
    // deletion of the addon, this is merely for convienence.

    let isElevated = false;
    let restrictedSpace = false;
    if (app.space.compliance.includes('prod') || app.space.compliance.includes('socs')) {
      // If we don't have the elevated_access object in the accountInfo object,
      // default to enabling the button (access will be controlled on the API)
      isElevated = (accountInfo && 'elevated_access' in accountInfo) ? accountInfo.elevated_access : true;
      restrictedSpace = true;
    }
    this.setState({ isElevated, restrictedSpace }); // eslint-disable-line
  }

  getAppsAttachedToAddon = async () => {
    const { addons, addonAttachments } = this.state;
    try {
      const fullAddons = await Promise.all(addons.map(async (addon) => {
        const { data } = await this.api.getAppsAttachedToAddon(this.props.app.name, addon.id);
        addon.attached_to = data.attached_to; // eslint-disable-line
        return addon;
      }));

      const fullAttachments = await Promise.all(addonAttachments.map(async (attachment) => {
        const { data } = await this.api.getAppsAttachedToAddon(
          this.props.app.name,
          attachment.addon.id,
        );
        attachment.attached_to = data.attached_to; // eslint-disable-line
        return attachment;
      }));

      this.setState({
        addons: fullAddons,
        attachments: fullAttachments,
        attachmentsLoaded: true,
        addonsLoaded: true,
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  loadAddons = async () => {
    try {
      const [r1, r2] = await Promise.all([
        this.api.getAppAddons(this.props.app.name),
        this.api.getAddonAttachments(this.props.app.name),
      ]);
      this.setState({
        addons: r1.data,
        addonAttachments: r2.data,
        loading: false,
      });
      this.getAppsAttachedToAddon();
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
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
            <div className="attachment-owner" style={{ color: this.props.theme.palette.secondary.main }}>Owner</div>
          )}
        </TableCell>
      </TableRow>
    );
  }

  handleAddonDialogClose = () => {
    this.setState({ addonDialogOpen: false });
  }

  handleNewAddon = () => {
    this.setState({ new: true, collapse: false });
  }

  handleNewAddonCancel = () => {
    this.setState({ collapse: true });
  }

  handleAttachAddon = () => {
    this.setState({ attach: true, collapse: false });
  }

  handleAttachAddonCancel = () => {
    this.setState({ collapse: true });
  }

  handleRemoveAddon = async () => {
    try {
      await this.api.deleteAddon(this.props.app.name, this.state.addon.id);
      this.reload('Addon Deleted');
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          loading: false,
          new: false,
          collapse: true,
          confirmAddonOpen: false,
          confirmAttachmentOpen: false,
          attach: false,
        });
      }
    }
  }

  handleRemoveAddonAttachment = async () => {
    try {
      await this.api.deleteAddonAttachment(
        this.props.app.name,
        this.state.attachment.id,
      );
      ReactGA.event({
        category: 'ADDONS',
        action: 'Deleted addon',
      });
      this.reload('Attachment Deleted');
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          loading: false,
          new: false,
          collapse: true,
          confirmAddonOpen: false,
          confirmAttachmentOpen: false,
          attach: false,
        });
      }
    }
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

  reload = async (message, noLoading) => {
    if (!noLoading) {
      this.setState({ loading: true });
    }
    try {
      const [r1, r2] = await Promise.all([
        this.api.getAppAddons(this.props.app.name),
        this.api.getAddonAttachments(this.props.app.name),
      ]);
      this.setState({
        addons: r1.data,
        addonAttachments: r2.data,
        loading: false,
        new: false,
        collapse: true,
        message,
        open: true,
        confirmAddonOpen: false,
        confirmAttachmentOpen: false,
        attach: false,
      });
      this.getAppsAttachedToAddon();
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  renderAddons() {
    const { isElevated, restrictedSpace } = this.state;
    return this.state.addons.map((addon, index) => {
      let deleteButton = (
        <IconButton
          disabled={(restrictedSpace && !isElevated) || addon.state === 'provisioning'}
          color="secondary"
          className="addon-remove"
          onClick={() => this.handleAddonConfirmation(addon)}
        >
          <DeleteIcon color={((restrictedSpace && !isElevated) || addon.state === 'provisioning') ? 'disabled' : 'inherit'} />
        </IconButton>
      );

      // Wrap the delete button in a tooltip to avoid confusion as to why it is disabled
      if (restrictedSpace && !isElevated) {
        // Wrap the delete controls in a tooltip to avoid confusion as to why they are disabled
        deleteButton = addRestrictedTooltip('Elevated access required', 'right', deleteButton);
      }

      return (
        <TableRow
          hover
          className={`${addon.addon_service.name} addon-${index}`}
          key={addon.id}
          style={style.tableRowPointer}
        >
          <TableCell
            onClick={() => this.setState({ currentAddon: addon, addonDialogOpen: true })}
          >
            <div>
              <div style={style.tableRowColumn.title}>{addon.addon_service.name}</div>
              <div style={style.tableRowColumn.sub}>{addon.id} {addon.state === 'provisioning' ? '- provisioning' : ''}</div>
            </div>
          </TableCell>
          <TableCell
            onClick={() => this.setState({ currentAddon: addon, addonDialogOpen: true })}
            colSpan={2}
          >
            <div style={style.tableRowColumn.title}>{addon.plan.name}</div>
          </TableCell>
          <TableCell>
            <div style={{ paddingRight: '2px', textAlign: 'right' }}>{deleteButton}</div>
          </TableCell>
        </TableRow>
      );
    });
  }

  renderAddonAttachments() {
    const { isElevated, restrictedSpace } = this.state;
    return this.state.addonAttachments.map((attachment, index) => {
      let deleteButton = (
        <IconButton
          disabled={(restrictedSpace && !isElevated) || attachment.state === 'provisioning'}
          color="secondary"
          className="attachment-remove"
          onClick={() => this.handleAddonAttachmentConfirmation(attachment)}
        >
          <DeleteAttachmentIcon color={((restrictedSpace && !isElevated) || attachment.state === 'provisioning') ? 'disabled' : 'inherit'} />
        </IconButton>
      );

      // Wrap the delete button in a tooltip to avoid confusion as to why it is disabled
      if (restrictedSpace && !isElevated) {
        // Wrap the delete controls in a tooltip to avoid confusion as to why they are disabled
        deleteButton = addRestrictedTooltip('Elevated access required', 'right', deleteButton);
      }

      return (
        <TableRow
          hover
          className={`${attachment.name} addon-attachment-${index}`}
          key={attachment.id}
          style={style.tableRowPointer}
        >
          <TableCell
            onClick={() => this.setState({ currentAddon: attachment, addonDialogOpen: true })}
          >
            <div>
              <div style={style.tableRowColumn.title}>{attachment.name}</div>
              <div style={style.tableRowColumn.sub}>{attachment.id} {attachment.state === 'provisioning' ? '- provisioning' : ''}</div>
            </div>
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
          <TableCell>
            <div style={{ textAlign: 'right' }}>{deleteButton}</div>
          </TableCell>
        </TableRow>
      );
    });
  }

  renderDialogTitle() {
    if ((this.state.addonsLoaded || this.state.attachmentsLoaded) && this.state.currentAddon) {
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

  render() {
    return (
      <div style={{ overflow: 'visible' }}>
        <Collapse
          unmountOnExit
          mountOnEnter
          onExited={() => this.setState({ new: false, attach: false })}
          in={!this.state.collapse}
        >
          <div style={style.collapse.container}>
            <div style={style.collapse.header.container}>
              <Typography style={style.collapse.header.title} variant="overline">{this.state.attach && 'Attach Addon'}{this.state.new && 'New Addon'}</Typography>
              {this.state.new && <IconButton style={style.iconButton} className="addon-cancel" onClick={this.handleNewAddonCancel}><RemoveIcon /></IconButton> }
              {this.state.attach && <IconButton style={style.iconButton} className="attach-cancel" onClick={this.handleAttachAddonCancel}><RemoveIcon /></IconButton> }
            </div>
            <div>
              {this.state.new &&
                <NewAddon app={this.props.app.name} onComplete={this.reload} />
              }
              {this.state.attach &&
                <AttachAddon app={this.props.app.name} onComplete={this.reload} />
              }
            </div>
          </div>
        </Collapse>
        <Table className="addon-list">
          <colgroup>
            <col style={{ width: '35%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell style={style.headerCell}><Typography variant="overline">Addon</Typography></TableCell>
              <TableCell style={style.headerCell}><Typography variant="overline">Plan</Typography></TableCell>
              <TableCell style={style.headerCell}>{this.state.addonAttachments.length !== 0 && <Typography variant="overline">Attached From</Typography>}</TableCell>
              <TableCell style={style.headerCell}>
                <div style={style.headerActions.container}>
                  <div style={style.headerActions.button}>
                    {this.state.collapse && (
                      <Tooltip title="Attach Addon" placement="bottom-end">
                        <IconButton
                          className="attach-addon"
                          onClick={this.handleAttachAddon}
                          style={style.iconButton}
                        >
                          <AttachmentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                  <div style={style.headerActions.button}>
                    {this.state.collapse && (
                      <Tooltip title="New Addon" placement="bottom-end">
                        <IconButton
                          className="new-addon"
                          onClick={this.handleNewAddon}
                          style={style.iconButton}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableHead>
          {this.state.loading ? (
            <TableBody>
              <TableRow>
                <TableCell style={style.refresh.tableCell} colSpan={4}>
                  <div style={style.refresh.div}>
                    <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {this.state.addons.length === 0 && this.state.addonAttachments.length === 0 && (
                <TableRow><TableCell colSpan={4}><span className="no-results">No Addons</span></TableCell></TableRow>
              )}
              {this.state.addons.length > 0 && this.renderAddons()}
              {this.state.addonAttachments.length > 0 && this.renderAddonAttachments()}
            </TableBody>
          )}
        </Table>
        <Dialog
          className="attached-apps-dialog"
          onClose={this.handleAddonDialogClose}
          open={this.state.addonDialogOpen}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {this.renderDialogTitle()}
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
          message="Are you sure you want to remove this attachment from this app?"
        />
        <ConfirmationModal
          className="addon-error"
          open={this.state.submitFail}
          onOk={this.handleDialogClose}
          message={this.state.submitMessage}
          title="Error"
        />
        <Snackbar
          className="addon-snack"
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

/* eslint-disable react/forbid-prop-types */
Addons.propTypes = {
  app: PropTypes.object.isRequired,
  accountInfo: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
/* eslint-enable react/forbid-prop-types */

export default withTheme(Addons);
