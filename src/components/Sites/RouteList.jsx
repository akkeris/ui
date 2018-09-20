import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import PropTypes from 'prop-types';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import ArrowIcon from 'material-ui/svg-icons/navigation/arrow-forward';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/clear';

import api from '../../services/api';
import NewRoute from './NewRoute';
import ConfirmationModal from '../ConfirmationModal';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
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
    icon: {
      width: '58px',
    },
  },
};

export default class RouteList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      routes: [],
      route: null,
      loading: true,
      open: false,
      new: false,
      message: '',
      confirmOpen: false,
    };
  }

  componentDidMount() {
    api.getRoutes(this.props.site).then((response) => {
      this.setState({
        routes: response.data,
        loading: false,
      });
    });
  }

  getRoutes() {
    return this.state.routes.map(route => (
      <TableRow key={route.id} style={style.tableRow}>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}><a href={`https://${this.props.site.domain || this.props.site}${route.source_path}`}>{`https://${this.props.site.domain || this.props.site}${route.source_path}`}</a></div>
          <div style={style.tableRowColumn.sub}>{route.id}</div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <ArrowIcon />
        </TableRowColumn>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{route.target_path}</div>
          <div style={style.tableRowColumn.sub}>{route.app.name || route.app}</div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton
              onClick={() => this.handleConfirmation(route)}
            >
              <RemoveIcon />
            </IconButton>
          </div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  handleNewRoute = () => {
    this.setState({ new: true });
  }

  handleNewRouteCancel = () => {
    this.setState({ new: false });
  }

  handleRemoveRoute = () => {
    this.setState({ loading: true });
    api.deleteRoute(this.state.route.id).then(() => {
      this.reload('Route Deleted');
    }).catch((error) => {
      this.setState({
        new: false,
        loading: false,
        open: false,
        route: null,
        confirmOpen: false,
      });
      this.props.onError(error.response.data);
    });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  handleConfirmation = (route) => {
    this.setState({
      confirmOpen: true,
      route,
    });
  }

  handleCancelConfirmation = () => {
    this.setState({
      confirmOpen: false,
    });
  }

  reload = (message) => {
    this.setState({ loading: true });
    api.getRoutes(this.props.site).then((response) => {
      this.setState({
        routes: response.data,
        loading: false,
        new: false,
        message,
        open: true,
        confirmOpen: false,
        route: null,
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
              <IconButton onClick={this.handleNewRoute} tooltip="New Route" tooltipPosition="bottom-left"><AddIcon /></IconButton>
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton onClick={this.handleNewRouteCancel}><RemoveIcon /></IconButton>
              <NewRoute site={this.props.site} onComplete={this.reload} />
            </div>
          )}
          <Table selectable={false} wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
              <TableRow>
                <TableHeaderColumn>Source</TableHeaderColumn>
                <TableHeaderColumn style={style.tableRowColumn.icon} />
                <TableHeaderColumn>Target</TableHeaderColumn>
                <TableHeaderColumn style={style.tableRowColumn.icon} />
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} showRowHover>
              {this.getRoutes()}
            </TableBody>
          </Table>
          <ConfirmationModal open={this.state.confirmOpen} onOk={this.handleRemoveRoute} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this Route?" />
          <Snackbar
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

RouteList.propTypes = {
  site: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
};
