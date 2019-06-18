import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SHA256 from 'crypto-js/sha256';
import {
  CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography,
  Dialog, DialogContent, DialogActions, DialogTitle, TableFooter, TablePagination,
} from '@material-ui/core';

import api from '../../services/api';

const style = {
  tableRow: {
    height: '36px',
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
  noResults: {
    marginTop: '15px',
    marginBottom: '15px',
  },
};

function sillyfunc(prefix, input) {
  if (!input) {
    return null;
  }
  return Object.keys(input).map((key) => {
    if (typeof input[key] === 'object') {
      return sillyfunc(prefix ? `${prefix}.${key}` : key, input[key]);
    }
    return (
      <TableRow key={key}>
        <TableCell>
          <span>{prefix ? `${prefix}.${key}` : key}</span>
        </TableCell>
        <TableCell>
          <span>{input[key]}</span>
        </TableCell>
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
      page: 0,
      rowsPerPage: 10,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.getAudits();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getAudits = async () => {
    const { app } = this.props;
    const { data: audits } = await api.getAudits(app.simple_name, app.space.name, 100);
    if (this._isMounted) {
      this.setState({ audits, loading: false });
    }
  }

  handleRowSelection = (id) => {
    this.setState({
      id,
      diagOpen: true,
    });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleDialogClose = () => {
    this.setState({
      diagOpen: false,
      // id: '',
    });
  }

  renderAudits(page, rowsPerPage) {
    const { audits } = this.state;
    if (audits.length === 0) {
      return (
        <TableRow >
          <TableCell />
          <TableCell>
            <Typography variant="body1" style={style.noResults}>No Recent Activity</Typography>
          </TableCell>
          <TableCell />
        </TableRow>
      );
    }

    return audits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((audit) => { // eslint-disable-line
      const id = SHA256(JSON.stringify(audit)).toString().substring(0, 7);
      return (
        <TableRow
          className={id}
          key={id}
          style={style.tableRow}
          onClick={() => this.handleRowSelection(id)}
          hover
        >
          <TableCell style={style.tableRow}>
            <div style={style.tableRowColumn.main}>{audit.action}</div>
            <div style={style.tableRowColumn.sub}>{id}</div>
          </TableCell>
          <TableCell>
            <div>{audit.username}</div>
          </TableCell>
          <TableCell>
            <div>{new Date(audit.received_at).toLocaleString()}</div>
          </TableCell>
        </TableRow>
      );
    });
  }

  renderAuditInfo() {
    return (
      this.state.audits.map((audit) => {
        const id = SHA256(JSON.stringify(audit)).toString().substring(0, 7);
        if (id === this.state.id) {
          return sillyfunc('', JSON.parse(audit.info));
        }
        return null;
      })
    );
  }

  render() {
    const { rowsPerPage, page } = this.state;
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div>
        <Table className="audit-list">
          <colgroup>
            <col style={{ width: '33%' }} />
            <col style={{ width: '33%' }} />
            <col style={{ width: '33%' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell>
                <span>Change</span>
              </TableCell>
              <TableCell>
                <span>User</span>
              </TableCell>
              <TableCell >
                <span>Time</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderAudits(page, rowsPerPage)}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                colSpan={3}
                count={this.state.audits.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
        <Dialog
          className="audit-dialog"
          open={this.state.diagOpen}
          // Clear id on exited to avoid race between
          // closing dialog and clearing displayed audit info
          onExited={() => { this.setState({ id: '' }); }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Audit Info</DialogTitle>
          <DialogContent>
            <Table className="audit-info">
              <TableBody>
                {this.renderAuditInfo()}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button
              className="ok"
              color="primary"
              onClick={this.handleDialogClose}
            >Ok</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

Audits.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
