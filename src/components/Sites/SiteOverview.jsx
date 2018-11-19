import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import {
  Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions,
  List, ListItem, ListItemText, Button, CircularProgress,
} from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Clear';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';

const muiTheme = createMuiTheme({
  palette: {
    primary: {       main: '#0097a7',     },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
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
    },
  },
  button: {
    marginRight: '16px',
  },
  deleteButtonLabel: {
    paddingRight: '5px',
  },
  removeIcon: {
    paddingRight: '5px',
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
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <List>
            <ListItem >
              <ListItemText primary="Domain" secondary={this.props.site.domain} />
            </ListItem>
            <ListItem >
              <ListItemText primary="ID" secondary={this.props.site.id} />
            </ListItem>
            <ListItem >
              <ListItemText primary="Region" secondary={this.props.site.region.name} />
            </ListItem>
            <ListItem >
              <ListItemText primary="Compliance" secondary={this.props.site.compliance.toString()} />
            </ListItem>
            <ListItem >
              <ListItemText primary="Updated At" secondary={Date(this.props.site.updated_at).toLocaleString()} />
              <Button
                variant="contained"
                className="delete"
                style={style.button}
                onClick={this.handleConfirmation}
                color="secondary"
              >
                <RemoveIcon nativeColor="white" style={style.removeIcon} />
                <span style={style.deleteButtonLabel}>Delete Site</span>
              </Button>
            </ListItem>
          </List>
          <ConfirmationModal open={this.state.open} onOk={this.handleRemoveSite} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this site?" />
          <Dialog
            className="error"
            open={this.state.submitFail}
          >
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
              <DialogContentText>{this.state.submitMessage}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                onClick={this.handleClose}
              >Ok</Button>
            </DialogActions>
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

SiteOverview.propTypes = {
  site: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
