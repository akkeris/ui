import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';

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

  getApps() {
    return this.props.apps.map(app => (
      <TableRow className={app.name} key={app.id} style={style.tableRow}>
        <TableRowColumn style={style.tableRow}>
          <div style={style.tableRowColumn.main}>{app.name} {app.preview ? AppList.previewAnnotation(app.preview) : ''}</div>
          <div style={style.tableRowColumn.sub}>{app.organization.name.replace(/-/g, ' ')}</div>
        </TableRowColumn>
      </TableRow>
    ));
  }

  handleRowSelection = (selectedRows) => {
    window.location = `#/apps/${this.props.apps[selectedRows].name}`;
  }

  render() {
    return (
      <div style={{ marginBottom: '12px' }}>
        <Table className="app-list" onRowSelection={this.handleRowSelection} wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
          <TableBody displayRowCheckbox={false} showRowHover>
            {this.getApps()}
          </TableBody>
        </Table>
      </div>
    );
  }
}

AppList.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
};
