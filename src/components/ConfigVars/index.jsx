import React from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, Table, TableBody, TableRow, TableCell, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, Paper,
  Button, TextField, Typography, TableHead,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import { LockOpen, Lock, ErrorOutline } from '@material-ui/icons';
import KeyValue from './KeyValue';

import GlobalStyles from '../../config/GlobalStyles';
import util from '../../services/util';

import BaseComponent from '../../BaseComponent';

// fastest way to check for an empty object (https://stackoverflow.com/questions/679915)
function isEmpty(obj) {
  let empty = true;
  Object.keys(obj).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) { empty = false; }
  });
  return empty;
}

const style = {
  tableRow: {
    height: '58px',
  },
  configVar: {
    textField: {
      fontFamily: 'Courier',
      ...GlobalStyles.Subtle,
      ...GlobalStyles.Text,
      overflow: 'auto',
      whiteSpace: 'nowrap',
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
  header: {
    actions: {
      container: {
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      },
    },
  },
  tableCell: {
    paddingTop: '4px',
    paddingBottom: '4px',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

const originalState = {
  config: {},
  serviceConfig: {},
  notes: {},
  originalConfig: {},
  changes: {},
  changesNotes: {},
  locked: true,
  loading: true,
  propose: false,
  proposeAdded: [],
  proposeRemoved: [],
  proposeUpdated: [],
  proposeMetadata: [],
  edit: false,
  editKey: '',
  editValue: '',
  editNotes: {},
  editOriginalKey: '',
  error: null,
};

export default class ConfigVar extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = util.deepCopy(originalState);
  }

  componentDidMount = async () => {
    await super.componentDidMount();
    try {
      this.getConfigVars();
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
        this.setState({ error: err.message });
      }
      this.setState({ error: err.message });
    }
  }

  refresh = async () => {
    try {
      this.setState(util.deepCopy(originalState));
      await this.getConfigVars();
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
        this.setState({ error: err.message });
      }
    }
  }

  getConfigVars = async () => {
    const { data: config } = await this.api.getConfig(this.props.app);
    const { data: notes } = await this.api.getConfigNotes(this.props.app);
    /* group service config vars */
    const serviceConfig = {};
    for (const key in notes) { /* eslint-disable-line */
      if (notes[key].type === 'addon' && config[key]) {
        if (!serviceConfig[notes[key].addon.id]) {
          const addonResp = await this.api.getAddon(this.props.app, notes[key].addon.name); /* eslint-disable-line */
          serviceConfig[notes[key].addon.id] = { addon: addonResp.data, config: [] };
        }
        serviceConfig[notes[key].addon.id].config.push(key);
      }
    }
    this.setState({
      config, originalConfig: config, notes, serviceConfig, loading: false,
    });
  }

  handleSaveConfigVar = async () => { /* eslint-disable-line */
    try {
      const changes = util.deepCopy(this.state.changes);
      const changesNotes = util.deepCopy(this.state.changesNotes);
      /* Port must be changed through a formation change,
       * as a convenience lets update the formation if we
       * find a port change. */
      if (changes.PORT) {
        const port = parseInt(changes.PORT, 10);
        if (Number.isNaN(port) || port < 1 || port > 65535) {
          return this.setState({ error: 'The port specified had an invalid value, it must be a number greater than 0 and less than 65535' });
        }
        await this.api.patchFormation(this.props.app, 'web', undefined, undefined, undefined, port, undefined, undefined);
        delete changes.PORT;
      }
      if (!isEmpty(changes)) {
        await this.api.patchConfig(this.props.app, changes);
      }
      if (!isEmpty(changesNotes)) {
        await this.api.patchConfigNotes(this.props.app, changesNotes);
      }
      ReactGA.event({
        category: 'APPS',
        action: 'Updated a config var',
      });
      await this.refresh();
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
        this.setState({ error: err.message });
      }
    }
  }

  handleCancelProposeSaveConfigVar() {
    this.setState({
      propose: false,
      proposeAdded: [],
      proposeRemoved: [],
      proposeUpdated: [],
      proposeMetadata: [],
    });
  }

  handleProposeSaveConfigVar() {
    const added = [];
    const removed = [];
    const updated = [];
    const metadata = [];
    for (const key in this.state.changes) { /* eslint-disable-line */
      if (this.state.changes[key] === null) {
        removed.push(key);
      } else if (this.state.changes[key] && !this.state.originalConfig[key]) {
        added.push(key);
      } else {
        updated.push(key);
      }
    }
    for (const key in this.state.changesNotes) { /* eslint-disable-line */
      metadata.push(key);
    }
    this.setState({
      propose: true,
      proposeAdded: added,
      proposeRemoved: removed,
      proposeUpdated: updated,
      proposeMetadata: metadata,
    });
  }

  handleEditConfigVar() {
    const key = this.state.editKey;
    const value = this.state.editValue;
    const notesValue = this.state.editNotes;
    const config = util.deepCopy(this.state.config);
    const changes = util.deepCopy(this.state.changes);
    const notes = util.deepCopy(this.state.notes);
    const changesNotes = util.deepCopy(this.state.changesNotes);
    if (config[key] === value && !notesValue || !key || key === '') { /* eslint-disable-line */
      this.setState({
        edit: false,
        editKey: '',
        editValue: '',
        editNotes: {},
        editOriginalKey: '',
      });
      return;
    }
    if (this.state.editOriginalKey !== this.state.editKey) {
      delete config[this.state.editOriginalKey];
      changes[this.state.editOriginalKey] = null;
    }
    if (!notes[key] && notesValue) {
      // If a new config var is being added and new notes as well.
      changesNotes[key] = notesValue;
      notes[key] = notesValue;
    } else if (notes[key] && notesValue &&
        (notesValue.description !== notes[key].description ||
          notesValue.required !== notes[key].required)) {
      // If an existing config var is having its notes updated.
      changesNotes[key] = { ...notes[key], ...notesValue };
      notes[key] = { ...notes[key], ...notesValue };
    }
    if (config[key] !== value) {
      config[key] = value;
      changes[key] = value;
    }
    this.setState({
      config,
      changes,
      changesNotes,
      notes,
      edit: false,
      editKey: '',
      editValue: '',
      editNotes: {},
      editOriginalKey: '',
    });
  }

  handleProposeEditConfigVar(key, value, notes) {
    this.setState({
      edit: true,
      editKey: key,
      editValue: value,
      editNotes: notes || {},
      editOriginalKey: key,
    });
  }

  handleLockAndUnlock() {
    if (this.state.locked) {
      this.setState({ locked: !this.state.locked });
    } else if (isEmpty(this.state.changes) && isEmpty(this.state.changesNotes)) {
      this.setState({ locked: !this.state.locked });
    } else {
      this.handleProposeSaveConfigVar();
    }
  }

  handleDeleteConfigVar(key /* value */) {
    const changes = util.deepCopy(this.state.changes);
    changes[key] = null;
    this.setState({
      changes,
      edit: false,
      editKey: '',
      editValue: '',
      editOriginalKey: '',
    });
  }

  renderNoConfigVars() { /* eslint-disable-line */
    return (
      <TableRow>
        <TableCell>
          <span className="no-results">No Config Vars</span>
        </TableCell>
      </TableRow>
    );
  }

  renderAlert() {
    if (this.state.locked) {
      return; /* eslint-disable-line */
    }
    if (isEmpty(this.state.changes) && isEmpty(this.state.changesNotes)) {
      return; /* eslint-disable-line */
    }
    const alertStyle = { ...GlobalStyles.Header, ...GlobalStyles.ErrorText, marginBottom: '0rem' };
    return ( /* eslint-disable-line */
      <TableRow style={style.tableRow}>
        <TableCell colSpan={3} style={style.tableCell}>
          <div style={{ display: 'flex', ...alertStyle }}>
            <ErrorOutline style={{ marginRight: '0.5rem' }} />
            <Typography style={{ ...alertStyle, marginTop: '0rem' }} variant="body1">
              These changes are not saved yet.
            </Typography>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  renderAddConfigVar() {
    if (this.state.locked) {
      return; /* eslint-disable-line */
    }
    return ( /* eslint-disable-line */
      <KeyValue
        key="new-config-var-key"
        new
        notes={{}}
        onChange={(key, value, notes) => this.handleProposeEditConfigVar(key, value, notes)}
        onDelete={(key, value, notes) => this.handleDeleteConfigVar(key, value, notes)}
        saved
        deleted={false}
      />
    );
  }

  renderConfigVars() {
    return Object.keys(this.state.config)
      .sort()
      .filter(key => this.state.notes[key].type !== 'addon')
      .map((key) => {
        let saved = (!this.state.changes[key]);
        if (this.state.changes[key] === null || this.state.changesNotes[key]) {
          saved = false;
        }
        const deleted = this.state.changes[key] === null;
        return (<KeyValue
          new={false}
          key={key}
          configkey={key}
          value={this.state.config[key]}
          notes={this.state.notes[key]}
          onChange={(keyf, value, notes) => this.handleProposeEditConfigVar(keyf, value, notes)}
          onDelete={(keyf, value, notes) => this.handleDeleteConfigVar(keyf, value, notes)}
          saved={saved}
          locked={this.state.locked}
          deleted={deleted}
          required={this.state.notes[key] && (this.state.notes[key].read_only || this.state.notes[key].type === 'addon')}
          editable={this.state.notes[key] ? this.state.notes[key].type !== 'addon' : true}
        />
        );
      })
      .concat([
        this.renderAddConfigVar(),
      ])
      .concat(Object.keys(this.state.serviceConfig).map((addonId) => {
        const addon = this.state.serviceConfig[addonId].addon; /* eslint-disable-line */
        const config = this.state.serviceConfig[addonId].config; /* eslint-disable-line */
        return [
          (
            <TableRow key={`addon-${addonId}`} style={style.tableRow}>
              <TableCell colSpan={3} style={style.tableCell}>
                <Typography variant="h5" style={{ ...GlobalStyles.HeaderSmall }}>
                    From addon {addon.plan.name} ({addon.id})
                </Typography>
              </TableCell>
            </TableRow>
          ),
        ].concat(config.map((key) => {
          const saved = !(this.state.changes[key] || this.state.changes[key] === null);
          const deleted = this.state.changes[key] === null;
          return (<KeyValue
            new={false}
            key={key}
            configkey={key}
            value={this.state.config[key]}
            notes={this.state.notes[key]}
            onChange={(keyf, value, notes) => this.handleProposeEditConfigVar(keyf, value, notes)}
            onDelete={(keyf, value, notes) => this.handleDeleteConfigVar(keyf, value, notes)}
            saved={saved}
            locked={this.state.locked}
            deleted={deleted}
            required={this.state.notes[key] && (this.state.notes[key].read_only || this.state.notes[key].type === 'addon')}
            editable={this.state.notes[key] ? this.state.notes[key].type !== 'addon' : true}
          />);
        }));
      }).flat());
  }

  renderHeader() {
    let LockedIcon = Lock;
    let toolTipTitle = 'Make Changes to Config Vars';
    let lockedIconColor = 'default';
    if (!this.state.locked) {
      LockedIcon = LockOpen;
      toolTipTitle = 'Save Changes to Config Vars';
      lockedIconColor = 'secondary';
    }
    return (
      <TableRow style={style.tableRow}>
        <TableCell style={style.tableCell}>
          <Typography variant="overline">Key</Typography>
        </TableCell>
        <TableCell style={style.tableCell}>
          <Typography variant="overline">Value</Typography>
        </TableCell>
        <TableCell style={style.tableCell}>
          <div style={style.header.actions.container}>
            {!this.state.new && (
              <Tooltip title={toolTipTitle} placement="bottom-start">
                <IconButton
                  color={lockedIconColor}
                  className="lock-config"
                  onClick={() => this.handleLockAndUnlock()}
                >
                  <LockedIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  renderProposeConfigVarChanges() {
    const configVarStyle = {
      ...GlobalStyles.ConfigVarStyle, marginTop: '0.25rem', marginBottom: '0.25rem', verticalAlign: 'top',
    };
    return (
      <Dialog
        className="config-propose"
        open={this.state.propose}
        fullWidth
        onClose={() => this.handleCancelProposeSaveConfigVar()}
        onExited={() => this.handleCancelProposeSaveConfigVar()}
      >
        <DialogTitle style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}>
          Proposed Changes
        </DialogTitle>
        <DialogContent style={{ ...GlobalStyles.PaperSubtleContainerStyle }} dividers>
          {this.state.proposeAdded.length > 0 ? (
            <div key="added-config-vars-proposed">
              <Typography variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
                Add
              </Typography>
              <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
                {this.state.proposeAdded.map(x => (
                    <div key={"code-style-" + x} style={configVarStyle}> { /* eslint-disable-line */ }
                      {x}={JSON.stringify(this.state.changes[x])}
                    </div>
                  ))}
              </Paper>
            </div>
          ) : ''}
          {this.state.proposeRemoved.length > 0 ? (
            <div key="remove-config-vars-proposed">
              <Typography variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
                Remove
              </Typography>
              <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
                {this.state.proposeRemoved.map(x => (
                    <div key={"code-style-" + x} style={configVarStyle}> { /* eslint-disable-line */ }
                      {x}={JSON.stringify(this.state.changes[x])}
                    </div>
                  ))}
              </Paper>
            </div>
          ) : ''}
          {this.state.proposeUpdated.length > 0 ? (
            <div key="update-config-vars-proposed">
              <Typography variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
                Update
              </Typography>
              <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
                {this.state.proposeUpdated.map(x => (
                    <div key={"code-style-" + x} style={configVarStyle}> { /* eslint-disable-line */ }
                      {x}={JSON.stringify(this.state.changes[x])}
                    </div>
                  ))}
              </Paper>
            </div>
          ) : ''}
          {this.state.proposeMetadata.length > 0 ? (
            <div key="metadata-config-vars-proposed">
              <Typography variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
                Update Notes or Required Status
              </Typography>
              <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
                {this.state.proposeMetadata.map(x => (
                    <div key={"code-style-" + x} style={configVarStyle}> { /* eslint-disable-line */ }
                      {x}
                    </div>
                  ))}
              </Paper>
            </div>
          ) : ''}
        </DialogContent>
        <DialogActions>
          <Button className="cancel" color="secondary" onClick={() => this.handleCancelProposeSaveConfigVar()}> { /* eslint-disable-line */ }
            Cancel
          </Button>
          <Button className="save-config-vars" color="primary" onClick={() => this.handleSaveConfigVar()}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderEditConfigVarDialog() {
    return (
      <Dialog
        className="config-edit"
        open={this.state.edit}
        fullWidth
        onClose={() => this.setState({ edit: false })}
        onExited={() => this.setState({ edit: false })}
      >
        <DialogTitle style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}>
          Add or edit config variable
        </DialogTitle>
        <DialogContent style={{ ...GlobalStyles.PaperSubtleContainerStyle }} dividers>
          <br />
          <TextField
            className="config-edit-key"
            value={this.state.editKey}
            fullWidth
            disabled
            variant="outlined"
            label="Key"
            style={{ backgroundColor: 'white' }}
            inputProps={{ style: style.configVar.textField }}
            onChange={e => this.setState({ editKey: e.target.value })}
          />
          <br />&nbsp;<br />
          <TextField
            className="config-edit-value"
            value={this.state.editValue}
            multiline
            fullWidth
            variant="outlined"
            label="Value"
            rows="3"
            style={{ backgroundColor: 'white' }}
            inputProps={{ style: style.configVar.textField }}
            onChange={e => this.setState({ editValue: e.target.value })}
          />
          <br />&nbsp;<br />
          <TextField
            className="config-edit-notes"
            value={this.state.editNotes ? this.state.editNotes.description : ''}
            multiline
            fullWidth
            variant="outlined"
            label="Notes"
            rows="3"
            style={{ backgroundColor: 'white' }}
            inputProps={{ style: style.configVar.textField }}
            onChange={e => this.setState({ editNotes: { ...this.state.editNotes, description: e.target.value } /* eslint-disable-line */ })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.editNotes.required}
                onChange={e => this.setState({ editNotes: { ...this.state.editNotes, required: e.target.checked } /* eslint-disable-line */ })}
                style={GlobalStyles.FairlySubtle}
              />
            }
            style={GlobalStyles.FairlySubtle}

            label="Protect this config var from being removed."
          />
        </DialogContent>
        <DialogActions>
          <Button className="cancel" color="secondary" onClick={() => this.setState({ edit: false })}>
            Cancel
          </Button>
          <Button className="submit-config-vars" color="primary" onClick={() => this.handleEditConfigVar()}>
            Stage Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // TODO: Move this into the scene and call it from here
  // with a onError delegate. We don't need an error dialog
  // for every component, just every scene.
  renderError() {
    return (
      <Dialog
        className="error"
        open={!!this.state.error}
        fullWidth
        onClose={() => this.setState({ error: null })}
        onExited={() => this.setState({ error: null })}
      >
        <DialogTitle style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}>
          Uh Oh.
        </DialogTitle>
        <DialogContent style={{ ...GlobalStyles.PaperSubtleContainerStyle }} dividers>
          <Typography variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
            Error
          </Typography>
          <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
            {this.state.error}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button className="ok" color="secondary" onClick={() => this.refresh()}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderLoading() { /* eslint-disable-line */
    return (
      <div style={style.refresh.div}>
        <CircularProgress
          top={0}
          size={40}
          left={0}
          style={style.refresh.indicator}
          status="loading"
        />
      </div>
    );
  }

  render() {
    if (this.state.loading) {
      return this.renderLoading();
    }
    return (
      <div>
        <Table className="config-list">
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '45%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <TableHead>
            {this.renderAlert()}
            {this.renderHeader()}
          </TableHead>
          <TableBody>
            {isEmpty(this.state.config) ? this.renderNoConfigVars() : this.renderConfigVars()}
          </TableBody>
        </Table>
        {this.renderEditConfigVarDialog()}
        {this.renderProposeConfigVarChanges()}
        {this.renderError()}
      </div>
    );
  }
}

ConfigVar.propTypes = {
  app: PropTypes.string.isRequired,
};
