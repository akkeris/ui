import React, { Component } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { blue } from '@material-ui/core/colors';

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
  },
  overrides: {
    MuiPaper: {
      root: {
        width: '75%',
        maxWidth: '768px',
      },
    },
  },
});

/* eslint-disable react/prefer-stateless-function */
export default class ConfirmationModal extends Component {
  render() {
    return (
      <MuiThemeProvider theme={muiTheme}>
        <Dialog
          className={this.props.className}
          open={this.props.open}
        >
          <DialogTitle>{this.props.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.props.message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            {this.props.actions}
            <Button
              className="ok"
              color="primary"
              onClick={this.props.onOk}
            >
              Ok
            </Button>
            <Button
              className="cancel"
              color="secondary"
              onClick={this.props.onCancel}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

ConfirmationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  actions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

ConfirmationModal.defaultProps = {
  title: 'Confirm Delete',
  className: 'confirm',
  actions: null,
};
