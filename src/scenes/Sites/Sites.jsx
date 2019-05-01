import React, { Component } from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper, MenuItem,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import SitesList from '../../components/Sites';
import FilterSelect from '../../components/FilterSelect';
import api from '../../services/api';

/* eslint-disable jsx-a11y/anchor-is-valid */

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
    marginBottom: '12px',
    overflow: 'auto',
  },
  regionContainer: {
    minWidth: '145px',
  },
};

class Sites extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      sites: [],
      filteredSites: [],
      regions: [],
      region: '',
      loading: true,
      filters: [],
      sort: 'site-asc',
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { data: sites } = await api.getSites();
    const { data: regions } = await api.getRegions();

    const options = [
      {
        label: 'Regions',
        options: regions.map(region => ({ label: region.name, value: region.name, type: 'region' })),
      },
    ];

    this.setState({
      sites,
      filteredSites: sites,
      regions,
      loading: false,
      options,
    }, () => {
      let values;
      try {
        values = JSON.parse(localStorage.getItem('akkeris_site_filters'));
      } catch (e) {
        values = [];
      }
      this.handleFilterChange(values);
    });
  }

  handleFilterChange = (values) => {
    if (!values || values.length === 0) {
      this.setState({ filteredSites: this.state.sites, filters: [] }, this.handleSort);
      localStorage.setItem('akkeris_site_filters', JSON.stringify(values));
      return;
    }

    const filterLabel = site => ({ label }) => (
      label.toLowerCase().localeCompare(site.region.name.toLowerCase()) === 0
    );

    const filteredSites = this.state.sites.filter(site => (
      !(values.length > 0 && !values.some(filterLabel(site)))),
    );

    this.setState({ filteredSites, filters: values }, this.handleSort);

    localStorage.setItem('akkeris_site_filters', JSON.stringify(values));
  }


  handleSort = () => {
    const { filteredSites, sort } = this.state;
    let sortedSites = [];
    if (sort !== '') {
      sortedSites = filteredSites.sort((a, b) => {
        switch (sort) {
          case 'site-asc':
            return a.domain.replace(/[-._]/g, '').toLowerCase().localeCompare(b.domain.replace(/[-._]/g, '').toLowerCase());
          case 'site-desc':
            return b.domain.replace(/[-._]/g, '').toLowerCase().localeCompare(a.domain.replace(/[-._]/g, '').toLowerCase());
          case 'updated-asc':
            return (a.updated_at < b.updated_at) ? -1 : ((a.updated_at > b.updated_at) ? 1 : 0); // eslint-disable-line
          case 'updated-desc':
            return (b.updated_at < a.updated_at) ? -1 : ((b.updated_at > a.updated_at) ? 1 : 0); // eslint-disable-line
          case 'region-asc':
            return a.region.name.toLowerCase().localeCompare(b.region.name.toLowerCase());
          case 'region-desc':
            return b.region.name.toLowerCase().localeCompare(a.region.name.toLowerCase());
          default:
            return 0;
        }
      });
    } else {
      sortedSites = filteredSites;
    }
    this.setState({ filteredSites: sortedSites });
  }

  handleSortChange = (column, direction) => this.setState({ sort: `${column}-${direction}` }, this.handleSort);

  renderRegions() {
    return this.state.regions.map(region => (
      <MenuItem className={region.name} key={region.id} value={region.name}>{region.name}</MenuItem>
    ));
  }

  render() {
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
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
            placeholder="Filter by Region"
          />
          <Link to="/sites/new" style={style.link}>
            <IconButton className="new-site" style={{ padding: '6px' }}>
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
          </Link>
        </Toolbar>
        <Paper style={style.paper}>
          <SitesList
            sites={this.state.filteredSites}
            onSortChange={this.handleSortChange}
          />
        </Paper>
      </div>
    );
  }
}

export default Sites;
