import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import { MuiThemeProvider } from '@material-ui/core/styles';
import {
  Toolbar, IconButton, Select, MenuItem,
  CircularProgress, Paper, FormControl, InputLabel,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import api from '../../services/api';
import AppList from '../../components/Apps/AppList';
import util from '../../services/util';
import Search from '../../components/Search';
import History from '../../config/History';

/* eslint-disable jsx-a11y/anchor-is-valid */

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
    MuiIconButton: {
      root: {
        color: 'white', padding: '6px', marginBottom: '-6px',
      },
    },
    MuiToolbar: {
      root: {
        minHeight: '48px !important',
        maxHeight: '48px !important',
      },
    },
    MuiInputLabel: {
      root: { color: 'white !important' },
      shrink: { color: 'white !important' },
      animated: { color: 'white !important' },
    },
    MuiSelect: {
      root: { color: 'white' },
      icon: { color: 'white' },
      select: { color: 'white !important' },
    },
    MuiInput: {
      input: {
        '&::placeholder': {
          color: 'white',
        },
        color: 'white',
      },
      underline: {
        // Border color when input is not selected
        '&:before': {
          borderBottom: '1px solid rgb(200, 200, 200)',
        },
        // Border color when input is selected
        '&:after': {
          borderBottom: '2px solid white',
        },
        // Border color on hover
        '&:hover:not([class^=".MuiInput-disabled-"]):not([class^=".MuiInput-focused-"]):not([class^=".MuiInput-error-"]):before': {
          borderBottom: '1px solid rgb(200, 200, 200)',
        },
      },
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
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  },
  spaceContainer: {
    marginLeft: '30px',
    minWidth: '145px',
  },
  regionContainer: {
    marginLeft: '30px',
    minWidth: '145px',
  },
};

export default class Apps extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      space: '',
      region: '',
      apps: [],
      favorites: [],
      filteredApps: [],
      filteredSpaces: [],
      spaces: [],
      regions: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { data: spaces } = await api.getSpaces();
    const { data: regions } = await api.getRegions();
    const { data: apps } = await api.getApps();
    const { data: favorites } = await api.getFavorites();
    this.setState({
      spaces,
      filteredSpaces: spaces,
      regions,
      apps,
      filteredApps: apps,
      favorites,
      loading: false,
    });
  }

  handleSearch = (searchText) => {
    History.get().push(`/apps/${searchText}/info`);
  }

  handleSpaceChange = (event) => {
    const space = event.target.value;
    const apps = util.filterApps(this.state.apps, space);
    this.setState({
      space,
      filteredApps: apps,
    });
  }

  handleRegionChange = (event) => {
    const region = event.target.value;
    const apps = util.filterAppsByRegion(this.state.apps, region);
    const spaces = util.filterSpacesByRegion(this.state.spaces, region);

    this.setState({
      space: '',
      region: event.target.value,
      filteredApps: apps,
      filteredSpaces: spaces,
    });
  }

  renderSpaces() {
    return this.state.filteredSpaces.map(space => (
      <MenuItem className={space.name} key={space.id} value={space.name}>{space.name}</MenuItem>
    ));
  }

  renderRegions() {
    return this.state.regions.map(region => (
      <MenuItem className={region.name} key={region.id} value={region.name}>{region.name}</MenuItem>
    ));
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={theme}>
          <div className="loading" style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Toolbar style={style.toolbar} disableGutters>
            <Search
              data={util.filterName(this.state.filteredApps)}
              handleSearch={this.handleSearch}
              className="search"
            />
            <FormControl style={style.regionContainer}>
              <InputLabel htmlFor="region-select">Filter by Region</InputLabel>
              <Select
                className="region-dropdown"
                value={this.state.region}
                onChange={this.handleRegionChange}
                inputProps={{
                  name: 'region',
                  id: 'region-select',
                }}
              >
                <MenuItem className="all" value="all">All</MenuItem>
                {this.renderRegions()}
              </Select>
            </FormControl>
            <FormControl style={style.spaceContainer}>
              <InputLabel htmlFor="space-select">Filter by Space</InputLabel>
              <Select
                className="space-dropdown"
                value={this.state.space}
                onChange={this.handleSpaceChange}
                inputProps={{
                  name: 'space',
                  id: 'space-select',
                }}
              >
                <MenuItem className="all" value="all">All</MenuItem>
                {this.renderSpaces()}
              </Select>
            </FormControl>
            <IconButton style={{ marginLeft: 'auto' }} onClick={() => History.get().push('/apps/new')} className="new-app">
              <AddIcon />
            </IconButton>
          </Toolbar>
          <Paper style={style.paper}>
            <AppList className="apps" apps={this.state.filteredApps} favorites={this.state.favorites} />
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}
