import React from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, CircularProgress, withStyles,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import BaseComponent from '../BaseComponent';

const StyledDialog = withStyles({
  paper: {
    overflow: 'visible',
  },
})(Dialog);

/* eslint-disable react/prefer-stateless-function */
export default class ConfirmationModal extends BaseComponent {
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
      <StyledDialog
        className={this.props.className}
        open={this.props.open}
        maxWidth={this.props.style ? this.props.style.maxWidth : 'sm'}
        fullWidth
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
            onKeyDown={e => ['Escape', 'Esc'].includes(e.key) && this.props.onCancel === null && this.onOk()}
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
      </StyledDialog>
    );
  }
}

ConfirmationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
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
