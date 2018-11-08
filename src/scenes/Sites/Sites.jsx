import React, { Component } from 'react';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import { Link } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Paper from 'material-ui/Paper';
import AddIcon from 'material-ui/svg-icons/content/add';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import api from '../../services/api';
import SitesList from '../../components/Sites';
import util from '../../services/util';
import Search from '../../components/Search';

/* eslint-disable jsx-a11y/anchor-is-valid */

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  filter: {
    paddingLeft: '0px',
  },
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
  font: {
    color: 'white',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
  menu: {
    height: '48px',
    lineHeight: '48px',
    color: 'white',
  },
  icon: {
    top: '0px',
  },
  search: {
    color: 'white',
    WebkitTextFillColor: 'white',
  },
  searchHint: {
    color: 'rgba(255,255,255,0.3)',
  },
};

class Sites extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      sites: [],
      filteredSites: [],
      regions: [],
      region: 'all',
      loading: true,
    };
  }

  componentDidMount() {
    api.getSites().then((response) => {
      this.setState({
        sites: response.data.sort((a, b) => a.domain > b.domain),
        filteredSites: response.data.sort((a, b) => a.domain > b.domain),
        loading: false,
      });
    });
    api.getRegions().then((response) => {
      this.setState({
        regions: response.data,
      });
    });
  }

  getRegions() {
    return this.state.regions.map(region => (
      <MenuItem className={region.name} key={region.id} value={region.name} label={`Region: ${region.name}`} primaryText={region.name} />
    ));
  }

  handleSearch = (searchText) => {
    window.location = `#/sites/${searchText}/info`;
  }

  handleRegionChange = (event, index, value) => {
    const region = value;
    const sites = util.filterSites(this.state.sites, region);
    this.setState({
      region,
      filteredSites: sites,
    });
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
            <ToolbarGroup>
              <Search
                style={style.search}
                hintStyle={style.searchHint}
                className="search"
                data={util.filterDomain(this.state.filteredSites)}
                handleSearch={this.handleSearch}
              />
              <DropDownMenu
                className="region-dropdown"
                style={style.filter}
                labelStyle={style.menu}
                iconStyle={style.icon}
                value={this.state.region}
                onChange={this.handleRegionChange}
              >
                <MenuItem className="all" value="all" label="Filter by Region" primaryText="all" />
                {this.getRegions()}
              </DropDownMenu>
            </ToolbarGroup>
            <ToolbarGroup>
              <Link to="/sites/new" style={style.link}>
                <IconButton className="new-site" iconStyle={style.font}><AddIcon /></IconButton>
              </Link>
            </ToolbarGroup>
          </Toolbar>
          <Paper style={style.paper}>
            <SitesList sites={this.state.filteredSites} />
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Sites;
