import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import RestartIcon from 'material-ui/svg-icons/av/replay';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import SaveIcon from 'material-ui/svg-icons/content/save';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableBody, TableRow, TableRowColumn, TableHeader, TableHeaderColumn } from 'material-ui/Table';
import { pink50, teal50, amber50, red700, amber700 } from 'material-ui/styles/colors';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';

const style = {
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
    div: {
      width: '58px',
      overflow: 'visible',
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
          color = pink50;
          break;

        case 'app-crashed':
          health = 'crashed';
          color = pink50;
          break;

        case 'waiting':
          health = 'starting';
          color = amber50;
          break;

        case 'pending':
          health = 'pending';
          color = amber50;
          break;

        case 'stopping':
          health = 'stopping';
          color = amber50;
          break;

        case 'probe-failure':
          if ((now.getTime() - started.getTime()) > 1000 * 90) {
            health = 'unhealthy';
            color = pink50;
          } else {
            health = 'starting';
            color = amber50;
          }
          break;

        default:
          health = dyno.state;
          color = teal50;
          break;
      }
      return (
        <TableRow
          className={`dyno-${i}`}
          key={dyno.id}
          style={{ height: '58px', backgroundColor: color }}
          selectable={false}
        >
          <TableRowColumn>
            <div style={style.tableRowColumn.main}>{dyno.name}</div>
            <div style={style.tableRowColumn.sub}>{`Release: ${dyno.release.version}`}</div>
          </TableRowColumn>
          <TableRowColumn>
            <div>{health}</div>
          </TableRowColumn>
          <TableRowColumn>
            <div>{dyno.restarts}</div>
          </TableRowColumn>
          <TableRowColumn>
            <div>{date.toLocaleString()}</div>
          </TableRowColumn>
        </TableRow>
      );
    });
  }

  getFormationHealth() {
    let alert = null;
    if (this.props.dynos.filter(dyno => dyno.state.toLowerCase() === 'start-failure' || dyno.state.toLowerCase() === 'app-crashed').length > 0) {
      alert = <IconButton className="status-critical"><WarningIcon color={red700} /></IconButton>;
    } else if (this.props.dynos.filter(dyno => dyno.state.toLowerCase() === 'waiting' || dyno.state.toLowerCase() === 'probe-failure' || dyno.state.toLowerCase() === 'pending' || dyno.state.toLowerCase() === 'stopping').length > 0) {
      alert = <IconButton className="status-warning"><WarningIcon color={amber700} /></IconButton>;
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

  handleQuantityChange = (event, index, value) => {
    this.setState({ quantity: value });
  }

  handleSizeChange = (event, index, value) => {
    this.setState({ size: value });
  }

  handlePortChange = (event) => {
    const port = parseInt(event.target.value, 10);
    this.setState({
      port: Number.isNaN(port) ? (event.target.value === '' ? null : this.state.port) : port, // eslint-disable-line no-nested-ternary
    });
  }

  handleHealthCheckChange = (event) => {
    this.setState({ healthcheck: event.target.value });
  }

  handleCommandChange = (event) => {
    this.setState({ command: event.target.value });
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
      <TableRow
        className={this.props.formation.type}
        key={this.props.formation.id}
        style={style.tableRow}
        selectable={false}
      >
        <TableRowColumn>
          <Card style={{ boxShadow: 'none' }}>
            <CardHeader
              title={this.props.formation.type}
              subtitle={date.toLocaleString()}
              style={{ paddingLeft: 0 }}
              actAsExpander
              showExpandableButton
            >
              {this.getFormationHealth()}
            </CardHeader>
            <CardText expandable>
              <Table className={`${this.props.formation.type}-info`} wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
                <TableBody displayRowCheckbox={false} showRowHover={false} selectable={false}>
                  <TableRow
                    className={this.props.formation.type}
                    key={this.props.formation.id}
                    style={style.tableRow}
                    selectable={false}
                    hovered={this.state.edit}
                  >
                    <TableRowColumn>
                      <SelectField
                        className="size-select"
                        floatingLabelText="Size"
                        floatingLabelFixed
                        hintText={this.state.size}
                        onChange={this.handleSizeChange}
                        disabled={!this.state.edit}
                      >
                        {this.props.sizeList}
                      </SelectField>
                    </TableRowColumn>
                    <TableRowColumn>
                      <div>
                        <SelectField
                          className="quantity-select"
                          floatingLabelText="Quantity"
                          floatingLabelFixed
                          hintText={this.state.quantity.toString()}
                          onChange={this.handleQuantityChange}
                          disabled={!this.state.edit}
                        >
                          <MenuItem className="q0" value={0} primaryText="0" />
                          <MenuItem className="q1" value={1} primaryText="1" />
                          <MenuItem className="q2" value={2} primaryText="2" />
                          <MenuItem className="q3" value={3} primaryText="3" />
                          <MenuItem className="q4" value={4} primaryText="4" />
                          <MenuItem className="q5" value={5} primaryText="5" />
                          <MenuItem className="q6" value={6} primaryText="6" />
                          <MenuItem className="q7" value={7} primaryText="7" />
                          <MenuItem className="q8" value={8} primaryText="8" />
                          <MenuItem className="q9" value={9} primaryText="9" />
                          <MenuItem className="q10" value={10} primaryText="10" />
                        </SelectField>
                      </div>
                    </TableRowColumn>
                    <TableRowColumn>
                      {this.props.formation.type === 'web' && (
                        <TextField className="port" disabled={!this.state.edit} type="numeric" floatingLabelText="Port" value={port} onChange={this.handlePortChange} errorText={this.state.errorText} />
                      )}
                      {this.props.formation.type !== 'web' && (
                        <TextField className="command" disabled={!this.state.edit} floatingLabelText="command" value={this.state.command} onChange={this.handleCommandChange} errorText={this.state.errorText} />
                      )}
                    </TableRowColumn>
                    {this.props.formation.type === 'web' && (
                      <TableRowColumn>
                        <TextField className="healthcheck" disabled={!this.state.edit} type="text" floatingLabelText="healthcheck" value={healthcheck} onChange={this.handleHealthCheckChange} errorText={this.state.errorText} />
                      </TableRowColumn>
                    )}
                    <TableRowColumn style={style.tableRowColumn.div}>
                      <div><IconButton className="restart" tooltip="Restart" tooltipPosition="top-left" onTouchTap={this.handleRestart}><RestartIcon /></IconButton></div>
                    </TableRowColumn>
                    <TableRowColumn style={style.tableRowColumn.div}>
                      {!this.state.edit && (
                        <IconButton className="edit" tooltip="Edit" tooltipPosition="top-left" onTouchTap={this.handleEditToggle}><EditIcon /></IconButton>
                      )}
                      {this.state.edit && (
                        <IconButton className="save" tooltip="Save" tooltipPosition="top-left" onTouchTap={this.handlePatchFormation}><SaveIcon /></IconButton>
                      )}
                    </TableRowColumn>
                    <TableRowColumn style={style.tableRowColumn.div}>
                      {this.props.formation.type !== 'web' && !this.state.edit && (
                        <div style={style.tableRowColumn.end}>
                          <IconButton className="remove" tooltip="Remove" tooltipPosition="top-left" onTouchTap={this.handleConfirmation}><RemoveIcon /></IconButton>
                          <ConfirmationModal className="delete-formation" open={this.state.open} onOk={this.handleRemoveFormation} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this formation?" />
                        </div>
                      )}
                      {this.state.edit && (
                        <div style={style.tableRowColumn.end}><IconButton className="back" tooltip="Back" tooltipPosition="top-left" onTouchTap={this.handleEditBack}><BackIcon /></IconButton></div>
                      )}
                    </TableRowColumn>
                  </TableRow>
                </TableBody>
              </Table>
              <Table className={`${this.props.formation.type}-dynos`} wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
                <TableHeader adjustForCheckbox={false} displaySelectAll={false} selectable={false}>
                  <TableRow>
                    <TableHeaderColumn>Dyno</TableHeaderColumn>
                    <TableHeaderColumn>Status</TableHeaderColumn>
                    <TableHeaderColumn>Restarts</TableHeaderColumn>
                    <TableHeaderColumn>Updated</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
                  {this.getDynos()}
                </TableBody>
              </Table>
            </CardText>
          </Card>
        </TableRowColumn>
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
  sizeList: PropTypes.arrayOf(PropTypes.object).isRequired,
  app: PropTypes.string.isRequired,
};
