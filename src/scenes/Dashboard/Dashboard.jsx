import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Tab, Tabs, CircularProgress, Card, Paper,
} from '@material-ui/core';

import FavoriteIcon from '@material-ui/icons/Favorite';
import RecentIcon from '@material-ui/icons/AccessTime';

import api from '../../services/api';
import util from '../../services/util';
import FavoritesList from '../../components/Apps/FavoritesList';
import RecentsList from '../../components/RecentsList';

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
  paper: {
    maxWidth: '1024px',
    minWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
};

const tabs = ['favorites', 'recent'];

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favorites: [],
      loading: true,
      currentTab: 'favorites',
      basePath: '/dashboard',
    };
  }

  async componentDidMount() {
    try {
      const favoriteResponse = await api.getFavorites();
      let currentTab = this.props.match.params.tab; // eslint-disable-line
      if (!currentTab || !tabs.includes(currentTab)) {
        currentTab = 'favorites';
        history.replaceState(null, '', `${this.state.basePath}/favorites`);
      }
      this.setState({
        currentTab,
        favorites: favoriteResponse.data,
        loading: false,
      });
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.tab !== this.props.match.params.tab && this.props.history.action === 'POP') { // eslint-disable-line
      let currentTab = this.props.match.params.tab;
      if (!tabs.includes(currentTab)) {
        currentTab = 'favorites';
        history.replaceState(null, '', `${this.state.basePath}/favorites`);
      }
      this.setState({ currentTab }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  changeActiveTab = (event, newTab) => {
    if (this.state.currentTab !== newTab) {
      this.setState({
        currentTab: newTab,
      });
      history.pushState(null, '', `${this.state.basePath}/${newTab}`);
    }
  }

  render() {
    const { currentTab, loading } = this.state;
    if (loading) {
      return (
        <div className="loading" style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div style={{ marginBottom: '12px' }}>
        <Card className="card" style={{ overflow: 'visible' }}>
          <Tabs
            variant="fullWidth"
            value={this.state.currentTab}
            onChange={this.changeActiveTab}
            scrollButtons="off"
            indicatorColor="primary"
          >
            <Tab
              className="favorites-tab"
              icon={<FavoriteIcon />}
              label="Favorites"
              value="favorites"
            />
            <Tab
              className="recents-tab"
              icon={<RecentIcon />}
              label="Recent"
              value="recent"
            />
          </Tabs>
          {currentTab === 'favorites' && (
            <Paper>
              <FavoritesList className="favorites" favorites={this.state.favorites} />
            </Paper>
          )}
          {currentTab === 'recent' && (
            <Paper>
              <RecentsList className="recents" recents={util.getHistory()} />
            </Paper>
          )}
        </Card>
      </div>
    );
  }
}

Dashboard.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
