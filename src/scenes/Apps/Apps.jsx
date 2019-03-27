import React, { Component } from 'react';
import {
  Toolbar, IconButton, MenuItem, CircularProgress, Paper,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import api from '../../services/api';
import AppList from '../../components/Apps/AppList';
import util from '../../services/util';
import History from '../../config/History';
import CustomSelect from '../../components/CustomSelect';

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
        <div className="loading" style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div>
        <Toolbar style={style.toolbar} disableGutters>
          <CustomSelect
            name="region"
            value={this.state.region}
            onChange={this.handleRegionChange}
            label="Filter by Region"
            style={style.regionContainer}
          >
            <MenuItem className="all" value="all">All</MenuItem>
            {this.renderRegions()}
          </CustomSelect>
          <CustomSelect
            name="space"
            value={this.state.space}
            onChange={this.handleSpaceChange}
            label="Filter by Space"
            style={style.spaceContainer}
          >
            <MenuItem className="all" value="all">All</MenuItem>
            {this.renderSpaces()}
          </CustomSelect>
          <IconButton style={{ marginLeft: 'auto', padding: '6px', marginBottom: '-6px' }} onClick={() => History.get().push('/apps/new')} className="new-app">
            <AddIcon style={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
        <Paper style={style.paper}>
          <AppList className="apps" apps={this.state.filteredApps} favorites={this.state.favorites} />
        </Paper>
      </div>
    );
  }
}
