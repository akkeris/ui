import React, { Component } from 'react';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Link } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Paper from 'material-ui/Paper';
import AddIcon from 'material-ui/svg-icons/content/add';
/* eslint-disable jsx-a11y/anchor-is-valid */
import api from '../../services/api';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
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
    padding: '16px 0',
  },
  link: {
    textDecoration: 'none',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
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
    end: {
      float: 'right',
    },
    icon: {
      width: '58px',
    },
  },
  icon: {
    color: 'white',
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
      <TableRow className={space.name} key={space.id} style={style.tableRow} selectable={false}>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{space.name}</div>
          <div style={style.tableRowColumn.sub}>{space.id}</div>
        </TableRowColumn>
        <TableRowColumn style={style.tableRowColumn.icon}>
          <div style={style.tableRowColumn.title}>{space.apps}</div>
        </TableRowColumn>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{space.compliance.toString()}</div>
        </TableRowColumn>
        <TableRowColumn>
          <div style={style.tableRowColumn.title}>{space.stack.name}</div>
        </TableRowColumn>
      </TableRow>
    ));
  }
  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Toolbar style={style.toolbar}>
            <ToolbarGroup />
            <ToolbarGroup>
              <Link to="/spaces/new" style={style.link}>
                <IconButton className="new-space" iconStyle={style.icon} ><AddIcon /></IconButton>
              </Link>
            </ToolbarGroup>
          </Toolbar>
          <Paper style={style.paper}>
            <Table className="space-list" >
              <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
                <TableRow>
                  <TableHeaderColumn>Space</TableHeaderColumn>
                  <TableHeaderColumn style={style.tableRowColumn.icon}>Apps</TableHeaderColumn>
                  <TableHeaderColumn>Compliance</TableHeaderColumn>
                  <TableHeaderColumn>Stack</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
                {this.getSpaces()}
              </TableBody>
            </Table>
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}
