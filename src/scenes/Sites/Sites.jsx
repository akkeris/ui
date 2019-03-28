import React, { Component } from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper, MenuItem,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import SitesList from '../../components/Sites';
import util from '../../services/util';
import CustomSelect from '../../components/CustomSelect';

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
    padding: '12px 0',
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
    marginBottom: '12px',
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
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { data: sites } = await api.getSites();
    const { data: regions } = await api.getRegions();
    this.setState({
      sites: sites.sort((a, b) => a.domain > b.domain),
      filteredSites: sites.sort((a, b) => a.domain > b.domain),
      regions,
      loading: false,
    });
  }

  handleRegionChange = (event) => {
    const region = event.target.value;
    const sites = util.filterSites(this.state.sites, region);
    this.setState({
      region,
      filteredSites: sites,
    });
  }

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
          <Link to="/sites/new" style={style.link}>
            <IconButton className="new-site" style={{ padding: '6px', marginBottom: '-6px' }}>
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
          </Link>
        </Toolbar>
        <Paper style={style.paper}>
          <SitesList sites={this.state.filteredSites} />
        </Paper>
      </div>
    );
  }
}

export default Sites;
