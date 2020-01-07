import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, Table, TableBody, TableRow, TableCell, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, Paper,
  Snackbar, Button, TextField, Typography, TableHead,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import {
  LockOpen, Lock, ErrorOutline
} from '@material-ui/icons';
import SaveIcon from '@material-ui/icons/Save';
import api from '../../services/api';
import NewConfigVar from './NewConfigVar';
import KeyValue from './KeyValue';
import ConfirmationModal from '../ConfirmationModal';
import GlobalStyles from '../../config/GlobalStyles';
import util from '../../services/util';

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
      'fontFamily':'Courier',
      ...GlobalStyles.Subtle,
      ...GlobalStyles.Text, 
      'overflow':'auto', 
      'whiteSpace':'nowrap'
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
  edit: false,
  editKey: "",
  editValue: "",
  editNotes: {},
  editOriginalKey:"",
};

export default class ConfigVar extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = util.deepCopy(originalState);
  }

  componentDidMount = () => this.getConfigVars()

  getConfigVars = async () => {
    const { data: config } = await api.getConfig(this.props.app);
    const { data: notes } = await api.getConfigNotes(this.props.app);

    /* group service config vars */
    let serviceConfig = {};
    for(let key in notes) {
      if(notes[key].type === "addon" && config[key]) {
        if(!serviceConfig[notes[key].addon.id]) {
          const addon_resp = await api.getAddon(this.props.app, notes[key].addon.name);
          serviceConfig[notes[key].addon.id] = {addon:addon_resp.data, config:[]};
          console.log('addon_id', notes[key].addon.id, 'addon object:', serviceConfig[notes[key]]);
        }
        serviceConfig[notes[key].addon.id].config.push(key);
      }
    }

    this.setState({ config, originalConfig: config, notes, serviceConfig, loading: false });
  }

  handleSaveConfigVar() {
    console.log('send', this.state.changes, this.state.changesNotes);
  }

  handleCancelProposeSaveConfigVar() {
    this.setState({propose:false, proposeAdded:[], proposeRemoved:[], proposeUpdated:[]});
  }

  handleProposeSaveConfigVar() {
    let added = [], removed = [], updated = [];
    for (let key in this.state.changes) {
      if(this.state.changes[key] === null) {
        removed.push(key);
      } else if (this.state.changes[key] && !this.state.originalConfig[key]) {
        added.push(key);
      } else {
        updated.push(key);
      }
    }
    this.setState({propose:true, proposeAdded:added, proposeRemoved:removed, proposeUpdated:updated});
  }

  handleEditConfigVar() {
    let key = this.state.editKey;
    let value = this.state.editValue;
    let notesValue = this.state.editNotes;
    let config = util.deepCopy(this.state.config);
    let changes = util.deepCopy(this.state.changes);
    let notes = util.deepCopy(this.state.notes);
    let changesNotes = util.deepCopy(this.state.changesNotes);
    if(config[key] === value && !notesValue || !key || key === "") {
      return this.setState({
        edit:false,
        editKey:"",
        editValue:"",
        editNotes:{},
        editOriginalKey:"",
      });
    }
    if(this.state.editOriginalKey !== this.state.editKey) {
      delete config[this.state.editOriginalKey];
      changes[this.state.editOriginalKey] = null;
    }
    if(notesValue) {
      changesNotes[key] = {...notes[key], ...notesValue};
      notes[key] = {...notes[key], ...notesValue};
    }
    config[key] = value;
    changes[key] = value;
    this.setState({
      config,
      changes,
      changesNotes,
      notes,
      edit:false,
      editKey:"",
      editValue:"",
      editNotes:{},
      editOriginalKey:"",
    });
  }

  handleProposeEditConfigVar(key, value, notes) {
    this.setState({
      edit:true,
      editKey:key,
      editValue:value,
      editNotes:notes || {},
      editOriginalKey:key,
    });
  }

  handleLockAndUnlock() {
    if(this.state.locked) {
      this.setState({locked:!this.state.locked});
    } else if (isEmpty(this.state.changes)) {
      this.setState({locked:!this.state.locked});
    } else {     
      this.handleProposeSaveConfigVar();
    }
  }

  handleDeleteConfigVar(key, value) {
    let changes = util.deepCopy(this.state.changes);
    changes[key] = null;
    this.setState({
      changes,
      edit:false,
      editKey:"",
      editValue:"",
      editOriginalKey:"",
    });
  }

  renderNoConfigVars() {
    return (
      <TableRow>
        <TableCell>
          <span className="no-results">No Config Vars</span>
        </TableCell>
      </TableRow>
    )
  }

  renderAlert() {
    if(this.state.locked) {
      return;
    }
    if(isEmpty(this.state.changes) && isEmpty(this.state.changesNotes)) {
      return;
    }
    const alertStyle = {...GlobalStyles.Header, ...GlobalStyles.ErrorText, marginBottom:'0rem'};
    return (
      <TableRow style={style.tableRow}>
        <TableCell colSpan={3} style={style.tableCell}>
          <div style={{ display:'flex', ...alertStyle}}>
            <ErrorOutline style={{marginRight:'0.5rem'}} />
            <Typography style={{ ...alertStyle, marginTop:'0rem' }} variant="body1">
              These changes are not saved yet.
            </Typography>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  renderAddConfigVar() {
    if(this.state.locked) {
      return;
    } else {
      return (
        <KeyValue
          key="new-config-var-key"
          new={true}
          notes={{}}
          onChange={(key, value, notes) => this.handleProposeEditConfigVar(key, value, notes)} 
          onDelete={(key, value, notes) => this.handleDeleteConfigVar(key, value, notes)} 
          saved={true} 
          deleted={false}
        />
      );
    }
  }

  renderConfigVars() {
    return Object.keys(this.state.config)
      .sort()
      .filter((key) => this.state.notes[key].type !== 'addon')
      .map((key) => {
        let saved = this.state.changes[key] || this.state.changes[key] === null ? false : true;
        let deleted = this.state.changes[key] === null ? true : false;
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
          required={this.state.notes[key] && (this.state.notes[key].read_only || this.state.notes[key].type === "addon")}
          editable={this.state.notes[key] ? this.state.notes[key].type !== "addon" : true}
        />
      )})
      .concat([
        this.renderAddConfigVar()
      ])
      .concat(Object.keys(this.state.serviceConfig).map((addon_id) => {
        let addon = this.state.serviceConfig[addon_id].addon;
        let config = this.state.serviceConfig[addon_id].config;
        return [
          (
            <TableRow key={"addon-" + addon_id} style={style.tableRow}>
              <TableCell colSpan={3} style={style.tableCell}>
                  <Typography variant="h5" style={{...GlobalStyles.HeaderSmall}}>
                    Addon {addon.name}
                  </Typography>
              </TableCell>
            </TableRow>
          )
        ].concat(config.map((key) => {
          let saved = this.state.changes[key] || this.state.changes[key] === null ? false : true;
          let deleted = this.state.changes[key] === null ? true : false;
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
            required={this.state.notes[key] && (this.state.notes[key].read_only || this.state.notes[key].type === "addon")}
            editable={this.state.notes[key] ? this.state.notes[key].type !== "addon" : true}
          />);
        }))
      }).flat())
  }

  renderHeader() {
    let LockedIcon = Lock;
    let toolTipTitle = "Make Changes to Config Vars";
    let lockedIconColor = "default";
    if (!this.state.locked) {
      LockedIcon = LockOpen;
      toolTipTitle = "Save Changes to Config Vars";
      lockedIconColor = "secondary";
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
                  className="new-config" 
                  onClick={() => this.handleLockAndUnlock()}>
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
    return (
      <Dialog
        className="config-propose"
        open={this.state.propose}
        fullWidth
        onClose={() => this.handleCancelProposeSaveConfigVar()}
        onExited={() => this.handleCancelProposeSaveConfigVar()}
      >
        <DialogTitle style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}>
          Proposed Config Var Changes
        </DialogTitle>
        <DialogContent style={{ ...GlobalStyles.PaperSubtleContainerStyle }} dividers>
          {this.state.proposeUpdated.length > 0 ? (
            <div key="update-config-vars-proposed">
              <Typography variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
                Update
              </Typography>
              <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
                {this.state.proposeUpdated.map((x) => {
                  return (
                    <div key={"code-style-" + x} style={{...GlobalStyles.ConfigVarStyle, 'verticalAlign':'top'}}>
                      {x}={JSON.stringify(this.state.changes[x])}
                    </div>
                  )
                })}
              </Paper>
            </div>
          ) : ''}
          {this.state.proposeRemoved.length > 0 ? (
            <div key="remove-config-vars-proposed">
              <Typography variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
                Remove
              </Typography>
              <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
                {this.state.proposeRemoved.map((x) => {
                  return (
                    <div key={"code-style-" + x} style={{...GlobalStyles.ConfigVarStyle, 'verticalAlign':'top'}}>
                      {x}={JSON.stringify(this.state.changes[x])}
                    </div>
                  )
                })}
              </Paper>
            </div>
          ) : ''}
          {this.state.proposeAdded.length > 0 ? (
            <div key="added-config-vars-proposed">
              <Typography variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
                Add
              </Typography>
              <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
                {this.state.proposeAdded.map((x) => {
                  return (
                    <div key={"code-style-" + x} style={{...GlobalStyles.ConfigVarStyle, 'verticalAlign':'top'}}>
                      {x}={JSON.stringify(this.state.changes[x])}
                    </div>
                  )
                })}
              </Paper>
            </div>
          ) : ''}
        </DialogContent>
        <DialogActions>
          <Button className="cancel" color="secondary" onClick={() => this.handleCancelProposeSaveConfigVar()}>
            Cancel
          </Button>
          <Button className="submit" color="primary" onClick={() => this.handleSaveConfigVar()}>
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
        onClose={() => this.setState({edit:false})}
        onExited={() => this.setState({edit:false})}
      >
        <DialogTitle style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}>
          Add or edit config variable
        </DialogTitle>
        <DialogContent style={{ ...GlobalStyles.PaperSubtleContainerStyle }} dividers>
          <br/>
          <TextField
            className="config-edit-key"
            value={this.state.editKey}
            fullWidth
            disabled
            variant="outlined"
            label="Key"
            style={{backgroundColor:'white'}}
            inputProps={{style:style.configVar.textField}}
            onChange={(e) => this.setState({editKey:e.target.value})}
          />
          <br/>&nbsp;<br/>
          <TextField
            className="config-edit-value"
            value={this.state.editValue}
            multiline
            fullWidth
            variant="outlined"
            label="Value"
            rows="3"
            style={{backgroundColor:'white'}}
            inputProps={{style:style.configVar.textField}}
            onChange={(e) => this.setState({editValue:e.target.value})}
          />
          <br/>&nbsp;<br/>
          <TextField
            className="config-edit-notes"
            value={this.state.editNotes ? this.state.editNotes.description : ""}
            multiline
            fullWidth
            variant="outlined"
            label="Notes"
            rows="3"
            style={{backgroundColor:'white'}}
            inputProps={{style:style.configVar.textField}}
            onChange={(e) => this.setState({editNotes:{...this.state.editNotes, "description":e.target.value}})}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.editNotes.required}
                onChange={(e) => this.setState({editNotes:{...this.state.editNotes, "required":e.target.checked}})}
                style={GlobalStyles.FairlySubtle} />
            }
            style={GlobalStyles.FairlySubtle}

            label="Protect this config var from being removed."
          />
        </DialogContent>
        <DialogActions>
          <Button className="cancel" color="secondary" onClick={() => this.setState({edit:false})}>
            Cancel
          </Button>
          <Button className="submit" color="primary" onClick={() => this.handleEditConfigVar()}>
            Stage Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderLoading() {
    return (
      <div style={style.refresh.div}>
        <CircularProgress 
          top={0} size={40} left={0} style={style.refresh.indicator} 
          status="loading" />
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
      </div>
    );
  }
}

ConfigVar.propTypes = {
  app: PropTypes.string.isRequired,
};
