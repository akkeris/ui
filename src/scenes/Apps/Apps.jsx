import React, { Component } from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper, Tooltip,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
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
  spacer: {
    flex: '1 1 10%',
  },
  title: {
    flex: '0 0 auto',
    marginLeft: '-12px',
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
      isFilter: false,
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
      {
        label: 'Apps',
        options: apps.map(app => ({ label: app.name, value: app.name, type: 'app' })),
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
    const appFilters = values.filter(({ type }) => type === 'app');
    const partialFilters = values.filter(({ type }) => type === 'partial');

    const filterLabel = (app, type) => ({ label }) => (
      type === 'app' ? app.name.toLowerCase().includes(label.toLowerCase()) : label.toLowerCase().localeCompare(app[type === 'region' ? 'region' : 'space'].name.toLowerCase()) === 0
    );

    const filterPartial = app => ({ label }) => app.name.search(new RegExp(`.*${label}.*`, 'i')) !== -1;

    const filteredApps = this.state.apps.filter((app) => {
      if (regionFilters.length > 0 && !regionFilters.some(filterLabel(app, 'region'))) {
        return false;
      } else if (spaceFilters.length > 0 && !spaceFilters.some(filterLabel(app, 'space'))) {
        return false;
      } else if (appFilters.length > 0 && !appFilters.some(filterLabel(app, 'app'))) {
        return false;
      } else if (partialFilters.length > 0 && !partialFilters.some(filterPartial(app))) {
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

  handleFilter = () => {
    if (this.state.filters.length > 0) {
      this.setState({ isFilter: true });
    } else {
      this.setState({ isFilter: !this.state.isFilter });
    }
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
          <IconButton style={{ marginLeft: 'auto', padding: '6px' }} onClick={() => History.get().push('/apps/new')} className="new-app">
            <AddIcon style={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
        <Paper style={style.paper}>
          <Toolbar style={{ paddingTop: '6px' }}>
            <div style={style.title}>
              <Tooltip title="Filter">
                <IconButton aria-label="filter" onClick={this.handleFilter} className="addFilter" >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </div>
            {(this.state.isFilter || this.state.filters.length > 0) && (
              <FilterSelect
                options={this.state.options}
                onSelect={this.handleFilterChange}
                filters={this.state.filters}
                placeholder="Type to filter..."
                textFieldProps={{ variant: 'outlined' }}
              />
            )}
          </Toolbar>
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
