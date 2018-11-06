import React, { Component } from 'react';
import {
  Toolbar, Table, TableBody, TableHead, TableRow, TableCell, IconButton, CircularProgress, Paper,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import { Link } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
/* eslint-disable jsx-a11y/anchor-is-valid */
import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiToolbar: {
      root: {
        minHeight: '48px !important',
        maxHeight: '48px !important',
      },
    },
    MuiIconButton: {
      root: { color: 'white', padding: '6px', marginBottom: '-6px' },
    },
  },
});

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  toolbar: {
    backgroundColor: 'rgba(0,0,0,0)',
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  link: {
    textDecoration: 'none',
    marginLeft: 'auto',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    marginBottom: '12px',
  },
  tableRow: {
    height: '58px',
  },
  tableCell: {
    title: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
    end: {
      float: 'right',
    },
    icon: {
      width: '58px',
    },
  },
};

export default class Spaces extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      spaces: [],
    };
  }

  componentDidMount() {
    api.getSpaces().then((response) => {
      this.setState({
        spaces: response.data,
        loading: false,
      });
    });
  }

  getSpaces() {
    return this.state.spaces.map(space => (
      <TableRow hover className={space.name} key={space.id} style={style.tableRow}>
        <TableCell>
          <div style={style.tableCell.title}>{space.name}</div>
          <div style={style.tableCell.sub}>{space.id}</div>
        </TableCell>
        <TableCell style={style.tableCell.icon}>
          <div style={style.tableCell.title}>{space.apps}</div>
        </TableCell>
        <TableCell>
          <div style={style.tableCell.title}>{space.compliance.toString()}</div>
        </TableCell>
        <TableCell>
          <div style={style.tableCell.title}>{space.stack.name}</div>
        </TableCell>
      </TableRow>
    ));
  }
  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <Toolbar style={style.toolbar} disableGutters>
            <Link to="/spaces/new" style={style.link}>
              <IconButton className="new-space"><AddIcon /></IconButton>
            </Link>
          </Toolbar>
          <Paper style={style.paper}>
            <Table className="space-list" >
              <TableHead>
                <TableRow>
                  <TableCell>Space</TableCell>
                  <TableCell style={style.tableCell.icon}>Apps</TableCell>
                  <TableCell>Compliance</TableCell>
                  <TableCell>Stack</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.getSpaces()}
              </TableBody>
            </Table>
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}
