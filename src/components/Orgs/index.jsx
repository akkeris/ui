import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableRow, TableCell, TableFooter, TablePagination,
} from '@material-ui/core';

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
  },
};

export default class OrgList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      page: 0,
      rowsPerPage: 15,
    };
  }

  getOrgs(page, rowsPerPage) {
    return this.props.orgs
      .slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(org => (
        <TableRow className={org.name} key={org.id} style={style.tableRow} hover>
          <TableCell>
            <div style={style.tableRowColumn.title}>{org.name}</div>
            <div style={style.tableRowColumn.sub}>{org.role}</div>
          </TableCell>
        </TableRow>
      ));
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { orgs } = this.props;
    const { page, rowsPerPage } = this.state;
    return (
      <div>
        <Table className="org-list">
          <TableBody>
            {this.getOrgs(page, rowsPerPage)}
          </TableBody>
          {orgs.length !== 0 && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[15, 25, 50]}
                  colSpan={3}
                  count={orgs.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    );
  }
}

OrgList.propTypes = {
  orgs: PropTypes.arrayOf(PropTypes.object).isRequired,
};
