import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Table, TableBody, TableRow, TableRowColumn, TableHeader, TableHeaderColumn } from 'material-ui/Table';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import SHA256 from 'crypto-js/sha256';

import api from '../../services/api';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  tableRow: {
    height: '58px',
    cursor: 'pointer',
  },
  tableRowColumn: {
    end: {
      float: 'right',
    },
    icon: {
      width: '58px',
    },
    main: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '350px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
};

function sillyfunc(prefix, input) {
  return Object.keys(input).map((key) => {
    if (typeof input[key] === 'object') {
      return sillyfunc(prefix ? `${prefix}.${key}` : key, input[key]);
    }
    return (
      <TableRow>
        <TableRowColumn>
          {prefix ? `${prefix}.${key}` : key}
        </TableRowColumn>
        <TableRowColumn>
          {input[key]}
        </TableRowColumn>
      </TableRow>
    );
  });
}

export default class Audits extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      audits: [],
      loading: true,
      id: '',
      diagOpen: false,
    };
  }

  componentDidMount() {
    api.getAudits(this.props.app.simple_name, this.props.app.space.name).then((response) => {
      this.setState({
        audits: response.data,
        loading: false,
      });
    });
  }

  getAudits() {
    return this.state.audits.map((audit) => {
      const id = SHA256(JSON.stringify(audit)).toString().substring(0, 7);

      return (
        <TableRow
          className={id}
          key={id}
          style={style.tableRow}
          onTouchTap={() => this.handleRowSelection(id)}
          selectable={false}
        >
          <TableRowColumn style={style.tableRow}>
            <div style={style.tableRowColumn.main}>{audit.action}</div>
            <div style={style.tableRowColumn.sub}>{id}</div>
          </TableRowColumn>
          <TableRowColumn>
            <div>{audit.username}</div>
          </TableRowColumn>
          <TableRowColumn>
            <div>{Date(audit.received_at).toLocaleString()}</div>
          </TableRowColumn>
        </TableRow>
      );
    });
  }

  getAuditInfo() {
    return (
      this.state.audits.map((audit) => {
        const id = SHA256(JSON.stringify(audit)).toString().substring(0, 7);
        if (id === this.state.id) {
          return sillyfunc('', JSON.parse(audit.info));
        }
      })
    );
  }

  handleRowSelection = (id) => {
    this.setState({
      id,
      diagOpen: true,
    });
  }

  handleDialogClose = () => {
    this.setState({
      diagOpen: false,
      id: '',
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Table className="audit-list" wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
              <TableRow>
                <TableHeaderColumn>Change</TableHeaderColumn>
                <TableHeaderColumn>User</TableHeaderColumn>
                <TableHeaderColumn>Time</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
              {this.getAudits()}
            </TableBody>
          </Table>
          <Dialog
            className="audit-dialog"
            open={this.state.diagOpen}
            autoScrollBodyContent
            title="Audit Info"
            actions={
              <FlatButton
                className="ok"
                label="Ok"
                primary
                onTouchTap={this.handleDialogClose}
              />}
          >
            <Table className="audit-info">
              <TableBody displayRowCheckbox={false} showRowHover={false} selectable={false}>
                {this.getAuditInfo()}
              </TableBody>
            </Table>
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

Audits.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
