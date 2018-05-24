import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from 'material-ui/Avatar';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

const style = {
  avatar: {
    marginTop: '8px',
    marginRight: '4px',
    height: '32px',
    width: '32px',
    cursor: 'pointer',
  },
  menu: {
    height: '32px',
    marginRight: '14px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.5)',
  },
  anchorOrigin: {
    horizontal: 'right',
    vertical: 'bottom',
  },
  targetOrigin: {
    horizontal: 'right',
    vertical: 'top',
  },
};

export default class AccountMenu extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      open: false,
    };
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
    window.location = '/logout';
  }

  account = () => {
    window.location = '/user';
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    return (
      <div>
        <Avatar
          className="avatar"
          onTouchTap={this.handleTouchTap}
          src={this.props.src}
          style={style.avatar}
        />
        <ArrowDropDown
          className="dropdown"
          onTouchTap={this.handleTouchTap}
          style={style.menu}
        />
        <Popover
          className="popover"
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={style.anchorOrigin}
          targetOrigin={style.targetOrigin}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem className="account" onTouchTap={this.account} primaryText="Account" />
            <MenuItem className="logout" onTouchTap={this.logout} primaryText="Logout" />
          </Menu>
        </Popover>
      </div>
    );
  }
}

AccountMenu.propTypes = {
  src: PropTypes.string.isRequired,
};
