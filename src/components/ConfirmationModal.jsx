import React, { Component } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress,
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
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
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open && !this.props.open) {
      this.setState({ loading: false }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  onOk = () => {
    const { onOk } = this.props;
    this.setState({ loading: true }, () => onOk());
  }

  render() {
    const { loading } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <Dialog
          className={this.props.className}
          open={this.props.open}
        >
          <DialogTitle>{this.props.title}</DialogTitle>
          <DialogContent>
            {!loading ? (
              <DialogContentText>{this.props.message}</DialogContentText>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            {this.props.actions}
            <Button
              className="ok"
              color="primary"
              onClick={this.onOk}
              disabled={loading}
              autoFocus={this.props.onCancel === null}
            >
              Ok
            </Button>
            {this.props.onCancel !== null && (
              <Button
                className="cancel"
                color="secondary"
                onClick={this.props.onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

ConfirmationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  actions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

ConfirmationModal.defaultProps = {
  title: 'Confirm Delete',
  className: 'confirm',
  onCancel: null,
  actions: null,
};
