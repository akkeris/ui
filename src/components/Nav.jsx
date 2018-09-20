import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import { List, ListItem } from 'material-ui/List';
import HomeIcon from 'material-ui/svg-icons/action/home';
import AppIcon from 'material-ui/svg-icons/hardware/developer-board';
import SpacesIcon from 'material-ui/svg-icons/hardware/toys';
import PipelinesIcon from 'material-ui/svg-icons/hardware/device-hub';
import RouterIcon from 'material-ui/svg-icons/hardware/router';
import OrgIcon from 'material-ui/svg-icons/action/face';
import InvoiceIcon from 'material-ui/svg-icons/action/credit-card';

/* eslint-disable jsx-a11y/anchor-is-valid */

import AccountMenu from './AccountMenu';
import api from '../services/api';

const muiTheme = getMuiTheme({
  fontFamily: 'ProximaNova',
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
      marginTop: '16px',
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
          src={this.state.account.thumbnailPhoto}
        />
      );
    }

    const title = (
      <span style={style.title.div}>
        <img alt="akkeris logo" src="images/akkeris.svg" style={style.title.img} />
      </span>
    );

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <AppBar
            className="appbar"
            onLeftIconButtonClick={this.handleToggle}
            title={title}
            style={style.header}
            iconElementRight={accountMenu}
          />
          <Drawer
            className="drawer"
            docked={false}
            open={this.state.open}
            onRequestChange={open => this.setState({ open })}
          >
            <header>
              <AppBar
                className="header"
                title={title}
                style={style.nav}
                onLeftIconButtonClick={this.handleToggle}
              />
            </header>
            <List>
              <Subheader>Navigation</Subheader>
              <Link to="/" style={style.link}>
                <ListItem primaryText="Dashboard" onClick={this.handleClose} leftIcon={<HomeIcon />} />
              </Link>
              <Link to="/apps" style={style.link}>
                <ListItem className="linktoapps" primaryText="Apps" onClick={this.handleClose} leftIcon={<AppIcon />} />
              </Link>
              <Link to="/invoices" style={style.link}>
                <ListItem className="linktoinvoices" primaryText="Invoices" onClick={this.handleClose} leftIcon={<InvoiceIcon />} />
              </Link>
              <Link to="/orgs" style={style.link}>
                <ListItem className="linktoorgs" primaryText="Organizations" onClick={this.handleClose} leftIcon={<OrgIcon />} />
              </Link>
              <Link to="/pipelines" style={style.link}>
                <ListItem className="linktopipelines"primaryText="Pipelines" onClick={this.handleClose} leftIcon={<PipelinesIcon />} />
              </Link>
              <Link to="/sites" style={style.link}>
                <ListItem className="linktosites" primaryText="Sites" onClick={this.handleClose} leftIcon={<RouterIcon />} />
              </Link>
              <Link to="/spaces" style={style.link}>
                <ListItem className="linktospaces" primaryText="Spaces" onClick={this.handleClose} leftIcon={<SpacesIcon />} />
              </Link>
            </List>
            <Divider inset />
          </Drawer>
        </div>
      </MuiThemeProvider>
    );
  }
}
