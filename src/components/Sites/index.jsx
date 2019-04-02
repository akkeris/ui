import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableHead, TableRow, TableCell, TableFooter, TablePagination,
  Tooltip, TableSortLabel,
} from '@material-ui/core';
import History from '../../config/History';

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
      sortBy: 'site',
      sortDirection: 'asc',
    };
  }

  handleRowSelection = (id) => {
    History.get().push(`/sites/${id}/info`);
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

  renderSites(page, rowsPerPage) {
    return this.props.sites
      .slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
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
    const { page, rowsPerPage, sortBy, sortDirection } = this.state;
    return (
      <div>
        <Table className="site-list">
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '40%' }} />
            <col style={{ width: '20%' }} />
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
                    active={sortBy === 'site'}
                    direction={sortDirection}
                    onClick={this.handleSortChange('site')}
                  >
                    Site
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
                    active={sortBy === 'updated'}
                    direction={sortDirection}
                    onClick={this.handleSortChange('updated')}
                  >
                    Updated
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
                    active={sortBy === 'region'}
                    direction={sortDirection}
                    onClick={this.handleSortChange('region')}
                  >
                    Region
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
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
    );
  }
}

SitesList.propTypes = {
  sites: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSortChange: PropTypes.func.isRequired,
};
