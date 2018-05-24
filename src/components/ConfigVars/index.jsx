import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';

import api from '../../services/api';
import NewConfigVar from './NewConfigVar';
import ConfirmationModal from '../ConfirmationModal';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  tableRow: {
    height: '58px',
  },
  tableRowColumn: {
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

export default class ConfigVar extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      config: {},
      key: null,
      loading: true,
      open: false,
      message: '',
      new: false,
      confirmOpen: false,
      submitFail: false,
      submitMessage: '',
      edit: false,
      newValue: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      api.getConfig(this.props.app).then((response) => {
        this.setState({
          config: response.data,
          loading: false,
        });
      });
    }
  }

  getConfigVars() {
    return Object.keys(this.state.config).map(key => (
      <TableRow className={key} key={key} style={style.tableRow} selectable={false}>
        <TableRowColumn>
          <div>{key}</div>
        </TableRowColumn>
        <TableRowColumn>
          <div>{this.state.config[key]}</div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton className="edit" onTouchTap={() => this.handleEdit(key)}>
              <EditIcon />
            </IconButton>
          </div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton className="remove" onTouchTap={() => this.handleConfirmation(key)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  handleNewConfig = () => {
    this.setState({ new: true, open: false, message: '' });
  }

  handleNewConfigCancel = () => {
    this.setState({ new: false, open: false, message: '' });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  handleRemoveConfig = () => {
    this.setState({ loading: true });
    api.patchConfig(this.props.app, this.state.key, null).then(() => {
      this.reload('Updated Config Vars');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        loading: false,
        key: null,
        new: false,
        confirmOpen: false,
        edit: null,
        newValue: null,
      });
    });
  }

  handleConfirmation = (key) => {
    this.setState({
      confirmOpen: true,
      key,
    });
  }

  handleCancelConfirmation = () => {
    this.setState({
      confirmOpen: false,
      key: null,
    });
  }

  handleEdit = (key) => {
    this.setState({
      edit: true,
      key,
      newValue: this.state.config[key],
    });
  }

  handleEditCancel = () => {
    this.setState({
      edit: false,
      key: null,
      newValue: null,
    });
  }

  handleEditSubmit = () => {
    this.setState({ loading: true });
    api.patchConfig(this.props.app, this.state.key, this.state.newValue).then(() => {
      this.reload('Updated Config Vars');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        loading: false,
        key: null,
        new: false,
        newValue: null,
        edit: false,
      });
    });
  }

  handleNewValueChange = (event) => {
    this.setState({
      newValue: event.target.value,
    });
  }

  reload = (message) => {
    this.setState({ loading: true });
    api.getConfig(this.props.app).then((response) => {
      this.setState({
        config: response.data,
        loading: false,
        new: false,
        message,
        open: true,
        confirmOpen: false,
        newValue: null,
        edit: false,
        key: null,
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
              <IconButton className="new-config" onTouchTap={this.handleNewConfig} tooltip="New Config" tooltipPosition="bottom-left"><AddIcon /></IconButton>
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton className="config-cancel" onTouchTap={this.handleNewConfigCancel}><RemoveIcon /></IconButton>
              <NewConfigVar
                app={this.props.app}
                onComplete={this.reload}
                config={this.state.config}
              />
            </div>
          )}
          <Divider />
          <Table className="config-list" wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
            <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
              {this.getConfigVars()}
            </TableBody>
          </Table>
          <Dialog
            className="config-error"
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
          <Dialog
            className="config-edit"
            open={this.state.edit}
            modal
            actions={[
              <FlatButton
                className="submit"
                label="Submit"
                primary
                onTouchTap={this.handleEditSubmit}
              />,
              <FlatButton
                className="cancel"
                label="Cancel"
                primary
                onTouchTap={this.handleEditCancel}
              />]}
          >
            <TextField className="config-edit-value" floatingLabelText={this.state.key} value={this.state.newValue} multiLine fullWidth onChange={this.handleNewValueChange} />
          </Dialog>
          <ConfirmationModal className="remove-config" open={this.state.confirmOpen} onOk={this.handleRemoveConfig} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this config var?" />
          <Snackbar
            className="config-snack"
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

ConfigVar.propTypes = {
  app: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};
