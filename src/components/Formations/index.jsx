import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/clear';

import api from '../../services/api';
import util from '../../services/util';
import NewFormation from './NewFormation';
import DynoType from './DynoType';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  tableRowColumn: {
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

export default class Formations extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      formations: [],
      sizes: [],
      dynos: [],
      loading: true,
      submitFail: false,
      submitMessage: '',
      open: false,
      message: '',
      new: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      Promise.all([
        api.getFormations(this.props.app),
        api.getFormationSizes(),
        api.getDynos(this.props.app),
      ])
        .then(([r1, r2, r3]) => {
          const formations = r1.data.sort((a, b) => (a.type < b.type ? -1 : 1));
          const dynos = r3.data;
          let sizes = [];
          r2.data.forEach((size) => {
            if (size.name.indexOf('prod') === -1) {
              sizes.push(size);
            }
          });
          sizes = sizes.sort((a, b) =>
            parseInt(a.resources.limits.memory, 10) - parseInt(b.resources.limits.memory, 10));
          this.setState({
            sizes,
            dynos,
            formations,
            loading: false,
          });
        });
    }
  }

  getSizes() {
    return this.state.sizes.map(size =>
      (<MenuItem
        className={size.name}
        key={size.name}
        value={size.name}
        primaryText={size.resources.limits.memory}
      />));
  }

  getFormations() {
    return this.state.formations.map(formation => (
      <DynoType
        formation={formation}
        dynos={util.filterDynosByFormation(this.state.dynos, formation)}
        onComplete={this.reload}
        onAlert={this.info}
        key={formation.id}
        sizeList={this.getSizes()}
        onError={this.handleError}
        app={this.props.app}
      />
    ));
  }

  handleError = (message) => {
    this.setState({
      submitMessage: message,
      submitFail: true,
      loading: false,
      open: false,
      message: '',
    });
  }

  handleDialogClose = () => {
    this.setState({ submitFail: false });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  handleNewFormation = () => {
    this.setState({ new: true });
  }

  handleNewFormationCancel = () => {
    this.setState({ new: false });
  }

  info = (message) => {
    this.setState({
      open: true,
      message,
    });
  }

  reload = (message) => {
    this.setState({ loading: true });
    Promise.all([
      api.getFormations(this.props.app),
      api.getDynos(this.props.app),
    ])
      .then(([r1, r2]) => {
        const formations = r1.data.sort((a, b) => (a.type < b.type ? -1 : 1));
        const dynos = r2.data;
        this.setState({
          formations,
          dynos,
          loading: false,
          new: false,
          open: true,
          message,
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
              <IconButton className="new-formation" onTouchTap={this.handleNewFormation} tooltip="New Formation" tooltipPosition="bottom-left"><AddIcon /></IconButton>
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton className="cancel" onTouchTap={this.handleNewFormationCancel}><RemoveIcon /></IconButton>
              <NewFormation app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          <Table className="formation-list" wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
              <TableRow>
                <TableHeaderColumn>Formation</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
              {this.getFormations()}
            </TableBody>
          </Table>
          <Dialog
            className="error"
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
            className="formation-snack"
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

Formations.propTypes = {
  app: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};
