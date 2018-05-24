import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';

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
  getOrgs() {
    return this.props.orgs.map(org => (
      <TableRow className={org.name} key={org.id} style={style.tableRow} selectable={false}>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{org.name}</div>
          <div style={style.tableRowColumn.sub}>{org.role}</div>
        </TableRowColumn>
      </TableRow>
    ));
  }
  render() {
    return (
      <div>
        <Table className="org-list" wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
          <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
            {this.getOrgs()}
          </TableBody>
        </Table>
      </div>
    );
  }
}

OrgList.propTypes = {
  orgs: PropTypes.arrayOf(PropTypes.object).isRequired,
};
