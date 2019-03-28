import React, { Component } from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';

import api from '../../services/api';
import util from '../../services/util';
import AutoSuggest from '../../components/AutoSuggest';
import OrgList from '../../components/Orgs';
import History from '../../config/History';

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
    padding: '12px 0px',
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
    this.getOrgs();
  }

  getOrgs = async () => {
    const { data: orgs } = await api.getOrgs();
    this.setState({ orgs, loading: false });
  }

  // handleSearch = (searchText) => {
  //   // History.get().push(`/orgs/${searchText}`);
  // }

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
        <Toolbar style={style.toolbar}>
          {/* <AutoSuggest
            className="search"
            data={util.filterName(this.state.orgs)}
            handleSearch={this.handleSearch}
          /> */}
          <Link to="/orgs/new" style={style.link}>
            <IconButton className="new-org" style={{ padding: '6px', marginBottom: '-6px' }} ><AddIcon style={{ color: 'white' }} /></IconButton>
          </Link>
        </Toolbar>
        <Paper style={style.paper}>
          <OrgList className="orgs" orgs={this.state.orgs} />
        </Paper>
      </div>
    );
  }
}
