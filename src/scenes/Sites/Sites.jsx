import React, { Component } from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper, Select, MenuItem,
  FormControl, InputLabel,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import SitesList from '../../components/Sites';
import util from '../../services/util';
import Search from '../../components/Search';

/* eslint-disable jsx-a11y/anchor-is-valid */

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiIconButton: {
      root: { color: 'white', padding: '6px', marginBottom: '-6px' },
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
    marginBottom: '12px',
  },
  regionContainer: {
    marginLeft: '30px',
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

  handleSearch = (searchText) => {
    window.location = `#/sites/${searchText}/info`;
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
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <Toolbar style={style.toolbar} disableGutters>
            <Search
              className="search"
              data={util.filterDomain(this.state.filteredSites)}
              handleSearch={this.handleSearch}
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
            <Link to="/sites/new" style={style.link}>
              <IconButton className="new-site"><AddIcon /></IconButton>
            </Link>
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
