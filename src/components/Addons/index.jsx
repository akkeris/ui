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
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import api from '../../services/api';
import NewAddon from './NewAddon';
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
      loading: true,
      open: false,
      confirmOpen: false,
      message: '',
      new: false,
      submitFail: false,
      submitMessage: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      api.getAppAddons(this.props.app).then((response) => {
        this.setState({
          addons: response.data,
          loading: false,
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
        </TableRowColumn>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{addon.plan.name}</div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton className="remove" onTouchTap={() => this.handleConfirmation(addon)}>
              <RemoveIcon />
            </IconButton>
          </div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  handleNewAddon = () => {
    this.setState({ new: true });
  }

  handleNewAddonCancel = () => {
    this.setState({ new: false });
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
        confirmOpen: false,
      });
    });
  }

  handleConfirmation = (addon) => {
    this.setState({
      confirmOpen: true,
      addon,
    });
  }

  handleCancelConfirmation = () => {
    this.setState({
      confirmOpen: false,
      addon: null,
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
    api.getAppAddons(this.props.app).then((response) => {
      this.setState({
        addons: response.data,
        loading: false,
        new: false,
        message,
        open: true,
        confirmOpen: false,
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
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton className="addon-cancel" onTouchTap={this.handleNewAddonCancel}><RemoveIcon /></IconButton>
              <NewAddon app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          <Table className="addon-list">
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
              <TableRow>
                <TableHeaderColumn>Addon</TableHeaderColumn>
                <TableHeaderColumn>Plan</TableHeaderColumn>
                <TableHeaderColumn style={style.tableRowColumn.icon}>Remove</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
              {this.getAddons()}
            </TableBody>
          </Table>
          <ConfirmationModal className="remove-confirm" open={this.state.confirmOpen} onOk={this.handleRemoveAddon} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this addon?" />
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

