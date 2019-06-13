import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Select, MenuItem, IconButton, TextField, FormControl, InputLabel, CircularProgress,
  ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Tooltip,
  Table, TableHead, TableBody, TableRow, TableCell, Input, InputAdornment,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RemoveIcon from '@material-ui/icons/Clear';
import RestartIcon from '@material-ui/icons/Replay';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import BackIcon from '@material-ui/icons/ArrowBack';
import WarningIcon from '@material-ui/icons/Warning';
import { pink, teal, amber, red } from '@material-ui/core/colors';
import HealthyIcon from '@material-ui/icons/CheckCircle';
import UnhealthyIcon from '@material-ui/icons/Cancel';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';

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
  title: {
    fontSize: 15,
    fontWeight: 500,
    marginBottom: '6px',
  },
  date: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.54)',
    marginBottom: '12px',
  },
  info: {
    container: {
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0px',
    },
    details: {
      container: {
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '24px', width: '65%',
      },
      size: {
        width: '200px',
      },
      quantity: {
        width: '100px',
      },
      commandPort: {
        width: '175px',
      },
    },
    actions: {
      container: {
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '25%',
      },
      item: {
        width: '50px',
      },
    },
    healthcheck: {
      container: {
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px',
      },
      input: {
        width: '74%',
      },
      status: {
        flex: 1, paddingLeft: '33px',
      },
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
      healthy: false,
      checkingHealth: (props.formation.quantity > 0),
      displayStatus: false,
    };
  }

  componentWillMount() {
    this.reset();
  }

  checkHealth = async () => {
    const { app, formation } = this.props;
    const { healthcheck } = this.state;

    // Only do healthcheck if there's something to check
    if (formation.quantity < 1) {
      return;
    }

    let url;

    if (healthcheck !== null && healthcheck !== '') {
      // Ensure there's only one slash between the URL and healthcheck
      url = `${app.web_url.replace(/\/+$/, '')}/${healthcheck.replace(/^\/+/, '')}`;
    } else {
      this.setState({ displayStatus: false });
      return;
    }

    this.setState({ checkingHealth: true, healthy: false, displayStatus: true });
    try {
      const response = await api.getHealthcheck(url);
      if (response.status >= 200 && response.status < 300) {
        this.setState({ healthy: true, checkingHealth: false });
      } else {
        throw Error();
      }
    } catch (err) {
      this.setState({ healthy: false, checkingHealth: false });
    }
  }

  handleEditToggle = () => {
    this.setState({ edit: !this.state.edit });
  }

  handleEditBack = () => {
    this.reset(true);
  }

  handleChange = name => (event) => {
    if (name === 'healthcheck') { this.setState({ displayStatus: false }); }
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

  handleRemoveFormation = async () => {
    try {
      await api.deleteFormation(this.props.app.name, this.props.formation.type);
      this.props.onComplete('Removed Formation');
    } catch (error) {
      this.reset();
      this.props.onError(error.response.data);
    }
  }

  handleRestart = async () => {
    try {
      await api.restartFormation(this.props.app.name, this.props.formation.type);
      this.props.onAlert('Formation Restarted');
    } catch (error) {
      this.reset();
      this.props.onError(error.response.data);
    }
  }

  handlePatchFormation = async () => {
    let { healthcheck } = this.state;
    if (!healthcheck || healthcheck === '') {
      healthcheck = null;
    } else {
      healthcheck = `/${this.state.healthcheck.replace(/^\/+/, '')}`;
    }
    try {
      await api.patchFormation(
        this.props.app.name,
        this.props.formation.type,
        this.state.size,
        this.state.quantity,
        this.state.command === '' ? null : this.state.command,
        this.state.port === '' ? null : this.state.port,
        healthcheck,
        this.props.formation.type === 'web' ?
          (this.state.healthcheck === null || this.state.healthcheck === '') : undefined,
      );
      this.props.onComplete('Updated Formation');
    } catch (error) {
      this.reset();
      this.props.onError(error.response.data);
    }
  }

  reset = (expanded) => {
    let { size } = this.props.formation;
    if (this.props.formation.size.indexOf('prod') !== -1) {
      size = size.replace('-prod', '');
    }
    if (expanded) {
      this.checkHealth();
    }
    this.setState({
      port: this.props.formation.port,
      command: this.props.formation.command,
      quantity: this.props.formation.quantity,
      size,
      healthcheck: this.props.formation.healthcheck,
      edit: false,
      displayStatus: (
        this.props.formation.healthcheck !== null && this.props.formation.healthcheck !== '' && this.props.formation.quantity > 0
      ),
    });
  }

  renderSizes() {
    const { sizes } = this.props;
    return sizes.map(size =>
      (<MenuItem
        className={size.name}
        key={size.name}
        value={`${size.name}`}
      >{`${size.name} - ${size.resources.limits.memory}`}</MenuItem>),
    );
  }

  renderDynos() {
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

  renderFormationHealth() {
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

  renderHealthcheckStatus() {
    const { healthy, checkingHealth, displayStatus } = this.state;

    const healthIcon = healthy ? <HealthyIcon nativeColor="#27ae60" /> : <UnhealthyIcon nativeColor="#e74c3c" />;

    const loadingIcon = <CircularProgress size={20} />;

    if (!displayStatus) {
      return null;
    }

    return (
      <div style={style.info.healthcheck.status}>
        {checkingHealth ? loadingIcon : healthIcon}
      </div>
    );
  }

  renderInfoRow() {
    const port = this.state.port === null ? '' : this.state.port;
    const healthcheck = this.state.healthcheck === null ? '' : this.state.healthcheck;

    // Ensure there is no trailing slash on the app url
    let webUrl = '';
    if (this.props.formation.type === 'web') {
      webUrl = this.props.app.web_url.replace(/\/+$/, '');
    }

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', backgroundColor: this.state.edit ? 'rgba(0,0,0,0.05)' : undefined }}
        className={`${this.props.formation.type}-info`}
      >
        <div style={{ ...style.info.container }}>
          <div style={style.info.details.container}>
            <div style={style.info.details.size}>
              <FormControl disabled={!this.state.edit} fullWidth>
                <InputLabel shrink htmlFor="size-select-input">
                  Size
                </InputLabel>
                <Select
                  className="size-select"
                  fullWidth
                  value={this.state.size}
                  renderValue={value => (
                    `${value} - ${this.props.sizes.find(x => x.name === value).resources.limits.memory}`
                  )}
                  onChange={this.handleChange('size')}
                  input={<Input name="size" id="size-select-input" />}
                >
                  {this.renderSizes()}
                </Select>
              </FormControl>
            </div>
            <div style={style.info.details.quantity}>
              <FormControl disabled={!this.state.edit} fullWidth>
                <InputLabel shrink htmlFor="quantity-select-input">
                    Quantity
                </InputLabel>
                <Select
                  fullWidth
                  className="quantity-select"
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
              </FormControl>
            </div>
            <div style={style.info.details.commandPort}>
              {this.props.formation.type === 'web' ? (
                <TextField
                  fullWidth
                  className="port"
                  disabled={!this.state.edit}
                  type="numeric"
                  label="Port"
                  value={port}
                  onChange={this.handleChange('port')}
                  helperText={this.state.errorText}
                  error={this.state.errorText.length > 0}
                />
              ) : (
                <TextField
                  className="command"
                  disabled={!this.state.edit}
                  label="Command"
                  value={this.state.command}
                  onChange={this.handleChange('command')}
                  helperText={this.state.errorText}
                  error={this.state.errorText.length > 0}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">~$</InputAdornment>,
                  }}
                />
              )}
            </div>
          </div>
          <div style={style.info.actions.container}>
            <div style={style.info.actions.item}>
              <Tooltip title="Restart" placement="top-start">
                <IconButton style={style.iconButton} className="restart" onClick={this.handleRestart}><RestartIcon /></IconButton>
              </Tooltip>
            </div>
            <div style={style.info.actions.item}>
              {!this.state.edit ? (
                <Tooltip title="Edit" placement="top-start">
                  <IconButton style={style.iconButton} className="edit" onClick={this.handleEditToggle}><EditIcon /></IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Save" placement="top-start">
                  <IconButton style={style.iconButton} className="save" onClick={this.handlePatchFormation}><SaveIcon /></IconButton>
                </Tooltip>
              )}
            </div>
            <div style={style.info.actions.item}>
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
            </div>
          </div>
        </div>
        {this.props.formation.type === 'web' && (
          <div style={style.info.healthcheck.container}>
            <div style={style.info.healthcheck.input}>
              <TextField
                fullWidth
                className="healthcheck"
                disabled={!this.state.edit}
                type="text"
                label="Healthcheck"
                placeholder="healthcheck_endpoint"
                value={healthcheck}
                onChange={this.handleChange('healthcheck')}
                helperText={this.state.errorText}
                error={this.state.errorText.length > 0}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{webUrl}</InputAdornment>,
                }}
                inputProps={{ style: { width: 'auto', flex: 1 } }} // eslint-disable-line
                onBlur={() => this.checkHealth()}
              />
            </div>
            {this.renderHealthcheckStatus()}
          </div>
        )}
      </div>
    );
  }

  render() {
    const date = new Date(this.props.formation.updated_at);
    return (
      <TableRow
        className={this.props.formation.type}
        key={this.props.formation.id}
        style={{ ...style.tableRow, borderBottom: '1px solid rgb(224, 224, 224)' }}
      >
        <TableCell style={{ padding: '4px 24px' }}>
          <ExpansionPanel
            style={{ boxShadow: 'none' }}
            onChange={(event, expanded) => this.reset(expanded)}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} style={{ padding: '0px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
                  <div style={style.title}>
                    {this.props.formation.type}
                  </div>
                  <div style={style.date}>
                    {date.toLocaleString()}
                  </div>
                </div>
                <span style={{ paddingLeft: '48px' }}>{this.renderFormationHealth()}</span>
              </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ flexDirection: 'column', padding: '8px 12px 24px' }}>
              {this.renderInfoRow()}
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
                  {this.renderDynos()}
                </TableBody>
              </Table>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </TableCell>
      </TableRow>
    );
  }
}

DynoType.propTypes = {
  formation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  dynos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onComplete: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onAlert: PropTypes.func.isRequired,
  sizes: PropTypes.arrayOf(PropTypes.object).isRequired,
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
