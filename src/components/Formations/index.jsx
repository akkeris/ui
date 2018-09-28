import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {
  CircularProgress, MenuItem, Snackbar, IconButton, Button, Paper,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Table, TableBody, TableHead, TableRow, TableCell,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import api from '../../services/api';
import util from '../../services/util';
import NewFormation from './NewFormation';
import DynoType from './DynoType';

const muiTheme = createMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  overrides: {
    MuiTable: {
      root: {
        tableLayout: 'fixed',
      },
    },
    MuiPaper: {
      root: {
        boxShadow: 'none !important',
      },
    },
  },
});

const style = {
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
      height: '350px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
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
    this.loadFormations();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getSizes() {
    return this.state.sizes.map(size =>
      (<MenuItem
        className={size.name}
        key={size.name}
        value={size.name}
      >{size.resources.limits.memory}</MenuItem>));
  }

  getFormations() {
    return this.state.formations.map(formation => (
      <DynoType
        formation={formation}
        dynos={util.filterDynosByFormation(this.state.dynos, formation)}
        onComplete={this.reload}
        onAlert={this.info}
        key={formation.id}
        sizeList={this.getSizes()}
        onError={this.handleError}
        app={this.props.app}
      />
    ));
  }

  loadFormations() {
    Promise.all([
      api.getFormations(this.props.app),
      api.getFormationSizes(),
      api.getDynos(this.props.app),
    ])
      .then(([r1, r2, r3]) => {
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
      });
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

  reload = (message) => {
    this.setState({ loading: true });
    Promise.all([
      api.getFormations(this.props.app),
      api.getDynos(this.props.app),
    ])
      .then(([r1, r2]) => {
        const formations = r1.data.sort((a, b) => (a.type < b.type ? -1 : 1));
        const dynos = r2.data;
        if (this._isMounted) {
          this.setState({
            formations,
            dynos,
            loading: false,
            new: false,
            open: true,
            message,
          });
        }
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
          {!this.state.new && (
            <Paper zDepth={0}>
              <IconButton className="new-formation" onClick={this.handleNewFormation} tooltip="New Formation" tooltipPosition="bottom-left"><AddIcon /></IconButton>
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton className="cancel" onClick={this.handleNewFormationCancel}><RemoveIcon /></IconButton>
              <NewFormation app={this.props.app} onComplete={this.reload} />
            </div>
          )}
          <Table className="formation-list" >
            <TableHead>
              <TableRow>
                <TableCell>Formation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody hover>
              {this.getFormations()}
            </TableBody>
          </Table>
          <Dialog
            className="error"
            open={this.state.submitFail}
          >
            <DialogTitle>
              Error
            </DialogTitle>
            <DialogContent>
              <DialogContentText>{this.state.submitMessage}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                className="ok"
                onClick={this.handleDialogClose}
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            className="formation-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onClose={this.handleRequestClose}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

Formations.propTypes = {
  app: PropTypes.string.isRequired,
};
