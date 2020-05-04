import React from 'react';
import deepmerge from 'deepmerge';
import { MuiThemeProvider } from '@material-ui/core/styles';
import {
  Table, TableHead, TableBody, TableRow, TableCell, Paper, IconButton, Typography,
} from '@material-ui/core';
import GitIcon from './Icons/GitIcon';

/* Documentation Links */
const akkerisLink = 'https://beta.akkeris.io';
const githubLink = 'https://github.com/akkeris';

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
    MuiTableCell: {
      root: {
        fontFamily: 'ProximaNova',
        padding: '14px 0px 14px 0px',
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
    zIndex: 100,
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
      borderBottom: 'none',
    },
    headerCell: {
      textAlign: 'center',
      color: 'rgb(158, 158, 158)',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
  },
};

const Footer = () => (
  <MuiThemeProvider theme={theme}>
    <Paper style={style.footer}>
      <div style={style.div}>
        <Table style={style.table.body}>
          <colgroup>
            <col style={{ width: 'calc(100%  /2)' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell style={style.table.headerCell}>
                Resources
              </TableCell >
              <TableCell style={style.table.headerCell}>
                Contribution
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell style={style.table.cell}>
                {akkerisLink !== '' ? (
                  <div><a href={akkerisLink} style={style.link}>Akkeris</a></div>
                ) : (
                  <div style={style.link}>Akkeris</div>
                )}
              </TableCell>
              <TableCell style={style.table.cell}>
                {githubLink !== '' ? (
                  <div><a href={githubLink} style={style.link}>Github</a></div>
                ) : (
                  <div style={style.link}>Github</div>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="body2" style={style.paragraph}>
          Akkeris is built with a little bit of love, and a lot of anger. <br />
          Brought to you by COBRA and our open source community.
        </Typography>
        <IconButton href="https://github.com/akkeris" ><GitIcon htmlColor="rgba(255,255,255,0.8)" /></IconButton>
      </div>
    </Paper>
  </MuiThemeProvider>
);

export default Footer;
