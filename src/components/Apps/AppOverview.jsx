import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  CircularProgress, Switch, List, ListItem, ListItemText, Button, Dialog,
  GridList, GridListTile, Table, TableBody, TableRow, TableCell,
  DialogActions, DialogContent, DialogContentText,
  FormGroup, FormControlLabel, Tooltip,
} from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Clear';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';
import Audits from '../Audits';

function addRestrictedTooltip(title, children) {
  return (
    <Tooltip title={title} placement="top">
      <div>{children}</div>
    </Tooltip>
  );
}

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiDialog: {
      paper: {
        width: '40%',
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: 'none',
      },
    },
    MuiFormGroup: {
      root: {
        alignContent: 'center',
      },
    },
  },
});

const style = {
  link: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  currentImage: {
    visible: {
      padding: '0 24px 10px 24px',
    },
    hidden: {
      padding: '0 24px 18px 24px',
    },
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '10%',
      paddingBottom: '10%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  button: {
    marginRight: '16px',
  },
  gridList: {
    overflowY: 'auto',
  },
  tableCell: {
    main: {
      fontSize: '16px',
    },
    header: {
      paddingLeft: '24px',
      marginLeft: '0px',
      paddingRight: '16px',
    },
    sub: {
      fontSize: '14px',
      color: 'rgb(0,0,0,0.54)',
    },
    end: {
      float: 'right',
    },
  },
  deleteButtonLabel: {
    paddingRight: '5px',
  },
  removeIcon: {
    paddingRight: '5px',
  },
};

class AppOverview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      open: false,
      mOpen: false,
      submitFail: false,
      submitMessage: '',
      isMaintenance: false,
      isElevated: false,
      restrictedSpace: false,
    };
  }

  componentWillMount() {
    const { app, accountInfo } = this.props;

    // If this is a production app, check for the elevated_access role to determine
    // whether or not to enable the delete app button.

    // There is still an API call on the backend that controls access to the actual
    // deletion of the app, this is merely for convienence.

    let isElevated = false;
    let restrictedSpace = false;
    if (app.space.compliance.includes('prod') || app.space.compliance.includes('socs')) {
      // If we don't have the elevated_access object in the accountInfo object,
      // default to enabling the button (access will be controlled on the API)
      isElevated = accountInfo.elevated_access ? accountInfo.elevated_access : true;
      restrictedSpace = true;
    }

    this.setState({ // eslint-disable-line react/no-did-mount-set-state
      isMaintenance: app.maintenance,
      loading: false,
      isElevated,
      restrictedSpace,
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
      mOpen: true,
      isMaintenance: isInputChecked,
    });
  }

  handleCancelMaintenanceConfirmation = () => {
    this.setState({
      mOpen: false,
      isMaintenance: !this.state.isMaintenance,
    });
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleRemoveApp = () => {
    api.deleteApp(this.props.app.name).then(() => {
      window.location = '#/apps';
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        open: false,
      });
    });
  }

  handleMaintenanceToggle = () => {
    this.setState({ loading: true });
    api.patchApp(this.props.app.name, this.state.isMaintenance).then(() => {
      this.props.onComplete('Maintenance Mode Updated');
      this.setState({ mOpen: false, loading: false });
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        loading: false,
        mOpen: false,
      });
    });
  }

  render() {
    const { isElevated, restrictedSpace } = this.state;
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }

    let deleteButton = (
      <Button
        variant="contained"
        className="delete"
        style={style.button}
        onClick={this.handleConfirmation}
        color="secondary"
        disabled={(restrictedSpace && !isElevated)}
      >
        <RemoveIcon style={style.removeIcon} nativeColor={isElevated ? 'white' : undefined} />
        <span style={style.deleteButtonLabel}>Delete App</span>
      </Button>
    );

    // Wrap the delete button in a tooltip to avoid confusion as to why it is disabled
    if (restrictedSpace && !isElevated) {
      deleteButton = addRestrictedTooltip('Elevated access required', deleteButton);
    }

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <GridList style={style.gridList} cellHeight={'auto'}>
            <GridListTile>
              <List>
                <ListItem>
                  <ListItemText primary="Organization" secondary={this.props.app.organization.name} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="ID" secondary={`${this.props.app.id}`} />
                </ListItem>
              </List>
            </GridListTile>
            <GridListTile>
              <List>
                <ListItem>
                  <ListItemText
                    primary="URL"
                    secondary={
                      <a style={style.link} href={this.props.app.web_url}>
                        {this.props.app.web_url}
                      </a>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Discovery" secondary={`${this.props.app.simple_name.toUpperCase()}_SERVICE_HOST, ${this.props.app.simple_name.toUpperCase()}_SERVICE_PORT`} />
                </ListItem>
              </List>
            </GridListTile>
          </GridList>
          <ListItemText
            style={this.props.app.image ? style.currentImage.visible : style.currentImage.hidden}
            primary="Current Image"
            secondary={this.props.app.image}
          />
          <Table>
            <TableBody>
              <TableRow>
                <TableCell style={style.tableCell.header}>
                  <div style={style.tableCell.main}>{'Last Release and Most Recent Changes'}</div>
                  <div style={style.tableCell.sub}>
                    {Date(this.props.app.released_at).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          className="toggle"
                          checked={this.state.isMaintenance}
                          onChange={this.handleMaintenanceConfirmation}
                        />
                      }
                      label="Maintenance"
                      labelPlacement="start"
                    />
                  </FormGroup>
                </TableCell>
                <TableCell >
                  <div style={style.tableCell.end}>{deleteButton}</div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Audits app={this.props.app} />
          <ConfirmationModal className="delete-confirm" open={this.state.open} onOk={this.handleRemoveApp} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this app?" />
          <ConfirmationModal
            className="maintenance-confirm"
            open={this.state.mOpen}
            onOk={this.handleMaintenanceToggle}
            onCancel={this.handleCancelMaintenanceConfirmation}
            message={!this.state.isMaintenance ? (
              'Are you sure you want to take this app out of maintenance?'
            ) : (
              'Are you sure you want to put this app in maintenance?'
            )}
            title="Confirm Maintenance"
          />
          <Dialog className="error" open={this.state.loading || this.state.submitFail}>
            <DialogContent>
              <DialogContentText>
                {this.state.submitMessage}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button className="ok" color="primary" onClick={this.handleClose}>Ok</Button>
            </DialogActions>
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

AppOverview.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onComplete: PropTypes.func.isRequired,
  accountInfo: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default AppOverview;
