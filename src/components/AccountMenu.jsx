import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Menu, MenuItem } from '@material-ui/core';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import History from '../config/History';

const style = {
  avatar: {
    marginRight: '4px',
    height: '32px',
    width: '32px',
    cursor: 'pointer',
  },
  arrowDropDown: {
    cursor: 'pointer',
  },
  anchorOrigin: {
    vertical: 35,
    horizontal: 'right',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'right',
  },
};

export default class AccountMenu extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      open: false,
    };
    this.divRef = React.createRef();
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  logout = () => {
    // can't use history here because we want it to route to Express
    window.location = '/logout';
  }

  account = () => {
    History.get().push('/user');
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const avatarProps = {
      className: 'avatar',
      onClick: this.handleTouchTap,
      style: style.avatar,
    };
    if (this.props.src && this.props.src.length > 0) {
      avatarProps.src = this.props.src;
    }

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} ref={this.divRef}>
          <Avatar {...avatarProps}>
            {this.props.accountName.length > 0 ? this.props.accountName[0] : null}
          </Avatar>
          <ArrowDropDown
            className="dropdown"
            onClick={this.handleTouchTap}
            nativeColor="rgba(255,255,255,0.5)"
            style={style.arrowDropDown}
          />
        </div>
        <Menu
          className="popover"
          open={this.state.open}
          anchorEl={this.divRef.current}
          anchorOrigin={style.anchorOrigin}
          transformOrigin={style.transformOrigin}
          onClose={this.handleRequestClose}
          getContentAnchorEl={null}
        >
          <MenuItem className="account" onClick={this.account}>Account</MenuItem>
          <MenuItem className="logout" onClick={this.logout}>Logout</MenuItem>
        </Menu>
      </div>
    );
  }
}

AccountMenu.propTypes = {
  src: PropTypes.string.isRequired,
};
