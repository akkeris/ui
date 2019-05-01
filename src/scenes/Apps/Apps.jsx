import React, { Component } from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import api from '../../services/api';
import AppList from '../../components/Apps/AppList';
import History from '../../config/History';
import FilterSelect from '../../components/FilterSelect';

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
    padding: '16px 0 0',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: 'unset !important',
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
      options: [],
      filters: [],
      sort: 'apps-asc',
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { data: spaces } = await api.getSpaces();
    const { data: regions } = await api.getRegions();
    let { data: apps } = await api.getApps();
    const { data: favorites } = await api.getFavorites();
    apps = apps.map(app => ({
      ...app,
      isFavorite: (favorites.findIndex(x => x.name === app.name) > -1),
    }));

    const options = [
      {
        label: 'Spaces',
        options: spaces.map(space => ({ label: space.name, value: space.name, type: 'space' })),
      },
      {
        label: 'Regions',
        options: regions.map(region => ({ label: region.name, value: region.name, type: 'region' })),
      },
    ];

    this.setState({
      spaces,
      filteredSpaces: spaces,
      regions,
      apps,
      filteredApps: apps,
      loading: false,
      options,
    }, () => {
      let values;
      try {
        values = JSON.parse(localStorage.getItem('akkeris_app_filters'));
      } catch (e) {
        values = [];
      }
      this.handleFilterChange(values);
    });
  }

  handleFilterChange = (values) => {
    if (!values || values.length === 0) {
      this.setState({ filteredApps: this.state.apps, filters: [] }, this.handleSort);
      localStorage.setItem('akkeris_app_filters', JSON.stringify(values));
      return;
    }

    const regionFilters = values.filter(({ type }) => type === 'region');
    const spaceFilters = values.filter(({ type }) => type === 'space');

    const filterLabel = (app, type) => ({ label }) => (
      label.toLowerCase().localeCompare(app[type === 'region' ? 'region' : 'space'].name.toLowerCase()) === 0
    );

    const filteredApps = this.state.apps.filter((app) => {
      if (regionFilters.length > 0 && !regionFilters.some(filterLabel(app, 'region'))) {
        return false;
      } else if (spaceFilters.length > 0 && !spaceFilters.some(filterLabel(app, 'space'))) {
        return false;
      }
      return true;
    });

    this.setState({ filteredApps, filters: values }, this.handleSort);

    localStorage.setItem('akkeris_app_filters', JSON.stringify(values));
  }

  handleSort = () => {
    const { filteredApps, sort } = this.state;

    let sortedApps = [];
    if (sort !== '') {
      sortedApps = filteredApps.sort((a, b) => {
        switch (sort) {
          case 'apps-asc':
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          case 'apps-desc':
            return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
          case 'spaces-asc':
            return a.space.name.toLowerCase().localeCompare(b.space.name.toLowerCase());
          case 'spaces-desc':
            return b.space.name.toLowerCase().localeCompare(a.space.name.toLowerCase());
          case 'regions-asc':
            return a.region.name.toLowerCase().localeCompare(b.region.name.toLowerCase());
          case 'regions-desc':
            return b.region.name.toLowerCase().localeCompare(a.region.name.toLowerCase());
          case 'favorites-asc':
            return a.isFavorite - b.isFavorite;
          case 'favorites-desc':
            return b.isFavorite - a.isFavorite;
          default:
            return 0;
        }
      });
    } else {
      sortedApps = filteredApps;
    }

    this.setState({ filteredApps: sortedApps });
  }

  handleSortChange = (column, direction) => this.setState({ sort: `${column}-${direction}` }, this.handleSort);

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
          <FilterSelect
            options={this.state.options}
            onSelect={this.handleFilterChange}
            filters={this.state.filters}
            placeholder="Filter by Region or Space"
          />
          <IconButton style={{ marginLeft: 'auto', padding: '6px' }} onClick={() => History.get().push('/apps/new')} className="new-app">
            <AddIcon style={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
        <Paper style={style.paper}>
          <AppList
            className="apps"
            apps={this.state.filteredApps}
            onSortChange={this.handleSortChange}
          />
        </Paper>
      </div>
    );
  }
}
