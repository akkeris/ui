import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableRow, TableFooter, TableCell, TablePagination, Typography } from '@material-ui/core';
import History from '../config/History';

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

export default class RecentsList extends Component {
  state = {
    page: 0,
    rowsPerPage: 15,
  }

  getRecents(page, rowsPerPage) {
    return this.props.recents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(recent => (
      <TableRow
        className={recent.item}
        key={recent.item}
        style={style.tableRow}
        hover
        onClick={() => this.handleRowSelection(recent)}
      >
        <TableCell style={style.tableRow}>
          <div style={style.tableRowColumn.main}>{recent.label}</div>
          <div style={style.tableRowColumn.sub}>{recent.type}</div>
        </TableCell>
      </TableRow>
    ));
  }

  handleRowSelection = (recent) => {
    History.get().push(`/${recent.type}/${recent.item}/info`);
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
      <Table className="recents-list">
        <TableBody>
          {this.getRecents(page, rowsPerPage)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[15, 25, 50]}
              colSpan={3}
              count={this.props.recents ? this.props.recents.length : 0}
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

RecentsList.propTypes = {
  recents: PropTypes.arrayOf(PropTypes.object),
};

RecentsList.defaultProps = {
  recents: null,
};
