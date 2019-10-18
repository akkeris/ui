import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableRow, TableFooter, TableCell, TablePagination } from '@material-ui/core';
import History from '../../config/History';

const style = {
  tableRow: {
    height: '36px',
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

export default class FavoritesList extends Component {
  static previewAnnotation() {
    return (
      <span style={style.preview}>Preview</span>
    );
  }

  state = {
    page: 0,
    rowsPerPage: 15,
  }

  getApps(page, rowsPerPage) {
    if (!this.props.favorites || this.props.favorites.length === 0) {
      return (
        <TableRow>
          <TableCell>
            No Results
          </TableCell>
        </TableRow>
      );
    }
    return this.props.favorites.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(app => (
      <TableRow
        className={app.name}
        key={app.id}
        style={style.tableRow}
        hover
        onClick={() => this.handleRowSelection(app)}
      >
        <TableCell style={style.tableRow}>
          <div style={style.tableRowColumn.main}>{app.name}</div>
        </TableCell>
      </TableRow>
    ));
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


  render() {
    const { rowsPerPage, page } = this.state;
    return (
      <Table className="favorites-list">
        <TableBody>
          {this.getApps(page, rowsPerPage)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[15, 25, 50]}
              colSpan={3}
              count={this.props.favorites.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    );
  }
}

FavoritesList.propTypes = {
  favorites: PropTypes.arrayOf(PropTypes.object).isRequired,
};

FavoritesList.defaultProps = {
  favorites: null,
};
