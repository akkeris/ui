import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Paper from 'material-ui/Paper';
import { Link } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui/svg-icons/content/add';

import api from '../../services/api';
import util from '../../services/util';
import Search from '../../components/Search';
import OrgList from '../../components/Orgs';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

/* eslint-disable jsx-a11y/anchor-is-valid */

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
  icon: {
    color: 'white',
  },
  search: {
    color: 'white',
    WebkitTextFillColor: 'white',
  },
  searchHint: {
    color: 'rgba(255,255,255,0.3)',
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
    api.getOrgs().then((response) => {
      this.setState({
        orgs: response.data,
        loading: false,
      });
    });
  }

  handleSearch = (searchText) => {
    window.location = `#/orgs/${searchText}`;
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
          <Toolbar style={style.toolbar}>
            <ToolbarGroup>
              <Search
                style={style.search}
                hintStyle={style.searchHint}
                className="search"
                data={util.filterName(this.state.orgs)}
                handleSearch={this.handleSearch}
              />
            </ToolbarGroup>
            <ToolbarGroup>
              <Link to="/orgs/new" style={style.link}>
                <IconButton className="new-org" iconStyle={style.icon} ><AddIcon /></IconButton>
              </Link>
            </ToolbarGroup>
          </Toolbar>
          <Paper style={style.paper}>
            <OrgList className="orgs" orgs={this.state.orgs} />
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}
