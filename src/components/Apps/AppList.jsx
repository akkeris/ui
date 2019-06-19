import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableRow, TableFooter, TableCell, TablePagination, TableHead,
  TableSortLabel, Tooltip,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import History from '../../config/History';

const style = {
  tableRow: {
    cursor: 'pointer',
  },
  tableRowColumn: {
    main: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
  },
  preview: {
    backgroundColor: 'red',
    color: 'white',
    padding: '0.25em 0.5em',
    marginLeft: '0.5em',
    marginTop: '-0.25em',
    fontSize: '0.55rem',
    borderRadius: '2px',
  },
};

export default class AppList extends Component {
  static previewAnnotation() {
    return (
      <span style={style.preview}>Preview</span>
    );
  }

  state = {
    page: 0,
    rowsPerPage: 15,
    sortBy: 'apps',
    sortDirection: 'asc',
  }

  handleRowSelection = (app) => {
    History.get().push(`/apps/${app.name}/info`);
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleSortChange = column => () => {
    const sortBy = column;
    let sortDirection = 'desc';
    if (this.state.sortBy === column && this.state.sortDirection === 'desc') {
      sortDirection = 'asc';
    }
    this.setState({ sortBy, sortDirection, page: 0 });
    this.props.onSortChange(sortBy, sortDirection);
  }

  renderApps(page, rowsPerPage) {
    if (this.props.apps.length === 0) {
      return (
        <TableRow>
          <TableCell colspan={4}>
            No Results
          </TableCell>
        </TableRow>
      );
    }
    return this.props.apps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(app => ( // eslint-disable-line
      <TableRow
        className={app.name}
        key={app.id}
        style={style.tableRow}
        hover
        onClick={() => this.handleRowSelection(app)}
      >
        <TableCell style={style.tableRow}>
          <div style={style.tableRowColumn.main}>{app.name} {app.preview ? AppList.previewAnnotation(app.preview) : ''}</div>
          <div style={style.tableRowColumn.sub}>{app.organization.name.replace(/-/g, ' ')}</div>
        </TableCell>
        <TableCell style={style.tableRow}>
          <div style={style.tableRowColumn.main}>{app.space.name}</div>
        </TableCell>
        <TableCell style={style.tableRow}>
          <div style={style.tableRowColumn.main}>{app.region.name}</div>
        </TableCell>
        <TableCell style={style.tableRow}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {app.isFavorite && <FavoriteIcon />}
          </div>
        </TableCell>
      </TableRow>
    ));
  }

  render() {
    const { rowsPerPage, page, sortBy, sortDirection } = this.state;
    return (
      <div style={{ marginBottom: '12px', overflow: 'auto' }}>
        <Table className="app-list">
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell>
                <Tooltip
                  title="Sort"
                  placement="bottom-start"
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={sortBy === 'apps'}
                    direction={sortDirection}
                    onClick={this.handleSortChange('apps')}
                  >
                    App
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
                    active={sortBy === 'spaces'}
                    direction={sortDirection}
                    onClick={this.handleSortChange('spaces')}
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
                    active={sortBy === 'regions'}
                    direction={sortDirection}
                    onClick={this.handleSortChange('regions')}
                  >
                    Region
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
                    active={sortBy === 'favorites'}
                    direction={sortDirection}
                    onClick={this.handleSortChange('favorites')}
                  >
                    Favorite
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderApps(page, rowsPerPage)}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[15, 25, 50]}
                colSpan={4}
                count={this.props.apps.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }
}

AppList.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSortChange: PropTypes.func.isRequired,
};
