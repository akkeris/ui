import React, { Component } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import {
  Tab, Tabs, CircularProgress, Card, CardHeader, Paper,
} from '@material-ui/core';

import FavoriteIcon from '@material-ui/icons/Favorite';
import RecentIcon from '@material-ui/icons/AccessTime';

import api from '../../services/api';
import FavoritesList from '../../components/Apps/FavoritesList';


const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiTabs: {
      root: {
        backgroundColor: '#3c4146',
        color: 'white',
        maxWidth: '1024px',
      },
    },
    MuiTab: {
      root: {
        minWidth: '120px !important',
      },
    },
    MuiCardContent: {
      root: {
        display: 'flex',
        flexFlow: 'row-reverse',
        padding: '0px 16px 0px 0px !important',
      },
    },
    MuiCard: {
      root: {
        maxWidth: '1024px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '12px',
      },
    },
    MuiCardHeader: {
      root: {
        padding: '16px 16px 0px 16px !important',
      },
      title: {
        fontSize: '15px',
        fontWeight: '500',
      },
      subheader: {
        fontSize: '14px',
        fontWeight: '500',
      },
    },
  },
});

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
      apps: [],
      loading: true,
      currentTab: 'favorites',
      baseHash: '#/dashboard/',
      basePath: '/dashboard',
    };
  }

  async componentDidMount() {
    try {
      const favoriteResponse = await api.getFavorites();
      const hashPath = window.location.hash;
      let currentTab = hashPath.replace(this.state.baseHash, '');
      if (!tabs.includes(currentTab)) {
        currentTab = 'favorites';
        window.location.hash = `${this.state.baseHash}favorites`;
      }
      this.setState({
        currentTab,
        apps: favoriteResponse.data,
        loading: false,
      });
    } catch (err) {
      console.log(err);
    }
  }

  componentDidUpdate(prevProps) {
    const routeHasChanged = prevProps.location.pathname !== this.props.location.pathname;
    if (routeHasChanged && this.props.history.action === 'POP') {
      if (this.props.location.pathname === `${this.state.basePath}` ||
          this.props.location.pathname === `${this.state.basePath}/`) {
        window.history.back();
        return;
      }
      const hashPath = window.location.hash;
      if (hashPath.includes(this.state.baseHash)) {
        let currentTab = hashPath.replace(this.state.baseHash, '');
        if (!tabs.includes(currentTab)) {
          currentTab = 'favorites';
          window.location = `${this.state.baseHash}favorites`;
        }
        this.setState({ currentTab });
      }
    }
  }

  changeActiveTab = (event, newTab) => {
    if (this.state.currentTab !== newTab) {
      this.setState({
        currentTab: newTab,
      });
      this.props.history.push(`${newTab}`);
    }
  }

  render() {
    const { currentTab, loading } = this.state;
    if (loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div className="loading" style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={{ marginBottom: '12px' }}>
          <Card className="card" style={{ overflow: 'visible' }}>
            <Tabs
              fullWidth
              value={this.state.currentTab}
              onChange={this.changeActiveTab}
              scrollButtons="off"
            >
              <Tab
                className="favorites-tab"
                icon={<FavoriteIcon />}
                label="Favorites"
                value="favorites"
              />
              <Tab
                className="recent-tab"
                icon={<RecentIcon />}
                label="Recent"
                value="recent"
              />
            </Tabs>
            {currentTab === 'favorites' && (
              <Paper>
                <FavoritesList className="apps" apps={this.state.apps} />
              </Paper>
            )}
            {currentTab === 'recent' && (
              <div>
                Hello
              </div>
            )}

          </Card>
        </div>
      </MuiThemeProvider>
    );
  }
}

Dashboard.propTypes = {
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
