import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import {
  CircularProgress, Switch, List, ListItem, ListItemText, Button, Dialog,
  GridList, GridListTile, Table, TableBody, TableRow, TableCell,
  DialogActions, DialogContent, DialogContentText,
  FormGroup, FormControlLabel,
} from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Clear';
import { blue } from '@material-ui/core/colors';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';
import Audits from '../Audits';

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
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
      marginTop: '20%',
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
    };
  }

  componentWillMount() {
    this.setState({ // eslint-disable-line react/no-did-mount-set-state
      isMaintenance: this.props.app.maintenance,
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
    api.patchApp(this.props.app.name, this.state.isMaintenance).then(() => {
      this.props.onComplete('Maintenance Mode Updated');
      this.setState({ mOpen: false });
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
                      <a style={style.link} href={this.props.app.web_url}>{this.props.app.web_url}</a>
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
                  <div style={style.tableCell.sub}>{Date(this.props.app.released_at).toLocaleString()}</div>
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
                  <div style={style.tableCell.end}>
                    <Button variant="contained" className="delete" style={style.button} onClick={this.handleConfirmation} color="secondary">
                      <RemoveIcon color="white" style={style.removeIcon} />
                      <span style={style.deleteButtonLabel}>Delete App</span>
                    </Button>
                  </div>
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
          <Dialog className="error" open={this.state.loading}>
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
};

export default AppOverview;
