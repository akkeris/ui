import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import SaveIcon from 'material-ui/svg-icons/content/save';

const muiTheme = getMuiTheme();

const style = {
  container: {
    marginTop: '24px',
    marginBottom: '24px',
    verticalAlign: 'middle',
    display: 'flex',
    flexFlow: 'row wrap',
    borderLeft: '4px solid rgba(0,0,0,0.2)',
    paddingLeft: '1em',
    paddingBottom: '1em',
  },
  key: {
    flexGrow: 1,
  },
  value: {
    marginLeft: '16px',
    flexGrow: 1,
  },
  edit: {
    marginLeft: '16px',
    flexGrow: 0,
    boxShadow: 'none !important',
    verticalAlign: 'middle',
  },
  description: {
    width: '100%',
    color: 'rgba(0,0,0,0.6)',
  },
};

export default class ConfigVar extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editbutton: !!this.props.editbutton,
      keyedit: !!this.props.keyedit,
      editable: !!this.props.editable,
      editing: !!this.props.editing,
      name: this.props.name,
      value: this.props.value,
      description: this.props.description,
    };
  }

  updateValue = (event, value) => {
    this.setState({ value });
    if (!this.state.editbutton) {
      if (this.props.onChange) {
        this.props.onChange(this, this.state.name, value);
      }
    }
  }

  updateKey = (event, value) => {
    this.setState({ name: value });
    if (!this.state.editbutton) {
      if (this.props.onChange) {
        this.props.onChange(this, value, this.state.value);
      }
    }
  }

  editOrSave = () => {
    if (this.state.editing) {
      this.setState({ editing: false });
      if (this.props.onChange) {
        this.props.onChange(this, this.state.name, this.state.value);
      }
    } else {
      this.setState({ editing: true });
    }
  }

  render() {
    const disabled = !this.props.editable || !this.state.editing;
    const icon = this.state.editing ? <SaveIcon /> : <EditIcon />;
    const keyfield = this.state.keyedit ? (
      <TextField
        style={style.key}
        hintText="KEY"
        onChange={this.updateKey}
        value={this.state.name}
        disabled={disabled}
      />
    ) : null;
    const button = this.state.editbutton ? (
      <IconButton
        style={style.edit}
        disabled={!this.state.editable}
        onClick={this.editOrSave}
      >{icon}
      </IconButton>
    ) : null;
    const description = this.state.description ? (
      <div style={style.description}>{this.state.description}</div>
    ) : null;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={style.container}>
          {keyfield}
          <TextField
            floatingLabelText={!this.state.keyedit ? this.state.name : null}
            style={!this.state.keyedit ? style.key : style.value}
            hintText="VALUE"
            onChange={this.updateValue}
            value={this.state.value}
            disabled={disabled}
          />
          {button}
          {description}
        </div>
      </MuiThemeProvider>
    );
  }
}

ConfigVar.propTypes = {
  keyedit: PropTypes.bool,
  editbutton: PropTypes.bool,
  editable: PropTypes.bool,
  editing: PropTypes.bool,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

ConfigVar.defaultProps = {
  keyedit: false,
  editbutton: false,
  editable: false,
  editing: false,
};