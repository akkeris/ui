import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  AppBar, Drawer, Divider, List, ListItem, ListSubheader, ListItemIcon, ListItemText,
  Toolbar, IconButton,
} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import AppIcon from '@material-ui/icons/DeveloperBoard';
import SpacesIcon from '@material-ui/icons/Toys';
import PipelinesIcon from '@material-ui/icons/DeviceHub';
import RouterIcon from '@material-ui/icons/Router';
import OrgIcon from '@material-ui/icons/Face';
import InvoiceIcon from '@material-ui/icons/CreditCard';
import MenuIcon from '@material-ui/icons/Menu';
import { blue } from '@material-ui/core/colors';

/* eslint-disable jsx-a11y/anchor-is-valid */

import AccountMenu from './AccountMenu';
import api from '../services/api';


const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    fontFamily: 'ProximaNova',
  },
  overrides: {
    MuiIconButton: {
      root: {
        margin: '0px 18px 0px 0px',
      },
    },
    // MuiDrawer: {
    //   root: {
    //     width: '250px',
    //   },
    // },
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
    api.getUser().then((response) => {
      this.setState({
        account: response.data,
      });
    });
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
        <img alt="akkeris logo" src="images/akkeris.svg" style={style.title.img} />
      </span>
    );

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <AppBar
            className="appbar"
            style={style.header}
            position="static"
          >
            <Toolbar>
              <IconButton onClick={this.handleToggle}>
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
                  <IconButton onClick={this.handleToggle}>
                    <MenuIcon nativeColor="white" />
                  </IconButton>
                  {title}
                </Toolbar>
              </AppBar>
            </header>
            <List component="nav">
              <ListSubheader>Navigation</ListSubheader>
              <ListItem button className="linktodashboard">
                <Link to="/" style={style.link} onClick={this.handleClose}>
                  <ListItemIcon><HomeIcon /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </Link>
              </ListItem>
              <ListItem button className="linktoapps">
                <Link to="/apps" style={style.link} onClick={this.handleClose}>
                  <ListItemIcon><AppIcon /></ListItemIcon>
                  <ListItemText primary="Apps" />
                </Link>
              </ListItem>
              <ListItem button className="linktoinvoices">
                <Link to="/invoices" style={style.link} onClick={this.handleClose}>
                  <ListItemIcon><InvoiceIcon /></ListItemIcon>
                  <ListItemText primary="Invoices" />
                </Link>
              </ListItem>
              <ListItem button className="linktoorgs">
                <Link to="/orgs" style={style.link} onClick={this.handleClose}>
                  <ListItemIcon><OrgIcon /></ListItemIcon>
                  <ListItemText primary="Organizations" />
                </Link>
              </ListItem>
              <ListItem button className="linktopipelines">
                <Link to="/pipelines" style={style.link} onClick={this.handleClose}>
                  <ListItemIcon><PipelinesIcon /></ListItemIcon>
                  <ListItemText primary="Pipelines" />
                </Link>
              </ListItem>
              <ListItem button className="linktosites">
                <Link to="/sites" style={style.link} onClick={this.handleClose}>
                  <ListItemIcon><RouterIcon /></ListItemIcon>
                  <ListItemText primary="Sites" />
                </Link>
              </ListItem>
              <ListItem button className="linktospaces">
                <Link to="/spaces" style={style.link} onClick={this.handleClose}>
                  <ListItemIcon><SpacesIcon /></ListItemIcon>
                  <ListItemText primary="Spaces" />
                </Link>
              </ListItem>
            </List>
            <Divider inset />
          </Drawer>
        </div>
      </MuiThemeProvider>
    );
  }
}
