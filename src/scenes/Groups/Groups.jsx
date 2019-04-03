import React, { Component } from 'react';
import {
  Paper, Tabs, Tab, Toolbar, IconButton,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
/* eslint-disable jsx-a11y/anchor-is-valid */
import History from '../../config/History';
import OrgList from './OrgsList';
import SpacesList from './SpacesList';


const style = {
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '12px',
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
};

export default class Groups extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tab: 0,
    };
  }

  handleChange = (event, tab) => {
    this.setState({ tab });
  }

  handleNew = () => {
    const { tab } = this.state;
    History.get().push(`/groups/${tab === 0 ? 'new-space' : 'new-org'}`);
  }

  render() {
    const { tab } = this.state;
    return (
      <div>
        <Toolbar style={style.toolbar} disableGutters>
          <IconButton
            onClick={this.handleNew}
            className="new-group"
            style={{ marginLeft: 'auto', padding: '6px', marginBottom: '-6px' }}
          >
            <AddIcon style={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
        <Paper style={style.paper}>
          <Tabs
            value={tab}
            onChange={this.handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            centered
          >
            <Tab label="Spaces" />
            <Tab label="Orgs" />
          </Tabs>
          {tab === 0 && <SpacesList />}
          {tab === 1 && <OrgList />}
        </Paper>
      </div>
    );
  }
}
