import React from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, Snackbar, IconButton, TableCell, Tooltip, Typography, Collapse,
  Table, TableBody, TableRow,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import ReloadIcon from '@material-ui/icons/Refresh';
import { filterDynosByFormation } from '../../services/util';
import NewFormation from './NewFormation';
import DynoType from './DynoType';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';

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
    tableCell: {
      padding: '0px',
    },
    div: {
      height: '450px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
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

export default class Formations extends BaseComponent {
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
      collapse: true,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getFormations();
  }

  getFormations = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        this.api.getFormations(this.props.app.name),
        this.api.getFormationSizes(),
        this.api.getDynos(this.props.app.name),
      ]);
      const formations = r1.data.filter(a => !a.oneoff).sort((a, b) => (a.type < b.type ? -1 : 1));
      const dynos = r3.data;
      let sizes = [];
      r2.data.forEach((size) => {
        if (size.name.indexOf('prod') === -1) {
          sizes.push(size);
        }
      });
      sizes = sizes.sort((a, b) =>
        parseInt(a.resources.limits.memory, 10) - parseInt(b.resources.limits.memory, 10));

      this.setState({
        sizes,
        dynos,
        formations,
        loading: false,
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
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
    this.setState({ collapse: false, new: true });
  }

  handleNewFormationCancel = () => {
    this.setState({ collapse: true });
  }

  info = (message) => {
    this.setState({
      open: true,
      message,
    });
  }

  reload = async (message, noLoading) => {
    try {
      if (!noLoading) {
        this.setState({ loading: true });
      }
      const [r1, r2] = await Promise.all([
        this.api.getFormations(this.props.app.name),
        this.api.getDynos(this.props.app.name),
      ]);
      const formations = r1.data.sort((a, b) => (a.type < b.type ? -1 : 1));
      const dynos = r2.data;
      if (message) {
        this.setState({
          formations,
          dynos,
          loading: false,
          new: false,
          open: true,
          message,
          collapse: true,
        });
      } else {
        this.setState({
          formations,
          dynos,
          loading: false,
          collapse: true,
        });
      }
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  renderFormations() {
    return this.state.formations.map(formation => (
      <DynoType
        formation={formation}
        dynos={filterDynosByFormation(this.state.dynos, formation)}
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
        <Collapse
          in={!this.state.collapse}
          mountOnEnter
          unmountOnExit
          onExited={() => this.setState({ new: false })}
        >
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
          {this.state.collapse && (
            <div style={style.header.icons.container} >
              <div style={{ width: '50px' }}>
                <Tooltip title="Refresh" placement="bottom-end">
                  <IconButton style={style.iconButton} className="reload-formations" onClick={() => this.reload()}><ReloadIcon /></IconButton>
                </Tooltip>
              </div>
              <div style={{ width: '50px' }}>
                <Tooltip title="New Formation" placement="bottom-end">
                  <IconButton style={style.iconButton} className="new-formation" onClick={this.handleNewFormation}><AddIcon /></IconButton>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
        <Table className="formation-list">
          <TableBody>
            {this.state.loading ? (/* eslint-disable-line no-nested-ternary */
              <TableRow>
                <TableCell style={style.refresh.tableCell}>
                  <div style={style.refresh.div}>
                    <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
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
