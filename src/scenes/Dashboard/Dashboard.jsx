import React from 'react';
import PropTypes from 'prop-types';

import {
  Tab, Tabs, CircularProgress, Paper,
} from '@material-ui/core';

import FavoriteIcon from '@material-ui/icons/Favorite';
import RecentIcon from '@material-ui/icons/AccessTime';

import util from '../../services/util';
import FavoritesList from '../../components/Apps/FavoritesList';
import RecentsList from '../../components/RecentsList';
import BaseComponent from '../../BaseComponent';

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
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '12px',
    marginTop: '12px',
    overflow: 'auto',
  },
};

const tabs = ['favorites', 'recent'];

export default class Dashboard extends BaseComponent {
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
    super.componentDidMount();
    try {
      const favoriteResponse = await this.api.getFavorites();
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
    } catch (error) {
      if (!this.isCancel(error)) {
        console.error(error); // eslint-disable-line no-console
      }
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
        <Paper className="paper" style={style.paper}>
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

            <FavoritesList className="favorites" favorites={this.state.favorites} />

          )}
          {currentTab === 'recent' && (

            <RecentsList className="recents" recents={util.getHistory()} />

          )}
        </Paper>
      </div>
    );
  }
}

Dashboard.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
