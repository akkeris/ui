import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Select, MenuItem, IconButton, TextField, Typography, FormControl, InputLabel,
  ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Tooltip,
  Table, TableHead, TableBody, TableRow, TableCell, Input,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RemoveIcon from '@material-ui/icons/Clear';
import RestartIcon from '@material-ui/icons/Replay';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import BackIcon from '@material-ui/icons/ArrowBack';
import WarningIcon from '@material-ui/icons/Warning';
import { pink, teal, amber, red, blue } from '@material-ui/core/colors';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';

const muiTheme = createMuiTheme({
  palette: {
    primary: {       main: '#0097a7',     },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
    h6: {
      fontSize: 15,
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(0, 0, 0, 0.54)',
    },
  },
  overrides: {
    MuiFormControl: {
      root: {
        width: '125px',
      },
    },
    MuiTableCell: {
      root: {
        padding: '10px 10px',
        borderBottom: '0',
      },
    },
  },
});

const style = {
  iconButton: {
    color: 'black',
  },
  tableRow: {
    height: '58px',
  },
  tableRowColumn: {
    title: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
    end: {
      float: 'right',
    },
    icon: {
      width: '58px',
    },
  },
};

export default class DynoType extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      size: 0,
      quantity: '',
      port: 0,
      command: '',
      healthcheck: null,
      edit: false,
      open: false,
      expanded: false,
      errorText: '',
    };
  }

  componentWillMount() {
    this.reset();
  }

  getDynos() {
    return this.props.dynos.map((dyno, i) => {
      let health = dyno.state;
      const date = new Date(dyno.updated_at);
      const started = new Date(Date.parse(dyno.created_at));
      const now = new Date();
      let color = null;
      switch (dyno.state.toLowerCase()) {
        case 'start-failure':
          health = 'crashed';
          color = pink[50];
          break;

        case 'app-crashed':
          health = 'crashed';
          color = pink[50];
          break;

        case 'waiting':
          health = 'starting';
          color = amber[50];
          break;

        case 'pending':
          health = 'pending';
          color = amber[50];
          break;

        case 'stopping':
          health = 'stopping';
          color = amber[50];
          break;

        case 'probe-failure':
          if ((now.getTime() - started.getTime()) > 1000 * 90) {
            health = 'unhealthy';
            color = pink[50];
          } else {
            health = 'starting';
            color = amber[50];
          }
          break;

        default:
          health = dyno.state;
          color = teal[50];
          break;
      }
      return (
        <TableRow
          className={`dyno-${i}`}
          key={dyno.id}
          style={{ height: '58px', backgroundColor: color }}
          hover
        >
          <TableCell>
            <div style={style.tableRowColumn.main}>{dyno.name}</div>
            <div style={style.tableRowColumn.sub}>{`Release: ${dyno.release.version}`}</div>
          </TableCell>
          <TableCell>
            <div>{health}</div>
          </TableCell>
          <TableCell>
            <div>{dyno.restarts}</div>
          </TableCell>
          <TableCell>
            <div>{date.toLocaleString()}</div>
          </TableCell>
        </TableRow>
      );
    });
  }

  getFormationHealth() {
    let alert = null;
    if (this.props.dynos.filter(dyno => dyno.state.toLowerCase() === 'start-failure' || dyno.state.toLowerCase() === 'app-crashed').length > 0) {
      alert = <WarningIcon className="status-critical" nativeColor={red[700]} />;
    } else if (this.props.dynos.filter(dyno => dyno.state.toLowerCase() === 'waiting' || dyno.state.toLowerCase() === 'probe-failure' || dyno.state.toLowerCase() === 'pending' || dyno.state.toLowerCase() === 'stopping').length > 0) {
      alert = <WarningIcon className="status-warning" nativeColor={amber[700]} />;
    }
    return (
      alert
    );
  }

  handleEditToggle = () => {
    this.setState({ edit: !this.state.edit });
  }

  handleEditBack = () => {
    this.reset();
  }

  handleExpandClick = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  handleChange = name => (event) => {
    if (name === 'port') {
      const port = parseInt(event.target.value, 10);
      if (Number.isNaN(port)) {
        this.setState({
          port: event.target.value === '' ? null : this.state.port,
        });
      } else {
        this.setState({
          port,
        });
      }
    } else {
      this.setState({
        [name]: event.target.value,
      });
    }
  }

  handleConfirmation = () => {
    this.setState({ open: true });
  }

  handleCancelConfirmation = () => {
    this.setState({ open: false });
  }

  handleRemoveFormation = () => {
    api.deleteFormation(this.props.app, this.props.formation.type).then(() => {
      this.props.onComplete('Removed Formation');
    }).catch((error) => {
      this.reset();
      this.props.onError(error.response.data);
    });
  }

  handleRestart = () => {
    api.restartFormation(this.props.app, this.props.formation.type).then(() => {
      this.props.onAlert('Formation Restarted');
    }).catch((error) => {
      this.reset();
      this.props.onError(error.response.data);
    });
  }

  handlePatchFormation = () => {
    api.patchFormation(this.props.app, this.props.formation.type, this.state.size, this.state.quantity, this.state.command === '' ? null : this.state.command, this.state.port === '' ? null : this.state.port, this.state.healthcheck === '' ? null : this.state.healthcheck, this.state.healthcheck === '').then(() => {
      this.props.onComplete('Updated Formation');
    }).catch((error) => {
      this.reset();
      this.props.onError(error.response.data);
    });
  }

  reset = () => {
    let { size } = this.props.formation;
    if (this.props.formation.size.indexOf('prod') !== -1) {
      size = size.replace('-prod', '');
    }
    this.setState({
      port: this.props.formation.port,
      command: this.props.formation.command,
      quantity: this.props.formation.quantity,
      size,
      healthcheck: this.props.formation.healthcheck,
      edit: false,
    });
  }

  render() {
    const port = this.state.port === null ? '' : this.state.port;
    const healthcheck = this.state.healthcheck === null ? '' : this.state.healthcheck;
    const date = new Date(this.props.formation.updated_at);
    return (
      <MuiThemeProvider theme={muiTheme}>
        <TableRow
          className={this.props.formation.type}
          key={this.props.formation.id}
          style={{ ...style.tableRow, borderBottom: '1px solid rgb(224, 224, 224)' }}
        >
          <TableCell style={{ padding: '4px 24px' }}>
            <ExpansionPanel style={{ boxShadow: 'none' }} onChange={() => this.setState({ edit: false })}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} style={{ padding: '0px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <div style={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {this.props.formation.type}
                    </Typography>
                    <Typography gutterBottom variant="subtitle1">
                      {date.toLocaleString()}
                    </Typography>
                  </div>
                  <span style={{ paddingLeft: '48px' }}>{this.getFormationHealth()}</span>
                </div>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ flexDirection: 'column', padding: '8px 12px 24px' }}>
                <Table style={{ tableLayout: 'fixed' }} className={`${this.props.formation.type}-info`}>
                  <TableBody>
                    <TableRow
                      className={this.props.formation.type}
                      key={this.props.formation.id}
                      style={style.tableRow}
                      selected={this.state.edit}
                    >
                      <TableCell>
                        <FormControl disabled={!this.state.edit} style={{ minWidth: '100px' }}>
                          <InputLabel shrink htmlFor="size-select-input">
                            Size
                          </InputLabel>
                          <Select
                            className="size-select"
                            fullWidth
                            // hintText={this.state.size}
                            value={this.state.size}
                            renderValue={value => (value)}
                            onChange={this.handleChange('size')}
                            input={<Input name="size" id="size-select-input" />}
                          >
                            {this.props.sizeList}
                          </Select>
                          {/* <FormHelperText>
                            {this.state.size}
                          </FormHelperText> */}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl disabled={!this.state.edit}>
                          <InputLabel shrink htmlFor="quantity-select-input">
                              Quantity
                          </InputLabel>
                          <Select
                            fullWidth
                            className="quantity-select"
                            // hintText={this.state.quantity.toString()}
                            value={this.state.quantity}
                            onChange={this.handleChange('quantity')}
                            input={<Input name="quantity" id="quantity-select-input" />}
                          >
                            <MenuItem className="q0" value={0}>0</MenuItem>
                            <MenuItem className="q1" value={1}>1</MenuItem>
                            <MenuItem className="q2" value={2}>2</MenuItem>
                            <MenuItem className="q3" value={3}>3</MenuItem>
                            <MenuItem className="q4" value={4}>4</MenuItem>
                            <MenuItem className="q5" value={5}>5</MenuItem>
                            <MenuItem className="q6" value={6}>6</MenuItem>
                            <MenuItem className="q7" value={7}>7</MenuItem>
                            <MenuItem className="q8" value={8}>8</MenuItem>
                            <MenuItem className="q9" value={9}>9</MenuItem>
                            <MenuItem className="q10" value={10}>10</MenuItem>
                          </Select>
                          {/* <FormHelperText>
                            {this.state.quantity.toString()}
                          </FormHelperText> */}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {this.props.formation.type === 'web' ? (
                          <TextField className="port" disabled={!this.state.edit} type="numeric" label="Port" value={port} onChange={this.handleChange('port')} helperText={this.state.errorText} error={this.state.errorText.length > 0} />
                        ) : (
                          <TextField className="command" disabled={!this.state.edit} label="Command" value={this.state.command} onChange={this.handleChange('command')} helperText={this.state.errorText} error={this.state.errorText.length > 0} />
                        )}
                      </TableCell>
                      {this.props.formation.type === 'web' && (
                        <TableCell>
                          <TextField className="healthcheck" disabled={!this.state.edit} type="text" label="Healthcheck" value={healthcheck} onChange={this.handleChange('healthcheck')} helperText={this.state.errorText} error={this.state.errorText.length > 0} />
                        </TableCell>
                      )}
                      <TableCell style={{ width: '50px' }} >
                        <Tooltip title="Restart" placement="top-start">
                          <IconButton style={style.iconButton} className="restart" onClick={this.handleRestart}><RestartIcon /></IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell style={{ width: '50px' }} >
                        {!this.state.edit ? (
                          <Tooltip title="Edit" placement="top-start">
                            <IconButton style={style.iconButton} className="edit" onClick={this.handleEditToggle}><EditIcon /></IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Save" placement="top-start">
                            <IconButton style={style.iconButton} className="save" onClick={this.handlePatchFormation}><SaveIcon /></IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell style={{ width: '50px' }} >
                        {this.props.formation.type !== 'web' && !this.state.edit && (
                          <div style={style.tableRowColumn.end}>
                            <Tooltip title="Remove" placement="top-start">
                              <IconButton style={style.iconButton} className="remove" onClick={this.handleConfirmation}><RemoveIcon /></IconButton>
                            </Tooltip>
                            <ConfirmationModal className="delete-formation" open={this.state.open} onOk={this.handleRemoveFormation} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this formation?" />
                          </div>
                        )}
                        {this.state.edit && (
                          <Tooltip title="Back" placement="top-start">
                            <div style={style.tableRowColumn.end}><IconButton style={style.iconButton} className="back" onClick={this.handleEditBack}><BackIcon /></IconButton></div>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Table style={{ tableLayout: 'fixed' }} className={`${this.props.formation.type}-dynos`}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dyno</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Restarts</TableCell>
                      <TableCell>Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.getDynos()}
                  </TableBody>
                </Table>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </TableCell>
        </TableRow>
      </MuiThemeProvider>
    );
  }
}

DynoType.propTypes = {
  formation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  dynos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onComplete: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onAlert: PropTypes.func.isRequired,
  sizeList: PropTypes.arrayOf(PropTypes.object).isRequired,
  app: PropTypes.string.isRequired,
};
