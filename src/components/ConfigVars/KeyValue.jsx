import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  TextField,
  Tooltip,
  Typography,
  IconButton,
  Button,
  Fab,
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import GlobalStyles from '../../config/GlobalStyles';
import util from '../../services/util';

const style = {
  tableRow: {
    height: '58px',
  },
  configVar: {
    overflowWrap: 'break-word',
    key: {
      maxWidth: '300px',
      overflowWrap: 'break-word',
    },
    value: {
      maxWidth: '425px',
      overflowWrap: 'break-word',
    },
    textField: {
      'fontFamily':'Courier',
      ...GlobalStyles.Subtle,
      ...GlobalStyles.Text, 
      'overflow':'auto', 
      'whiteSpace':'nowrap'
    },
  },
  tableCell: {
    paddingTop: '4px',
    paddingBottom: '4px',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

export default class KeyValue extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      key:this.props.configkey,
      value:this.props.value,
      saved:this.props.saved,
      notes:util.deepCopy(this.props.notes),
    };
  }

  handleAddConfigVar() {
    if(this.state.key.trim() === "") {
      return;
    }
    this.props.onChange(this.state.key, this.state.value, this.state.notes);
    this.setState({key: "", value:""});
  }

  handleEditConfigVar() {
    this.props.onChange(this.props.configkey, this.props.value, this.props.notes);
  }

  handleRemoveConfigVar() {
    this.props.onDelete(this.props.configkey, this.props.value);
  }

  renderAddConfigVar() {
    return (
      <TableRow hover className="" key="new-config-var" style={style.tableRow}>
        <TableCell padding="none" style={{ ...style.configVar, ...style.tableCell }}>
          <TextField 
            onChange={(event) => this.setState({key:event.target.value})}
            InputProps={{style:style.configVar.textField}} 
            placeholder="KEY" 
            size="small" 
            value={this.state.key}
            autoFocus={true} 
            required
            variant="outlined" 
            fullWidth={true}
            margin="dense"
          />
        </TableCell>
        <TableCell style={{ ...style.configVar, ...style.tableCell }}>
          <TextField 
            onChange={(event) => this.setState({value:event.target.value})}
            InputProps={{style:style.configVar.textField}} 
            placeholder="VALUE" 
            size="small" 
            required 
            value={this.state.value}
            variant="outlined" 
            fullWidth={true} 
            margin="dense" 
            multiline={true} 
          />
        </TableCell>
        <TableCell style={style.tableCell}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Add" placement="top-start">
              <IconButton className="add" onClick={() => this.handleAddConfigVar()}>
                <AddIcon style={GlobalStyles.Subtle} />
              </IconButton>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  renderConfigVarNotes() {
    if(this.props.notes && this.props.notes.description && this.props.notes.description !== "") { /* eslint-disable-line */
      return (
        <Tooltip title={this.props.notes.description} arrow placement="top-start">
          <IconButton>
            <InfoIcon style={GlobalStyles.Subtle} />
          </IconButton>
        </Tooltip>
      )
    }
  }

  renderEditAction() {
    if(this.props.locked) {
      return;
    } else {
      let disabled = this.props.deleted || !this.props.editable;
      let editStyle = disabled ? GlobalStyles.VerySubtle : GlobalStyles.Suble;
      return (
        <Tooltip title="Edit" placement="top-start">
          <IconButton disabled={disabled} className="edit" onClick={() => this.handleEditConfigVar()}>
            <EditIcon style={editStyle} />
          </IconButton>
        </Tooltip>
      )
    }
  }

  renderDeleteAction() {
    if(this.props.locked) {
      return;
    } else {
      let disabled = this.props.deleted || this.props.required;
      let deleteStyle = disabled ? GlobalStyles.VerySubtle : GlobalStyles.Suble;
      return (
        <Tooltip title="Remove" placement="top-start">
          <IconButton
            className="remove" 
            disabled={disabled}
            onClick={() => this.handleRemoveConfigVar()}>
              <DeleteIcon style={deleteStyle} />
          </IconButton>
        </Tooltip>
      )
    }
  }

  renderEditConfigVar() {
    let configVarStyle = util.deepCopy(GlobalStyles.ConfigVarStyle);
    configVarStyle.maxWidth = '450px';
    configVarStyle.verticalAlign = 'top';
    if(!this.props.saved) {
      configVarStyle.backgroundColor = 'rgba(255,0,0,0.075)';
    } else {
      configVarStyle.backgroundColor = 'rgba(0,0,0,0.025)';
    }
    if(this.props.deleted) {
      configVarStyle.textDecoration = 'line-through';
    }

    return (
       <TableRow hover className={this.props.configkey} key={this.props.configkey} style={style.tableRow}>
        <TableCell padding="none" style={{ ...style.configVar, ...style.tableCell }}>
          <span style={{...GlobalStyles.CommitLink, ...GlobalStyles.CommitLinkPre, ...configVarStyle}}>{this.props.configkey}</span>
        </TableCell>
        <TableCell style={{ ...style.configVar, ...style.tableCell }}>
          <span style={{...GlobalStyles.CommitLink, ...GlobalStyles.CommitLinkPre, ...configVarStyle}}>{this.props.value}</span>
        </TableCell>
        <TableCell style={style.tableCell}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {this.renderConfigVarNotes()}
            {this.renderEditAction()}
            {this.renderDeleteAction()}
          </div>
        </TableCell>
      </TableRow>
    )
  }

  render() {
    if(this.props.new) {
      return this.renderAddConfigVar();
    } else {
      return this.renderEditConfigVar();
    }
  }
}

KeyValue.propTypes = {
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  configkey: PropTypes.string,
  value: PropTypes.string,
  notes: PropTypes.object,
  saved: PropTypes.bool.isRequired,
  new: PropTypes.bool.isRequired,
  deleted: PropTypes.bool.isRequired,
  required: PropTypes.bool,
  locked: PropTypes.bool.isRequired,
  editable: PropTypes.bool,
};

KeyValue.defaultProps = {
  configkey: "",
  value: "",
  notes: {},
  locked: true,
  required: false,
  editable: true,
};
