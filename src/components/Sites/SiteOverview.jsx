import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { List, ListItem } from 'material-ui/List';
import Button from '@material-ui/core/Button';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RemoveIcon from 'material-ui/svg-icons/content/clear';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
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
    },
  },
  button: {
    marginRight: '16px',
  },
};

export default class SiteOverview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      open: false,
      submitFail: false,
      submitMessage: '',
    };
  }

  componentWillMount() {
    this.setState({
      loading: false,
    });
  }

  handleConfirmation = () => {
    this.setState({ open: true });
  }

  handleCancelConfirmation = () => {
    this.setState({ open: false });
  }

  handleMaintenanceConfirmation = (event, isInputChecked) => {
    this.setState({
      isMaintenance: isInputChecked,
    });
  }

  handleCancelMaintenanceConfirmation = () => {
    this.setState({
      isMaintenance: !this.state.isMaintenance,
    });
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleRemoveSite = () => {
    api.deleteSite(this.props.site.domain).then(() => {
      window.location = '#/sites';
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
      });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <List>
            <ListItem primaryText="Domain" secondaryText={this.props.site.domain} disabled />
            <ListItem primaryText="ID" secondaryText={this.props.site.id} disabled />
            <ListItem primaryText="Region" secondaryText={this.props.site.region.name} disabled />
            <ListItem primaryText="Compliance" secondaryText={this.props.site.compliance.toString()} disabled />
            <ListItem primaryText="Updated At" secondaryText={Date(this.props.site.updated_at).toLocaleString()} rightIconButton={<Button variant="contained" className="delete" style={style.button}label="Delete Site" onClick={this.handleConfirmation} secondary icon={<RemoveIcon />} />} disabled />
          </List>
          <ConfirmationModal open={this.state.open} onOk={this.handleRemoveSite} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this site?" />
          <Dialog
            className="error"
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                className="ok"
                label="Ok"
                primary
                onClick={this.handleClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

SiteOverview.propTypes = {
  site: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
