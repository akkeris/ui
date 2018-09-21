import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Table, TableBody, TableRow, TableRowColumn, TableHeader, TableHeaderColumn } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';

import GitIcon from './Icons/GitIcon';

const muiTheme = getMuiTheme({
  fontFamily: 'ProximaNova',
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
    },
    row: {
      textAlign: 'center',
    },
  },
};

const Footer = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <Paper style={style.footer}>
      <div style={style.div}>
        <Table style={style.table.body} selectable={false}>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
            <TableRow displayBorder={false}>
              <TableHeaderColumn style={style.table.row}>
                Documentation
              </TableHeaderColumn >
              <TableHeaderColumn style={style.table.row}>
                Contribution
              </TableHeaderColumn>
              <TableHeaderColumn style={style.table.row}>
                Support
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            <TableRow displayBorder={false}>
              <TableRowColumn style={style.table.row}>
                <div style={style.link}>
                    Wiki
                </div>
                <div style={style.link}>
                    Getting Started
                </div>
              </TableRowColumn>
              <TableRowColumn style={style.table.row}>
                <div style={style.link}>
                    API
                </div>
                <div style={style.link}>
                    Releases
                </div>
              </TableRowColumn>
              <TableRowColumn style={style.table.row}>
                <div style={style.link}>
                    Akkeris
                </div>
                <div>
                  <a href="https://kubernetes.io" style={style.link}>
                    Kubernetes
                  </a>
                </div>
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
        <p style={style.paragraph}>
          Akkeris is built with a little bit of love, and a lot of anger. <br />
          Brought to you by COBRA and our open source community.
        </p>
        <IconButton href="https://github.com/akkeris" ><GitIcon nativeColor="rgba(255,255,255,0.8)" /></IconButton>
      </div>
    </Paper>
  </MuiThemeProvider>
);

export default Footer;
