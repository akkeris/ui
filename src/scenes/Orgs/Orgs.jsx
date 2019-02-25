import React, { Component } from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';

import api from '../../services/api';
import util from '../../services/util';
import Search from '../../components/Search';
import OrgList from '../../components/Orgs';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
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

/* eslint-disable jsx-a11y/anchor-is-valid */

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '15%',
      marginBottom: '5%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
      color: 'white',
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
};

export default class Orgs extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      orgs: [],
    };
  }

  componentDidMount() {
    this.getOrgs();
  }

  getOrgs = async () => {
    const { data: orgs } = await api.getOrgs();
    this.setState({ orgs, loading: false });
  }

  handleSearch = (searchText) => {
    window.location = `/orgs/${searchText}`;
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
          <Toolbar style={style.toolbar}>
            <Search
              className="search"
              data={util.filterName(this.state.orgs)}
              handleSearch={this.handleSearch}
            />
            <Link to="/orgs/new" style={style.link}>
              <IconButton className="new-org" ><AddIcon /></IconButton>
            </Link>
          </Toolbar>
          <Paper style={style.paper}>
            <OrgList className="orgs" orgs={this.state.orgs} />
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}
