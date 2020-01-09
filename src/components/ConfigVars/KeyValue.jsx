import React from 'react';
import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  TextField,
  Tooltip,
  IconButton,
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import GlobalStyles from '../../config/GlobalStyles';
import util from '../../services/util';
import BaseComponent from '../../BaseComponent';


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
      fontFamily: 'Courier',
      ...GlobalStyles.Subtle,
      ...GlobalStyles.Text,
      overflow: 'auto',
      whiteSpace: 'nowrap',
    },
  },
  tableCell: {
    paddingTop: '4px',
    paddingBottom: '4px',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

export default class KeyValue extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      key: this.props.configkey,
      value: this.props.value,
      saved: this.props.saved,
      notes: util.deepCopy(this.props.notes),
    };
  }

  handleAddConfigVar() {
    if (this.state.key.trim() !== '') {
      this.props.onChange(this.state.key, this.state.value, this.state.notes);
      this.setState({ key: '', value: '' });
    }
  }

  handleEditConfigVar() {
    this.props.onChange(this.props.configkey, this.props.value, this.props.notes);
  }

  handleRemoveConfigVar() {
    this.props.onDelete(this.props.configkey, this.props.value);
  }

  renderAddConfigVar() {
    return (
      <TableRow hover className="new-config-var" key="new-config-var" style={style.tableRow}>
        <TableCell padding="none" style={{ ...style.configVar, ...style.tableCell}}>
          <TextField
            style={{maxWidth:'300px'}}
            className="new-config-var-key"
            onChange={event => this.setState({ key: event.target.value })}
            InputProps={{ style: style.configVar.textField }}
            placeholder="KEY"
            size="small"
            value={this.state.key}
            autoFocus
            required
            variant="outlined"
            fullWidth
            margin="dense"
          />
        </TableCell>
        <TableCell style={{ ...style.configVar, ...style.tableCell }}>
          <TextField
            style={{maxWidth:'450px'}}
            className="new-config-var-value"
            onChange={event => this.setState({ value: event.target.value })}
            InputProps={{ style: style.configVar.textField }}
            placeholder="VALUE"
            size="small"
            required
            value={this.state.value}
            variant="outlined"
            fullWidth
            margin="dense"
            multiline
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
    );
  }

  renderConfigVarNotes() { 
    return ( 
      <Tooltip title={this.props.notes.description} placement="top-start">
        <IconButton>
          <InfoIcon style={GlobalStyles.Subtle} />
        </IconButton>
      </Tooltip>
    );
  }

  renderEditAction() {
    const disabled = this.props.deleted || !this.props.editable;
    const editStyle = disabled ? GlobalStyles.VerySubtle : GlobalStyles.Suble;
    return ( /* eslint-disable-line */
      <Tooltip title="Edit" placement="top-start">
        <IconButton disabled={disabled} className="edit" onClick={() => this.handleEditConfigVar()}> { /* eslint-disable-line */ }
          <EditIcon style={editStyle} />
        </IconButton>
      </Tooltip>
    );
  }

  renderDeleteAction() {
    const disabled = this.props.deleted || this.props.required;
    const deleteStyle = disabled ? GlobalStyles.VerySubtle : GlobalStyles.Suble;
    return (
      <Tooltip title="Remove" placement="top-start">
        <IconButton
          className="remove"
          disabled={disabled}
          onClick={() => this.handleRemoveConfigVar()}
        >
          <DeleteIcon style={deleteStyle} />
        </IconButton>
      </Tooltip>
    );
  }

  renderEditConfigVar() {
    const configVarStyle = util.deepCopy(GlobalStyles.ConfigVarStyle);
    configVarStyle.maxWidth = '450px';
    configVarStyle.verticalAlign = 'top';
    configVarStyle.backgroundColor = this.props.saved ?
      'rgba(0,0,0,0.025)' :
      'rgba(255,0,0,0.075)';
    if (this.props.deleted) {
      configVarStyle.textDecoration = 'line-through';
    }
    const hasNotes = this.props.notes && this.props.notes.description && this.props.notes.description !== "";
    return (
      <TableRow className={this.props.configkey} key={this.props.configkey} style={style.tableRow}> { /* eslint-disable-line */ }
        <TableCell padding="none" style={{ ...style.configVar, ...style.tableCell }}>
          <span style={{...GlobalStyles.CommitLink, ...GlobalStyles.CommitLinkPre, ...configVarStyle, 'maxWidth':'300px'}}>{this.props.configkey}</span> { /* eslint-disable-line */ }
        </TableCell>
        <TableCell style={{ ...style.configVar, ...style.tableCell }}>
          <span style={{...GlobalStyles.CommitLink, ...GlobalStyles.CommitLinkPre, ...configVarStyle}}>{this.props.value}</span> { /* eslint-disable-line */ }
        </TableCell>
        <TableCell style={style.tableCell}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {hasNotes && this.renderConfigVarNotes()}
            {!this.props.locked && this.renderEditAction()}
            {!this.props.locked && this.renderDeleteAction()}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  render() {
    if (this.props.new) {
      return this.renderAddConfigVar();
    }
    return this.renderEditConfigVar();
  }
}

KeyValue.propTypes = {
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  configkey: PropTypes.string,
  value: PropTypes.string,
  notes: PropTypes.object, /* eslint-disable-line */
  saved: PropTypes.bool.isRequired,
  new: PropTypes.bool.isRequired,
  deleted: PropTypes.bool.isRequired,
  required: PropTypes.bool,
  locked: PropTypes.bool.isRequired,
  editable: PropTypes.bool,
};

KeyValue.defaultProps = {
  configkey: '',
  value: '',
  notes: {},
  locked: true,
  required: false,
  editable: true,
};
