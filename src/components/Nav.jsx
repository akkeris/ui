import React from 'react';
import deepmerge from 'deepmerge';
import { Link } from 'react-router-dom';
import {
  AppBar, List, ListItem, ListItemIcon, Toolbar, Typography, Tooltip,
} from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import AppIcon from '@material-ui/icons/DeveloperBoard';
import PipelinesIcon from '@material-ui/icons/DeviceHub';
import RouterIcon from '@material-ui/icons/Router';
import GroupsIcon from '@material-ui/icons/Business';
import SpacesIcon from '@material-ui/icons/DonutLarge';
import InvoiceIcon from '@material-ui/icons/CreditCard';
import GlobalSearch from './GlobalSearch';

/* eslint-disable jsx-a11y/anchor-is-valid */

import AccountMenu from './AccountMenu';
import History from '../config/History';
import BaseComponent from '../BaseComponent';

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
    MuiTypography: {
      h5: {
        fontFamily: 'ProximaNova',
      },
    },
    MuiListItem: {
      root: {
        paddingTop: '10px',
        paddingBottom: '10px',
      },
    },
    MuiListItemText: {
      primary: {
        fontFamily: 'ProximaNova',
      },
    },
    MuiListSubheader: {
      root: {
        fontFamily: 'ProximaNova',
      },
    },
    MuiToolbar: { // Use default values for AppBar height
      root: {
        minHeight: undefined,
        maxHeight: undefined,
        paddingLeft: '8px !important',
      },
    },
  },
});

const style = {
  container: {
    marginTop: '64px',
  },
  header: {
    backgroundColor: '#3c4146',
  },
  link: {
    textDecoration: 'none',
    display: 'flex',
  },
  title: {
    img: {
      width: '32px',
      height: '32px',
    },
  },
  routeTitle: {
    paddingLeft: '24px', color: 'white',
  },
  drawerButton: {
    margin: '0px 18px 0px 0px',
  },
  drawer: {
    zIndex: 1,
    paddingTop: '12px',
    transition: '.2s ease all',
    height: '100%',
    backgroundColor: 'unset',
    border: 'none',
    overflow: 'hidden',
    width: '64px',
  },
  navList: {
    paddingLeft: '4px',
    height: '100%',
  },
  titleContainer: {
    flexGrow: '1', display: 'flex', alignItems: 'center', marginLeft: '8px',
  },
  listIcon: {
    color: 'white',
    opacity: '.5',
  },
  listIconActive: {
    color: 'white',
    opacity: '1',
  },
};

export default class Nav extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      open: false,
      account: null,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getUser();
  }

  getUser = async () => {
    try {
      const { data: account } = await this.api.getUser();
      this.setState({ account });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  handleToggle = () => this.setState({ open: !this.state.open });
  handleClose = () => this.setState({ open: false });

  handleNestedListToggle = (item) => {
    this.setState({
      open: item.state.open,
    });
  };

  handleSearch = (value) => {
    if (value && value.uri) {
      History.get().push(value.uri);
    }
  }

  renderRouteTitle = () => {
    const route = window.location.pathname.split('/')[1];
    switch (route) {
      case 'dashboard':
        return 'Dashboard';
      case 'apps':
        return 'Apps';
      case 'invoices':
        return 'Invoices';
      case 'pipelines':
        return 'Pipelines';
      case 'sites':
        return 'Sites';
      case 'app-setups':
        return 'App Setups';
      case 'spaces':
        return 'Spaces';
      case 'orgs':
        return 'Organizations';
      default:
        return 'Page Not Found';
    }
  }

  render() {
    let accountMenu = (
      <div />
    );

    if (this.state.account !== null) {
      accountMenu = (
        <AccountMenu
          className="account-menu"
          src={this.state.account.thumbnailPhoto ? this.state.account.thumbnailPhoto : ''}
          accountName={this.state.account.name ? this.state.account.name : ''}
        />
      );
    }

    const title = (
      <span style={style.titleContainer}>
        <img alt="akkeris logo" src="/images/akkeris.svg" style={style.title.img} />
        <Typography variant="h5" style={style.routeTitle}>
          {this.renderRouteTitle()}
        </Typography>
      </span>
    );

    const route = window.location.pathname.split('/')[1];

    return (
      <MuiThemeProvider theme={theme}>
        <div style={style.container}>
          <AppBar
            className="appbar"
            style={style.header}
            position="fixed"
          >
            <Toolbar>
              {title}
              <GlobalSearch onSearch={this.handleSearch} maxResults={10} />
              {accountMenu}
            </Toolbar>
          </AppBar>
          <div style={style.drawer}>
            <List
              component="nav"
              style={style.navList}
            >
              <Link to="/dashboard" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Dashboard">
                  <ListItem button className="linktodashboard">
                    <ListItemIcon>
                      <HomeIcon style={route === 'dashboard' ? style.listIconActive : style.listIcon} />
                    </ListItemIcon>
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/apps" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Apps">
                  <ListItem button className="linktoapps">
                    <ListItemIcon>
                      <AppIcon style={route === 'apps' ? style.listIconActive : style.listIcon} />
                    </ListItemIcon>
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/invoices" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Invoices">
                  <ListItem button className="linktoinvoices">
                    <ListItemIcon>
                      <InvoiceIcon style={route === 'invoices' ? style.listIconActive : style.listIcon} />
                    </ListItemIcon>
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/spaces" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Spaces">
                  <ListItem button className="linktospaces">
                    <ListItemIcon>
                      <SpacesIcon style={route === 'spaces' ? style.listIconActive : style.listIcon} />
                    </ListItemIcon>
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/orgs" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Organizations">
                  <ListItem button className="linktoorgs">
                    <ListItemIcon>
                      <GroupsIcon style={route === 'orgs' ? style.listIconActive : style.listIcon} />
                    </ListItemIcon>
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/pipelines" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Pipelines">
                  <ListItem button className="linktopipelines">
                    <ListItemIcon>
                      <PipelinesIcon style={route === 'pipelines' ? style.listIconActive : style.listIcon} />
                    </ListItemIcon>
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/sites" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Sites">
                  <ListItem button className="linktosites">
                    <ListItemIcon>
                      <RouterIcon style={route === 'sites' ? style.listIconActive : style.listIcon} />
                    </ListItemIcon>
                  </ListItem>
                </Tooltip>
              </Link>
            </List>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
