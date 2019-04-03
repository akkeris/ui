import React, { Component } from 'react';
import {
  Table, TableBody, TableRow, TableCell, TableFooter, TablePagination, CircularProgress,
} from '@material-ui/core';
import api from '../../services/api';

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      paddingTop: '50px',
      paddingBottom: '50px',
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
  },
};

export default class OrgList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      orgs: [],
      page: 0,
      rowsPerPage: 15,
    };
  }

  componentDidMount() {
    this.getOrgs();
  }

  getOrgs = async () => {
    const { data: orgs } = await api.getOrgs();
    this.setState({ orgs, loading: false });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  renderOrgs(page, rowsPerPage) {
    return this.state.orgs
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

  render() {
    const { page, rowsPerPage, loading, orgs } = this.state;
    if (loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} color="primary" status="loading" />
        </div>
      );
    }
    return (
      <div>
        <Table className="org-list">
          <TableBody>
            {this.renderOrgs(page, rowsPerPage)}
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
