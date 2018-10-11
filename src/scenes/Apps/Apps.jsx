import React, { Component } from 'react';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import { Link } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Paper from 'material-ui/Paper';
import AddIcon from 'material-ui/svg-icons/content/add';

import api from '../../services/api';
import AppList from '../../components/Apps/AppList';
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

export default class Apps extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      space: 'all',
      region: 'all',
      apps: [],
      filteredApps: [],
      filteredSpaces: [],
      spaces: [],
      regions: [],
      loading: true,
    };
  }

  componentDidMount() {
    api.getSpaces().then((response) => {
      this.setState({
        spaces: response.data,
        filteredSpaces: response.data,
      });
    });
    api.getRegions().then((response) => {
      this.setState({
        regions: response.data,
      });
    });
    this.getApps();
  }

  getApps() {
    api.getApps().then((response) => {
      this.setState({
        apps: response.data,
        filteredApps: response.data,
        loading: false,
      });
    });
  }

  getSpaces() {
    return this.state.filteredSpaces.map(space => (
      <MenuItem className={space.name} key={space.id} value={space.name} label={`Space: ${space.name}`} primaryText={space.name} />
    ));
  }

  getRegions() {
    return this.state.regions.map(region => (
      <MenuItem className={region.name} key={region.id} value={region.name} label={`Region: ${region.name}`} primaryText={region.name} />
    ));
  }

  handleSearch = (searchText) => {
    window.location = `#/apps/${searchText}/info`;
  }

  handleSpaceChange = (event, index, value) => {
    const space = value;
    const apps = util.filterApps(this.state.apps, space);
    this.setState({
      space,
      filteredApps: apps,
    });
  }

  handleRegionChange = (event, index, value) => {
    const region = value;
    const apps = util.filterAppsByRegion(this.state.apps, region);
    const spaces = util.filterSpacesByRegion(this.state.spaces, region);

    this.setState({
      space: 'all',
      region: value,
      filteredApps: apps,
      filteredSpaces: spaces,
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div className="loading" style={style.refresh.div}>
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
                inputStyle={style.search}
                hintStyle={style.searchHint}
                data={util.filterName(this.state.filteredApps)}
                handleSearch={this.handleSearch}
                className="search"
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
              <DropDownMenu
                className="space-dropdown"
                style={style.filter}
                labelStyle={style.menu}
                iconStyle={style.icon}
                value={this.state.space}
                onChange={this.handleSpaceChange}
              >
                <MenuItem className="all" value="all" label="Filter by Space" primaryText="all" />
                {this.getSpaces()}
              </DropDownMenu>
            </ToolbarGroup>
            <ToolbarGroup>
              <Link to="/apps/new" style={style.link}>
                <IconButton className="new-app" iconStyle={style.font}><AddIcon /></IconButton>
              </Link>
            </ToolbarGroup>
          </Toolbar>
          <Paper style={style.paper}>
            <AppList className="apps" apps={this.state.filteredApps} />
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}
