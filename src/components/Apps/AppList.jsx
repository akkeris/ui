import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Table, TableBody, TableRow, TableFooter, TableCell, TablePagination } from '@material-ui/core';

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
    rowsPerPage: 20,
  }

  getApps(page, rowsPerPage) {
    return this.props.apps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(app => (
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
      </TableRow>
    ));
  }

  handleRowSelection = (app) => {
    window.location = `#/apps/${app.name}/info`;
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
      <MuiThemeProvider theme={muiTheme}>
        <div style={{ marginBottom: '12px' }}>
          <Table className="app-list">
            <TableBody>
              {this.getApps(page, rowsPerPage)}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 30]}
                  colSpan={3}
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
      </MuiThemeProvider>
    );
  }
}

AppList.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
};
