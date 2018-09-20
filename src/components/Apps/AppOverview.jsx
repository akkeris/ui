import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Toggle from 'material-ui/Toggle';
import { List, ListItem } from 'material-ui/List';
import Button from '@material-ui/core/Button';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import { GridList, GridTile } from 'material-ui/GridList';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';
import Audits from '../Audits';

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
  tableRowColumn: {
    main: {
      fontSize: '16px',
    },
    header: {
      paddingLeft: '16px',
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
    icon: {
      width: '100px',
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
          <GridList style={style.gridList} cellHeight={'auto'}>
            <GridTile>
              <List>
                <ListItem primaryText="Organization" secondaryText={this.props.app.organization.name} disabled />
                <ListItem primaryText="ID" secondaryText={`${this.props.app.id}`} disabled />
              </List>
            </GridTile>
            <GridTile>
              <List>
                <ListItem primaryText="URL" secondaryText={<a href={this.props.app.web_url}>{this.props.app.web_url}</a>} disabled />
                <ListItem primaryText="Discovery" secondaryText={`${this.props.app.simple_name.toUpperCase()}_SERVICE_HOST, ${this.props.app.simple_name.toUpperCase()}_SERVICE_PORT`} disabled />
              </List>
            </GridTile>
          </GridList>
          <ListItem primaryText="Current Image" secondaryText={this.props.app.image} disabled />
          <Table>
            <TableBody displayRowCheckbox={false} showRowHover={false} selectable={false}>
              <TableRow selectable={false} displayBorder={false}>
                <TableRowColumn style={style.tableRowColumn.header}>
                  <div style={style.tableRowColumn.main}>{'Last Release and Most Recent Changes'}</div>
                  <div style={style.tableRowColumn.sub}>{Date(this.props.app.released_at).toLocaleString()}</div>
                </TableRowColumn>
                <TableRowColumn style={style.tableRowColumn.icon}>
                  <div style={style.tableRowColumn.icon}>
                    <Toggle
                      className="toggle"
                      label="Maintenance"
                      toggled={this.state.isMaintenance}
                      onToggle={this.handleMaintenanceConfirmation}
                    />
                  </div>
                </TableRowColumn>
                <TableRowColumn >
                  <div style={style.tableRowColumn.end}>{<Button variant="contained" className="delete" style={style.button} onClick={this.handleConfirmation} color="secondary"><RemoveIcon color="white" style={style.removeIcon} /><span style={style.deleteButtonLabel}>Delete App</span></Button>}</div>
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>
          <Audits app={this.props.app} />
          <ConfirmationModal className="delete-confirm" open={this.state.open} onOk={this.handleRemoveApp} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this app?" />
          <ConfirmationModal className="maintenance-confirm" open={this.state.mOpen} onOk={this.handleMaintenanceToggle} onCancel={this.handleCancelMaintenanceConfirmation} message="Are you sure you want to put this app in maintenance?" title="Confirm Maintenance" />
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

AppOverview.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onComplete: PropTypes.func.isRequired,
};

export default AppOverview;
