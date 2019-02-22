import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableHead, TableRow, TableCell, TableFooter, TablePagination,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
});

const style = {
  tableRow: {
    height: '58px',
    cursor: 'pointer',
  },
  tableCell: {
    title: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
  },
};

export default class SitesList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      page: 0,
      rowsPerPage: 15,
    };
  }

  handleRowSelection = (id) => {
    window.location = `/sites/${id}/info`;
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  renderSites(page, rowsPerPage) {
    return this.props.sites
      .slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
      .sort((a, b) => a.domain.localeCompare(b.domain))
      .map((site) => {
        const date = new Date(site.updated_at);
        return (
          <TableRow
            className={site.domain}
            key={site.id}
            style={style.tableRow}
            hover
            onClick={() => this.handleRowSelection(site.id)}
          >
            <TableCell>
              <div style={style.tableCell.title}>{site.domain}</div>
              <div style={style.tableCell.sub}>{site.id}</div>
            </TableCell>
            <TableCell>
              <div>{date.toLocaleString()}</div>
            </TableCell>
            <TableCell>
              <div style={style.tableCell.title}>{site.region.name}</div>
            </TableCell>
          </TableRow>
        );
      });
  }

  render() {
    const { sites } = this.props;
    const { page, rowsPerPage } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <Table className="site-list">
            <TableHead>
              <TableRow>
                <TableCell>Site</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Region</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderSites(page, rowsPerPage)}
            </TableBody>
            {sites.length !== 0 && (
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[15, 25, 50]}
                    colSpan={3}
                    count={sites.length}
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
      </MuiThemeProvider>
    );
  }
}

SitesList.propTypes = {
  sites: PropTypes.arrayOf(PropTypes.object).isRequired,
};
