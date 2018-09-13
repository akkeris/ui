import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableRow, TableRowColumn, TableHeader, TableHeaderColumn } from 'material-ui/Table';

const style = {
  tableRow: {
    height: '58px',
    cursor: 'pointer',
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

export default class SitesList extends Component {
  getSites() {
    return this.props.sites.map((site) => {
      const date = new Date(site.updated_at);
      return (
        <TableRow className={site.domain} key={site.id} style={style.tableRow}>
          <TableRowColumn>
            <div style={style.tableRowColumn.title}>{site.domain}</div>
            <div style={style.tableRowColumn.sub}>{site.id}</div>
          </TableRowColumn>
          <TableRowColumn>
            <div>{date.toLocaleString()}</div>
          </TableRowColumn>
          <TableRowColumn>
            <div style={style.tableRowColumn.title}>{site.region.name}</div>
          </TableRowColumn>
        </TableRow>
      );
    });
  }

  handleRowSelection = (selectedRows) => {
    window.location = `#/sites/${this.props.sites[selectedRows].domain}/info`;
  }

  render() {
    return (
      <div>
        <Table className="site-list" onRowSelection={this.handleRowSelection} wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
            <TableRow>
              <TableHeaderColumn>Site</TableHeaderColumn>
              <TableHeaderColumn>Updated</TableHeaderColumn>
              <TableHeaderColumn>Region</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false} showRowHover>
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
