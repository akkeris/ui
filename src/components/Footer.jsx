import React from 'react';
import deepmerge from 'deepmerge';
import { MuiThemeProvider } from '@material-ui/core/styles';
import {
  Table, TableHead, TableBody, TableRow, TableCell, Paper, IconButton, Typography,
} from '@material-ui/core';
import GitIcon from './Icons/GitIcon';

/* Documentation Links */
const wikiLink = 'https://docs.octanner.io/';
const gettingStartedLink = 'https://docs.octanner.io/Overview/01.-Installing-and-Getting-Started/';
const apiLink = 'https://docs.octanner.io/Apps%20API/API-Reference/';
const releasesLink = '';
const akkerisSupportLink = '';
const kubernetesSupportLink = 'https://kubernetes.io/';

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
    MuiTableCell: {
      root: {
        fontFamily: 'ProximaNova',
      },
    },
    MuiTypography: {
      body2: {
        fontFamily: 'ProximaNova',
      },
    },
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
    flexDirection: 'column',
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
  <MuiThemeProvider theme={theme}>
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
                {wikiLink !== '' ? (
                  <div><a href={wikiLink} style={style.link}>Wiki</a></div>
                ) : (
                  <div style={style.link}>Wiki</div>
                )}
                {gettingStartedLink !== '' ? (
                  <div><a href={gettingStartedLink} style={style.link}>Getting Started</a></div>
                ) : (
                  <div style={style.link}>Getting Started</div>
                )}
              </TableCell>
              <TableCell style={style.table.cell} padding="none">
                {apiLink !== '' ? (
                  <div><a href={apiLink} style={style.link}>API</a></div>
                ) : (
                  <div style={style.link}>API</div>
                )}
                {releasesLink !== '' ? (
                  <div><a href={releasesLink} style={style.link}>Releases</a></div>
                ) : (
                  <div style={style.link}>Releases</div>
                )}
              </TableCell>
              <TableCell style={style.table.cell} padding="none">
                {akkerisSupportLink !== '' ? (
                  <div><a href={akkerisSupportLink} style={style.link}>Akkeris</a></div>
                ) : (
                  <div style={style.link}>Akkeris</div>
                )}
                {kubernetesSupportLink !== '' ? (
                  <div><a href={kubernetesSupportLink} style={style.link}>Kubernetes</a></div>
                ) : (
                  <div style={style.link}>Kubernetes</div>
                )}
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
