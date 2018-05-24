import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const muiTheme = getMuiTheme();

/* eslint-disable react/prefer-stateless-function */
export default class ConfirmationModal extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Dialog
          className={this.props.className}
          open={this.props.open}
          modal
          title={this.props.title}
          actions={[
            this.props.actions,
            <FlatButton
              className="ok"
              label="Ok"
              primary
              onTouchTap={this.props.onOk}
            />,
            <FlatButton
              className="cancel"
              label="Cancel"
              secondary
              onTouchTap={this.props.onCancel}
            />,
          ]}
        >
          {this.props.message}
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
