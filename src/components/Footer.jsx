import React from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  Table, TableHead, TableBody, TableRow, TableCell, Paper, IconButton, Typography,
} from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import GitIcon from './Icons/GitIcon';

const muiTheme = createMuiTheme({
  palette: {
    primary: {       main: '#0097a7',     },
  },
  typography: {
    fontFamily: 'ProximaNova',
  },
});

const style = {
  footer: {
    width: '100%',
    minHeight: '240px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    backgroundColor: '#3c4146',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    margin: '0 auto',
    color: 'rgba(255,255,255,0.8)',
  },
  link: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
  },
  header: {
    color: 'rgb(158, 158, 158)',
    textDecoration: 'none',
  },
  div: {
    margin: '0 auto',
    width: '1024px',
  },
  table: {
    body: {
      backgroundColor: 'rgba(255,255,255,0)',
      marginBottom: '10px',
    },
    cell: {
      textAlign: 'center',
      width: '33%',
      borderBottom: 'none',
    },
    headerCell: {
      textAlign: 'center',
      color: 'rgb(158, 158, 158)',
      width: '33%',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
  },
};

const Footer = () => (
  <MuiThemeProvider theme={muiTheme}>
    <Paper style={style.footer}>
      <div style={style.div}>
        <Table style={style.table.body}>
          <TableHead>
            <TableRow>
              <TableCell style={style.table.headerCell} padding="none">
                Documentation
              </TableCell >
              <TableCell style={style.table.headerCell} padding="none">
                Contribution
              </TableCell>
              <TableCell style={style.table.headerCell} padding="none">
                Support
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell style={style.table.cell} padding="none">
                <div style={style.link}>
                    Wiki
                </div>
                <div style={style.link}>
                    Getting Started
                </div>
              </TableCell>
              <TableCell style={style.table.cell} padding="none">
                <div style={style.link}>
                    API
                </div>
                <div style={style.link}>
                    Releases
                </div>
              </TableCell>
              <TableCell style={style.table.cell} padding="none">
                <div style={style.link}>
                    Akkeris
                </div>
                <div>
                  <a href="https://kubernetes.io" style={style.link}>
                    Kubernetes
                  </a>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="body2" style={style.paragraph}>
          Akkeris is built with a little bit of love, and a lot of anger. <br />
          Brought to you by COBRA and our open source community.
        </Typography>
        <IconButton href="https://github.com/akkeris" ><GitIcon nativeColor="rgba(255,255,255,0.8)" /></IconButton>
      </div>
    </Paper>
  </MuiThemeProvider>
);

export default Footer;
