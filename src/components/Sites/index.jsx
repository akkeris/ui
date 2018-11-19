import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableHead, TableRow, TableCell,
} from '@material-ui/core';


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
  getSites() {
    return this.props.sites.map((site) => {
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

  handleRowSelection = (id) => {
    window.location = `#/sites/${id}/info`;
  }

  render() {
    return (
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
            {this.getSites()}
          </TableBody>
        </Table>
      </div>
    );
  }
}

SitesList.propTypes = {
  sites: PropTypes.arrayOf(PropTypes.object).isRequired,
};
