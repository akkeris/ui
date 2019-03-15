import React, { Component } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell, Paper, TablePagination,
  CircularProgress, Snackbar, IconButton, Tooltip, TableFooter,
} from '@material-ui/core';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import PropTypes from 'prop-types';

import api from '../../services/api';
import NewRoute from './NewRoute';
import ConfirmationModal from '../ConfirmationModal';

const style = {
  refresh: {
    div: {
      width: '40px',
      height: '40px',
      padding: '10% 0',
      margin: '0 auto',
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
      page: 0,
      rowsPerPage: 15,
    };
  }

  componentDidMount() {
    this.getRoutes();
  }

  getRoutes = async () => {
    const { data: routes } = await api.getRoutes(this.props.site);
    this.setState({ routes, loading: false });
  }

  handleNewRoute = () => {
    this.setState({ new: true });
  }

  handleNewRouteCancel = () => {
    this.setState({ new: false });
  }

  handleRemoveRoute = async () => {
    this.setState({ loading: true });
    try {
      await api.deleteRoute(this.state.route.id);
      this.reload('Route Deleted');
    } catch (error) {
      this.setState({
        new: false,
        loading: false,
        open: false,
        route: null,
        confirmOpen: false,
      });
      this.props.onError(error.response.data);
    }
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

  reload = async (message) => {
    this.setState({ loading: true });
    const { data: routes } = await api.getRoutes(this.props.site);
    this.setState({
      routes,
      loading: false,
      new: false,
      message,
      open: true,
      confirmOpen: false,
      route: null,
    });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  renderRoutes(page, rowsPerPage) {
    return this.state.routes.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map(route => (
      <TableRow key={route.id} style={style.tableRow}>
        <TableCell>
          <div style={style.tableRowColumn.title}><a href={`https://${this.props.site.domain || this.props.site}${route.source_path}`}>{`https://${this.props.site.domain || this.props.site}${route.source_path}`}</a></div>
          <div style={style.tableRowColumn.sub}>{route.id}</div>
        </TableCell>
        <TableCell style={style.tableRowColumn.icon}>
          <ArrowIcon />
        </TableCell>
        <TableCell>
          <div style={style.tableRowColumn.title}>{route.target_path}</div>
          <div style={style.tableRowColumn.sub}>{route.app.name || route.app}</div>
        </TableCell>
        <TableCell style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.end}>
            <IconButton
              onClick={() => this.handleConfirmation(route)}
            >
              <RemoveIcon />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>
    ));
  }

  render() {
    const { routes, page, rowsPerPage } = this.state;
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div>
        {!this.state.new && (
          <Paper elevation={0}>
            <Tooltip title="New Route" placement="bottom-start">
              <IconButton onClick={this.handleNewRoute}><AddIcon /></IconButton>
            </Tooltip>
          </Paper>
        )}
        {this.state.new && (
          <div>
            <IconButton onClick={this.handleNewRouteCancel}><RemoveIcon /></IconButton>
            <NewRoute site={this.props.site} onComplete={this.reload} />
          </div>
        )}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Source</TableCell>
              <TableCell style={style.tableRowColumn.icon} />
              <TableCell>Target</TableCell>
              <TableCell style={style.tableRowColumn.icon} />
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderRoutes(page, rowsPerPage)}
          </TableBody>
          {routes.length !== 0 && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[15, 25, 50]}
                  colSpan={4}
                  count={routes.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
        <ConfirmationModal open={this.state.confirmOpen} onOk={this.handleRemoveRoute} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this Route?" />
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

RouteList.propTypes = {
  site: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
};
