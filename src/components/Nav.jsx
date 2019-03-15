import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import { Link } from 'react-router-dom';
import {
  AppBar, Drawer, Divider, List, ListItem, ListSubheader, ListItemIcon, ListItemText,
  Toolbar, IconButton,
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

/* eslint-disable jsx-a11y/anchor-is-valid */

import AccountMenu from './AccountMenu';
import api from '../services/api';

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
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
      },
    },
  },
});

const style = {
  header: {
    backgroundColor: '#3c4146',
  },
  nav: {
    backgroundColor: '#e72a7e',
  },
  link: {
    textDecoration: 'none',
    display: 'flex',
  },
  title: {
    div: {
      textTransform: 'uppercase',
      fontWeight: 100,
      fontSize: '18px',
    },
    img: {
      width: '32px',
      height: '32px',
    },
    app: {
      fontWeight: 400,
    },
  },
  drawerButton: {
    margin: '0px 18px 0px 0px',
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
      <span style={{ flexGrow: '1', display: 'flex', alignItems: 'center' }}>
        <img alt="akkeris logo" src="/images/akkeris.svg" style={style.title.img} />
      </span>
    );

    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <AppBar
            className="appbar"
            style={style.header}
            position="static"
          >
            <Toolbar>
              <IconButton onClick={this.handleToggle} style={style.drawerButton}>
                <MenuIcon nativeColor="white" />
              </IconButton>
              {title}
              {accountMenu}
            </Toolbar>
          </AppBar>
          <Drawer
            className="drawer"
            open={this.state.open}
            onClose={this.handleToggle}
            PaperProps={{ style: { width: '250px' } }}
          >
            <header>
              <AppBar
                className="header"
                position="static"
                style={style.nav}
              >
                <Toolbar>
                  <IconButton onClick={this.handleToggle} style={style.drawerButton}>
                    <MenuIcon nativeColor="white" />
                  </IconButton>
                  {title}
                </Toolbar>
              </AppBar>
            </header>
            <List component="nav">
              <ListSubheader>Navigation</ListSubheader>
              <Link to="/dashboard" style={style.link} onClick={this.handleClose}>
                <ListItem button className="linktodashboard">
                  <ListItemIcon><HomeIcon /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
              </Link>
              <Link to="/apps" style={style.link} onClick={this.handleClose}>
                <ListItem button className="linktoapps">
                  <ListItemIcon><AppIcon /></ListItemIcon>
                  <ListItemText primary="Apps" />
                </ListItem>
              </Link>
              <Link to="/invoices" style={style.link} onClick={this.handleClose}>
                <ListItem button className="linktoinvoices">
                  <ListItemIcon><InvoiceIcon /></ListItemIcon>
                  <ListItemText primary="Invoices" />
                </ListItem>
              </Link>
              <Link to="/orgs" style={style.link} onClick={this.handleClose}>
                <ListItem button className="linktoorgs">
                  <ListItemIcon><OrgIcon /></ListItemIcon>
                  <ListItemText primary="Organizations" />
                </ListItem>
              </Link>
              <Link to="/pipelines" style={style.link} onClick={this.handleClose}>
                <ListItem button className="linktopipelines">
                  <ListItemIcon><PipelinesIcon /></ListItemIcon>
                  <ListItemText primary="Pipelines" />
                </ListItem>
              </Link>
              <Link to="/sites" style={style.link} onClick={this.handleClose}>
                <ListItem button className="linktosites">
                  <ListItemIcon><RouterIcon /></ListItemIcon>
                  <ListItemText primary="Sites" />
                </ListItem>
              </Link>
              <Link to="/spaces" style={style.link} onClick={this.handleClose}>
                <ListItem button className="linktospaces">
                  <ListItemIcon><SpacesIcon /></ListItemIcon>
                  <ListItemText primary="Spaces" />
                </ListItem>
              </Link>
            </List>
            <Divider variant="inset" />
          </Drawer>
        </div>
      </MuiThemeProvider>
    );
  }
}
