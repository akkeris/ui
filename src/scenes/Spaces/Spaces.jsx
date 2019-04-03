import React, { Component } from 'react';
import {
  Toolbar, Table, TableBody, TableHead, TableRow, TableCell, IconButton, CircularProgress, Paper,
  TableFooter, TablePagination, TableSortLabel, Tooltip,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
/* eslint-disable jsx-a11y/anchor-is-valid */
import api from '../../services/api';

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '15%',
      marginBottom: '5%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
      color: 'white',
    },
  },
  toolbar: {
    backgroundColor: 'rgba(0,0,0,0)',
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  link: {
    textDecoration: 'none',
    marginLeft: 'auto',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    marginBottom: '12px',
  },
  tableRow: {
    height: '58px',
  },
  tableCell: {
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
};

export default class Spaces extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      spaces: [],
      page: 0,
      rowsPerPage: 15,
      sortBy: 'space',
      sortDirection: 'asc',
      sortedSpaces: [],
    };
  }

  componentDidMount() {
    this.getSpaces();
  }

  getSpaces = async () => {
    const { data: spaces } = await api.getSpaces();
    this.setState({ spaces, sortedSpaces: spaces, loading: false });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleSortChange = column => () => {
    const sb = column;
    let sd = 'desc';
    if (this.state.sortBy === column && this.state.sortDirection === 'desc') {
      sd = 'asc';
    }
    this.setState({ sortBy: sb, sortDirection: sd });

    const { sortedSpaces } = this.state;

    const ss = sortedSpaces.sort((a, b) => {
      switch (`${sb}-${sd}`) {
        case 'space-asc':
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case 'space-desc':
          return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
        case 'app-asc':
          return a.apps - b.apps;
        case 'app-desc':
          return b.apps - a.apps;
        case 'compliance-asc':
          return a.compliance.sort().join('').toLowerCase().localeCompare(b.compliance.sort().join('').toLowerCase());
        case 'compliance-desc':
          return b.compliance.sort().join('').toLowerCase().localeCompare(a.compliance.sort().join('').toLowerCase());
        case 'stack-asc':
          return a.stack.name.toLowerCase().localeCompare(b.stack.name.toLowerCase());
        case 'stack-desc':
          return b.stack.name.toLowerCase().localeCompare(a.stack.name.toLowerCase());
        default:
          return 0;
      }
    });

    this.setState({ sortedSpaces: ss, page: 0 });
  }

  renderSpaces(page, rowsPerPage) {
    return this.state.spaces.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map(space => (
      <TableRow hover className={space.name} key={space.id} style={style.tableRow}>
        <TableCell>
          <div style={style.tableCell.title}>{space.name}</div>
          <div style={style.tableCell.sub}>{space.id}</div>
        </TableCell>
        <TableCell style={style.tableCell.icon}>
          <div style={style.tableCell.title}>{space.apps}</div>
        </TableCell>
        <TableCell>
          <div style={style.tableCell.title}>{space.compliance.toString()}</div>
        </TableCell>
        <TableCell>
          <div style={style.tableCell.title}>{space.stack.name}</div>
        </TableCell>
      </TableRow>
    ));
  }

  render() {
    const { spaces, page, rowsPerPage, sortBy, sortDirection } = this.state;
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div>
        <Toolbar style={style.toolbar} disableGutters>
          <Link to="/spaces/new" style={style.link}>
            <IconButton className="new-space" style={{ padding: '6px', marginBottom: '-6px' }} >
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
          </Link>
        </Toolbar>
        <Paper style={style.paper}>
          <Table className="space-list" >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Tooltip
                    title="Sort"
                    placement="bottom-start"
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={sortBy === 'space'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('space')}
                    >
                      Space
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip
                    title="Sort"
                    placement="bottom-start"
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={sortBy === 'app'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('app')}
                    >
                      Apps
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip
                    title="Sort"
                    placement="bottom-start"
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={sortBy === 'compliance'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('compliance')}
                    >
                      Compliance
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip
                    title="Sort"
                    placement="bottom-start"
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={sortBy === 'stack'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('stack')}
                    >
                      Stack
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderSpaces(page, rowsPerPage)}
            </TableBody>
            {spaces.length !== 0 && (
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[15, 25, 50]}
                    colSpan={4}
                    count={spaces.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </Paper>
      </div>
    );
  }
}
