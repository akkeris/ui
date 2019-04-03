import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import { Link } from 'react-router-dom';
import {
  AppBar, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Toolbar, IconButton, Typography, Tooltip,
} from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import AppIcon from '@material-ui/icons/DeveloperBoard';
import SpacesIcon from '@material-ui/icons/Toys';
import PipelinesIcon from '@material-ui/icons/DeviceHub';
import RouterIcon from '@material-ui/icons/Router';
import OrgIcon from '@material-ui/icons/Face';
import InvoiceIcon from '@material-ui/icons/CreditCard';
import MenuIcon from '@material-ui/icons/Menu';
import GlobalSearch from './GlobalSearch';

/* eslint-disable jsx-a11y/anchor-is-valid */

import AccountMenu from './AccountMenu';
import api from '../services/api';
import History from '../config/History';

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
    MuiTypography: {
      h5: {
        fontFamily: 'ProximaNova',
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
    marginTop: '64px',
    paddingTop: '12px',
    transition: '.2s ease all',
  },
  drawerOpen: {
    width: '200px',
  },
  drawerClosed: {
    width: '64px',
  },
  navList: {
    paddingLeft: '4px',
  },
  titleContainer: {
    flexGrow: '1', display: 'flex', alignItems: 'center',
  },
};

export default class Nav extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      open: false,
      account: null,
    };
  }

  componentDidMount() {
    this.getUser();
  }

  getUser = async () => {
    const { data: account } = await api.getUser();
    this.setState({ account });
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
      case 'orgs':
        return 'Organizations';
      case 'pipelines':
        return 'Pipelines';
      case 'sites':
        return 'Sites';
      case 'spaces':
        return 'Spaces';
      case 'app-setups':
        return 'App Setups';
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
              <IconButton onClick={this.handleToggle} style={style.drawerButton}>
                <MenuIcon nativeColor="white" />
              </IconButton>
              {title}
              <GlobalSearch onSearch={this.handleSearch} maxResults={10} />
              {accountMenu}
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            className="drawer"
            PaperProps={{
              style: {
                ...style.drawer,
                ...(this.state.open ? style.drawerOpen : style.drawerClosed),
              },
            }}
          >
            <List
              component="nav"
              style={style.navList}
            >
              <Link to="/dashboard" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Dashboard">
                  <ListItem button className="linktodashboard">
                    <ListItemIcon>
                      <HomeIcon color={route === 'dashboard' ? 'primary' : undefined} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/apps" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Apps">
                  <ListItem button className="linktoapps">
                    <ListItemIcon>
                      <AppIcon color={route === 'apps' ? 'primary' : undefined} />
                    </ListItemIcon>
                    <ListItemText primary="Apps" />
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/invoices" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Invoices">
                  <ListItem button className="linktoinvoices">
                    <ListItemIcon>
                      <InvoiceIcon color={route === 'invoices' ? 'primary' : undefined} />
                    </ListItemIcon>
                    <ListItemText primary="Invoices" />
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/orgs" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Organizations">
                  <ListItem button className="linktoorgs">
                    <ListItemIcon>
                      <OrgIcon color={route === 'orgs' ? 'primary' : undefined} />
                    </ListItemIcon>
                    <ListItemText primary="Organizations" />
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/pipelines" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Pipelines">
                  <ListItem button className="linktopipelines">
                    <ListItemIcon>
                      <PipelinesIcon color={route === 'pipelines' ? 'primary' : undefined} />
                    </ListItemIcon>
                    <ListItemText primary="Pipelines" />
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/sites" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Sites">
                  <ListItem button className="linktosites">
                    <ListItemIcon>
                      <RouterIcon color={route === 'sites' ? 'primary' : undefined} />
                    </ListItemIcon>
                    <ListItemText primary="Sites" />
                  </ListItem>
                </Tooltip>
              </Link>
              <Link to="/spaces" style={style.link} onClick={this.handleClose}>
                <Tooltip placement="right" title="Spaces">
                  <ListItem button className="linktospaces">
                    <ListItemIcon>
                      <SpacesIcon color={route === 'spaces' ? 'primary' : undefined} />
                    </ListItemIcon>
                    <ListItemText primary="Spaces" />
                  </ListItem>
                </Tooltip>
              </Link>
            </List>
          </Drawer>
        </div>
      </MuiThemeProvider>
    );
  }
}
