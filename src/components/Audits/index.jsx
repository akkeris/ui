import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SHA256 from 'crypto-js/sha256';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography,
  Dialog, DialogContent, DialogActions, DialogTitle,
} from '@material-ui/core';

import api from '../../services/api';

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
    };
  }

  componentDidMount() {
    api.getAudits(this.props.app.simple_name, this.props.app.space.name).then((response) => {
      this.setState({
        audits: response.data,
        loading: false,
      });
      console.log(response.data);
    });
  }

  getAudits() {
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
    return audits.map((audit) => {
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

  getAuditInfo() {
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

  handleRowSelection = (id) => {
    this.setState({
      id,
      diagOpen: true,
    });
  }

  handleDialogClose = () => {
    this.setState({
      diagOpen: false,
      // id: '',
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <Table className="audit-list" >
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
              {this.getAudits()}
            </TableBody>
          </Table>
          <Dialog
            className="audit-dialog"
            open={this.state.diagOpen}
            // Clear id on exited to avoid race between
            // closing dialog and clearing displayed audit info
            onExited={() => { this.setState({ id: '' }); }}
            maxWidth="lg"
          >
            <DialogTitle>Audit Info</DialogTitle>
            <DialogContent>
              <Table className="audit-info">
                <TableBody>
                  {this.getAuditInfo()}
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
      </MuiThemeProvider>
    );
  }
}

Audits.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
