import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, Snackbar, IconButton, TableCell, Tooltip, Typography, Collapse,
  Table, TableBody, TableRow,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import ReloadIcon from '@material-ui/icons/Refresh';
import api from '../../services/api';
import util from '../../services/util';
import NewFormation from './NewFormation';
import DynoType from './DynoType';
import ConfirmationModal from '../ConfirmationModal';

const style = {
  iconButton: {
    color: 'black',
  },
  tableRowColumn: {
    icon: {
      width: '58px',
    },
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '250px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  header: {
    container: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 24px',
      borderBottom: '1px solid rgb(224, 224, 224)',
    },
    icons: {
      container: {
        display: 'flex', flexDirection: 'row', alignItems: 'space-between',
      },
    },
  },
};

export default class Formations extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      formations: [],
      sizes: [],
      dynos: [],
      loading: true,
      submitFail: false,
      submitMessage: '',
      open: false,
      message: '',
      new: false,
    };
    this.getFormations();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getFormations = async () => {
    const [r1, r2, r3] = await Promise.all([
      api.getFormations(this.props.app.name),
      api.getFormationSizes(),
      api.getDynos(this.props.app.name),
    ]);
    const formations = r1.data.sort((a, b) => (a.type < b.type ? -1 : 1));
    const dynos = r3.data;
    let sizes = [];
    r2.data.forEach((size) => {
      if (size.name.indexOf('prod') === -1) {
        sizes.push(size);
      }
    });
    sizes = sizes.sort((a, b) =>
      parseInt(a.resources.limits.memory, 10) - parseInt(b.resources.limits.memory, 10));
    if (this._isMounted) {
      this.setState({
        sizes,
        dynos,
        formations,
        loading: false,
      });
    }
  }

  handleError = (message) => {
    this.setState({
      submitMessage: message,
      submitFail: true,
      loading: false,
      open: false,
      message: '',
    });
  }

  handleDialogClose = () => {
    this.setState({ submitFail: false });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  handleNewFormation = () => {
    this.setState({ new: true });
  }

  handleNewFormationCancel = () => {
    this.setState({ new: false });
  }

  info = (message) => {
    this.setState({
      open: true,
      message,
    });
  }

  reload = async (message) => {
    this.setState({ loading: true });
    const [r1, r2] = await Promise.all([
      api.getFormations(this.props.app.name),
      api.getDynos(this.props.app.name),
    ]);
    const formations = r1.data.sort((a, b) => (a.type < b.type ? -1 : 1));
    const dynos = r2.data;
    if (this._isMounted) {
      if (message) {
        this.setState({
          formations,
          dynos,
          loading: false,
          new: false,
          open: true,
          message,
        });
      } else {
        this.setState({
          formations,
          dynos,
          loading: false,
        });
      }
    }
  }

  renderFormations() {
    return this.state.formations.map(formation => (
      <DynoType
        formation={formation}
        dynos={util.filterDynosByFormation(this.state.dynos, formation)}
        onComplete={this.reload}
        onAlert={this.info}
        key={formation.id}
        sizes={this.state.sizes}
        onError={this.handleError}
        app={this.props.app}
      />
    ));
  }

  render() {
    return (
      <div>
        <Collapse in={this.state.new} mountOnEnter unmountOnExit>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '6px 26px 0px' }}>
              <Typography style={{ flex: 1 }} variant="overline">New Formation</Typography>
              <IconButton style={style.iconButton} className="cancel" onClick={this.handleNewFormationCancel}><RemoveIcon /></IconButton>
            </div>
            <NewFormation app={this.props.app} onComplete={this.reload} />
          </div>
        </Collapse>
        <div style={style.header.container}>
          <Typography variant="overline">Formation</Typography>
          <div style={style.header.icons.container} >
            <div style={{ width: '50px' }}>
              {!this.state.new && (
                <Tooltip title="Refresh" placement="bottom-end">
                  <IconButton style={style.iconButton} className="reload-formations" onClick={() => this.reload()}><ReloadIcon /></IconButton>
                </Tooltip>
              )}
            </div>
            <div style={{ width: '50px' }}>
              {!this.state.new && (
                <Tooltip title="New Formation" placement="bottom-end">
                  <IconButton style={style.iconButton} className="new-formation" onClick={this.handleNewFormation}><AddIcon /></IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <Table className="formation-list">
          <TableBody>
            {this.state.loading && (
              <TableRow>
                <TableCell>
                  <div style={style.refresh.div}>
                    <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!this.state.loading && (
              (!this.state.formations || this.state.formations.length === 0) ? (
                <TableRow><TableCell><span className="no-results">No Dynos</span></TableCell></TableRow>
              ) : this.renderFormations()
            )}
          </TableBody>
        </Table>
        <ConfirmationModal
          className="error"
          open={this.state.submitFail}
          onOk={this.handleDialogClose}
          message={this.state.submitMessage}
          title="Error"
        />
        <Snackbar
          className="formation-snack"
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

Formations.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
