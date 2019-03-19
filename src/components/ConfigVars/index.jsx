import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, Table, TableBody, TableRow, TableCell, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Snackbar, Divider, Paper, Button, TextField, Collapse, Typography, TableHead,
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';

import api from '../../services/api';
import NewConfigVar from './NewConfigVar';
import ConfirmationModal from '../ConfirmationModal';

const style = {
  tableRow: {
    height: '58px',
  },
  removeIcon: {
    width: '58px',
  },
  editIcon: {
    width: '58px',
    padding: 0,
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
    this.getConfigVars();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getConfigVars = async () => {
    const { data: config } = await api.getConfig(this.props.app);
    if (this._isMounted) {
      this.setState({ config, loading: false });
    }
  }

  closeEditDialog = () => {
    this.setState({ edit: false });
  }

  handleDialogClose = () => {
    this.setState({ submitFail: false });
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

  handleRemoveConfig = async () => {
    this.setState({ loading: true });
    try {
      await api.patchConfig(this.props.app, this.state.key.trim(), null);
      this.reload('Updated Config Vars');
    } catch (error) {
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
    }
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
      key: null,
      newValue: null,
    });
  }

  handleEditSubmit = async () => {
    this.setState({ loading: true });
    try {
      await api.patchConfig(this.props.app, this.state.key.trim(), this.state.newValue.trim());
      this.reload('Updated Config Vars');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        loading: false,
        key: null,
        new: false,
        newValue: null,
        edit: false,
      });
    }
  }

  handleNewValueChange = (event) => {
    this.setState({
      newValue: event.target.value,
    });
  }

  reload = async (message) => {
    this.setState({ loading: true });
    const { data: config } = await api.getConfig(this.props.app);
    this.setState({
      config,
      loading: false,
      new: false,
      message,
      open: true,
      confirmOpen: false,
      newValue: null,
      edit: false,
      key: null,
    });
  }

  renderConfigVars() {
    return Object.keys(this.state.config).sort().map(key => (
      <TableRow hover className={key} key={key} style={style.tableRow}>
        <TableCell style={style.configVar}>
          <div style={style.configVar.key}>{key}</div>
        </TableCell>
        <TableCell style={style.configVar}>
          <div style={style.configVar.value}>{this.state.config[key]}</div>
        </TableCell>
        <TableCell>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0px 2px' }}>
            <Tooltip title="Edit" placement="top-start">
              <IconButton className="edit" onClick={() => this.handleEdit(key)}>
                <EditIcon nativeColor="black" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove" placement="top-start">
              <IconButton className="remove" onClick={() => this.handleConfirmation(key)}>
                <RemoveIcon nativeColor="black" />
              </IconButton>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    ));
  }

  render() {
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 24px' }}>
          <Typography style={{ flex: 1 }} variant="overline">Config</Typography>
          <div style={{ width: '50px' }}>
            {this.state.new ? (
              <IconButton className="config-cancel" onClick={this.handleNewConfigCancel}><RemoveIcon nativeColor="black" /></IconButton>
            ) : (
              <Tooltip title="New Config" placement="bottom-start">
                <IconButton className="new-config" onClick={this.handleNewConfig}><AddIcon nativeColor="black" /></IconButton>
              </Tooltip>
            )}
          </div>
        </div>
        <Collapse in={this.state.new}>
          <NewConfigVar
            app={this.props.app}
            onComplete={this.reload}
            config={this.state.config}
          />
        </Collapse>
        <Divider />
        <Table className="config-list">
          <TableBody>
            {this.renderConfigVars()}
          </TableBody>
        </Table>
        <ConfirmationModal
          className="config-error"
          open={this.state.submitFail}
          onOk={this.handleDialogClose}
          title="Error"
          message={this.state.submitMessage}
        />
        <ConfirmationModal
          className="remove-config"
          open={this.state.confirmOpen}
          onOk={this.handleRemoveConfig}
          onCancel={this.handleCancelConfirmation}
          message="Are you sure you want to delete this config var?"
        />
        <Snackbar
          className="config-snack"
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={this.handleRequestClose}
        />
        <Dialog
          className="config-edit"
          open={this.state.edit}
          maxWidth="lg"
          onClose={this.closeEditDialog}
          onExited={this.handleEditCancel}
        >
          <DialogTitle>{this.state.key ? `Edit ${this.state.key}` : 'Edit Config'}</DialogTitle>
          <DialogContent style={{ minWidth: '400px' }}>
            <TextField
              className="config-edit-value"
              value={this.state.newValue}
              multiline
              fullWidth
              onChange={this.handleNewValueChange}
            />
          </DialogContent>
          <DialogActions>
            <Button className="cancel" color="secondary" onClick={this.closeEditDialog}>Cancel</Button>
            <Button className="submit" color="primary" onClick={this.handleEditSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ConfigVar.propTypes = {
  app: PropTypes.string.isRequired,
  // active: PropTypes.bool.isRequired,
};
