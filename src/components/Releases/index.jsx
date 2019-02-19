import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { grey, teal } from '@material-ui/core/colors';
import {
  Paper, Snackbar, CircularProgress, Table, TableBody, TableRow, TableCell,
  IconButton, Dialog, Button, DialogActions, DialogContent, DialogTitle,
  Tooltip, TablePagination, TableFooter,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import BuildOutputIcon from '@material-ui/icons/Assignment';
import BuildIcon from '@material-ui/icons/Build';
import ReleaseIcon from '@material-ui/icons/Backup';
import RevertIcon from '@material-ui/icons/Replay';
import PendingIcon from '@material-ui/icons/Lens';
import ErrorIcon from '@material-ui/icons/Cancel';
import SuccessIcon from '@material-ui/icons/CheckCircle';

import Logs from './Logs';
import api from '../../services/api';
import NewBuild from './NewBuild';
import NewAutoBuild from './NewAutoBuild';

import AutoBuildIcon from '../Icons/GitIcon';

function addRestrictedTooltip(title, placement, children) {
  return (
    <Tooltip title={title} placement={placement}>
      <div style={{ display: 'inline' }}>{children}</div>
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
        width: '80%',
        maxWidth: 'none',
      },
      paperWidthSm: {
        width: '80%',
        maxWidth: 'none',
      },
    },
  },
});

const releaseLimit = 20;

const style = {
  iconButton: {
    color: 'black',
  },
  tableRow: {
    height: '58px',
  },
  progressLabel: {
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  tableCell: {
    title: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
    icon: {
      padding: '1px 12px',
      width: '52px',
      textAlign: 'center',
      overflow: 'visible',
    },
    div: {
      width: '58px',
      overflow: 'visible',
      textAlign: 'center',
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
  status: {
    position: 'absolute',
    transform: 'scale(0.5)',
    border: '0px',
    borderRadius: '12px',
    backgroundColor: 'white',
    left: '9px',
    top: '50%',
    marginTop: '-6px',
  },
  mainIcon: {
    position: 'absolute',
    opacity: 0.5,
    top: '50%',
    marginTop: '-12px',
  },
};

function getDateDiff(date /* : Date */) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} years ago`;
  }
  if (interval === 1) {
    return `${interval} year ago`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months ago`;
  }
  if (interval === 1) {
    return `${interval} month ago`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days ago`;
  }
  if (interval === 1) {
    return `${interval} day ago`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours ago`;
  }
  if (interval === 1) {
    return `${interval} hour ago`;
  }
  interval = Math.floor(seconds / 60);
  return `${interval} minutes ago`;
}

export default class Releases extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      releases: [],
      loading: true,
      logsOpen: false,
      snackOpen: false,
      message: '',
      new: false,
      release: null,
      title: '',
      revert: null,
      revertOpen: false,
      newAuto: false,
      rowsPerPage: 15,
      page: 0,
      isElevated: false,
      restrictedSpace: false,
    };
    this.getReleases();
  }

  componentDidMount() {
    this._isMounted = true;

    const { app, accountInfo } = this.props;

    // If this is a production app, check for the elevated_access role to determine
    // whether or not to enable creating arbitrary builds

    // There is still an API call on the backend that controls access to the actual
    // creation of a build, this is merely for convienence.

    let isElevated = false;
    let restrictedSpace = false;
    if (app.space.compliance.includes('prod') || app.space.compliance.includes('socs')) {
      // If we don't have the elevated_access object in the accountInfo object,
      // default to enabling the button (access will be controlled on the API)
      isElevated = (accountInfo && 'elevated_access' in accountInfo) ? accountInfo.elevated_access : true;
      restrictedSpace = true;
    }

    this.setState({ isElevated, restrictedSpace }); // eslint-disable-line react/no-did-mount-set-state
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getReleases = async () => {
    await api.getApp(this.props.app.name);
    let { data: builds } = await api.getBuilds(this.props.app.name);
    let releases = await api.getReleases(this.props.app.name);
    releases = releases.sort((a, b) => (
      new Date(a.created_at).getTime() > new Date(b.created_at).getTime() ? 1 : -1
    )).map(x => Object.assign(x.slug, {
      id: x.id,
      created_at: x.created_at,
      version: x.version,
      description: x.description,
      release: true,
      current: x.current,
    }));
    // fitler out builds with a release
    // builds = builds.filter((a) => !releases.some((x) => x.slug.id === a.id));
    builds = builds.map(a => Object.assign({
      releases: releases.filter(b => b.slug.id === a.id),
    }, a));

    let releaseAndBuilds = builds.concat(releases).sort((a, b) => (
      new Date(a.created_at).getTime() < new Date(b.created_at) ? 1 : -1
    ));

    if (releaseAndBuilds.length > releaseLimit) {
      releaseAndBuilds = releaseAndBuilds.slice(0, releaseLimit);
    }
    if (this._isMounted) {
      this.setState({
        releases: releaseAndBuilds,
        loading: false,
      });
    }
  }

  handleRevertOpen(release) {
    this.setState({
      revertOpen: true,
      revert: release,
      title: `Rollback to release v${release.version}`,
    });
  }

  handleRevertGo = async () => {
    this.setState({ revert: null, revertOpen: false, loading: true });
    await api.createRelease(
      this.props.app.name,
      null,
      this.state.revert.id,
      `Rollback to release v${this.state.revert.version}`,
    );
    this.getReleases();
    this.setState({ loading: false });
  }

  handleClose() {
    this.setState({ logsOpen: false });
  }

  handleRevertClose() {
    this.setState({ revert: null, revertOpen: false });
  }

  handleNewBuild() {
    this.setState({ new: true });
  }

  handleNewBuildCancel() {
    this.setState({ new: false });
  }

  handleNewAutoBuild = () => {
    this.setState({ newAuto: true });
  }

  handleNewAutoBuildCancel = () => {
    this.setState({ newAuto: false });
  }

  handleOpen(release) {
    this.setState({
      logsOpen: true,
      release,
      title: `Logs for v${release.id}`,
    });
  }

  handleNewRelease() {
    this.setState({ new: true });
  }

  handleNewReleaseCancel() {
    this.setState({ new: false });
  }

  handleSnackClose() {
    this.setState({ snackOpen: false });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  reload = (message) => {
    this.setState({
      loading: false,
      new: false,
      newAuto: false,
      snackOpen: true,
      message,
    });
    this.getReleases();
  }

  renderReleases(page, rowsPerPage) {
    return this.state.releases.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map((release, index) => {
      // release status indicator
      let releaseColor = grey[500];
      let StatusIcon = PendingIcon;
      switch (release.status) {
        case 'succeeded':
          releaseColor = 'limegreen';
          StatusIcon = SuccessIcon;
          break;
        case 'failed':
          releaseColor = 'red';
          StatusIcon = ErrorIcon;
          break;
        case 'pending':
          releaseColor = 'orange';
          break;
        default:
          releaseColor = grey[500];
          break;
      }
      let current = null;
      if (release.current) {
        current = teal[50];
      }

      const info1 = [
        release.description,
        release.source_blob.author,
      ];
      const info2 = [
        release.source_blob.commit ? `#${release.source_blob.commit.substring(0, 7)}` : '',
        release.source_blob.message ? release.source_blob.message.replace(/\s+/g, ' ') : '',
      ].filter(x => x && x !== '').map(x => x.toString().replace(/\n/g, ' '));

      const statusIconStyle = Object.assign({
        fillColor: releaseColor,
        color: releaseColor,
      }, style.status);
      return (
        <TableRow hover className={`r${index}`} key={release.id} style={{ backgroundColor: current, height: '84px' }}>
          <TableCell style={{ width: '28px', paddingLeft: '24px', paddingRight: '0px' }}>
            <div style={{ position: 'relative', height: '100%' }}>
              {!release.release ? (<BuildIcon style={style.mainIcon} />) : (<ReleaseIcon style={{
                position: 'absolute', opacity: 0.5, top: '50%', marginTop: '-12px',
              }}
              />)}
              <StatusIcon style={statusIconStyle} />
            </div>
          </TableCell>
          <TableCell>
            <div>
              {!release.release ? `Build ${release.status} - ` : `Deployed v${release.version} - `}
              {info1.join(' ')}
              <br />
              {info2.join(' ')}
              <div style={style.tableCell.sub}>
                {getDateDiff(new Date(release.created_at))}
              </div>
            </div>
          </TableCell>
          <TableCell style={style.tableCell.icon}>
            {!release.release &&
              <Tooltip title="Build Logs" placement="top-end">
                <IconButton style={style.iconButton} className="logs" onClick={() => this.handleOpen(release)}><BuildOutputIcon /></IconButton>
              </Tooltip>
            }
            {!release.current && release.release &&
              <Tooltip title="Rollback" placement="top-end">
                <IconButton style={style.iconButton} className="revert" onClick={() => this.handleRevertOpen(release)}><RevertIcon /></IconButton>
              </Tooltip>
            }
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    const { releases, rowsPerPage, page, isElevated, restrictedSpace } = this.state;
    const actions = [
      <IconButton style={style.iconButton} onClick={() => { this.handleClose(); }}>
        <RemoveIcon />
      </IconButton>,
    ];
    const actionsRevert = [
      <Button
        className="ok"
        color="primary"
        onClick={() => { this.handleRevertGo(); }}
      >Ok</Button>,
      <Button
        className="cancel"
        color="secondary"
        onClick={() => { this.handleRevertClose(); }}
      >Cancel</Button>,
    ];

    let newReleaseButton;
    if (!restrictedSpace || isElevated) {
      newReleaseButton = (
        <Tooltip title="New Release" placement="bottom-end">
          <IconButton style={style.iconButton} className="new-build" onClick={() => { this.handleNewBuild(); }}><AddIcon /></IconButton>
        </Tooltip>
      );
    } else {
      // Wrap the new release button in a tooltip to avoid confusion as to why it is disabled
      newReleaseButton = addRestrictedTooltip('Elevated access required', 'right', (
        <IconButton
          disabled
          style={{ ...style.iconButton, opacity: 0.35 }}
          className="new-build"
          onClick={() => { this.handleNewBuild(); }}
        >
          <AddIcon />
        </IconButton>
      ));
    }

    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          {this.state.release && (
            <Dialog
              className="logs"
              open={this.state.logsOpen}
              onClose={() => { this.handleClose(); }}
            >
              <DialogTitle>{this.state.title}</DialogTitle>
              <DialogContent style={{ padding: '0px', margin: '0px' }}>
                <Logs
                  build={this.state.release.slug.id}
                  app={this.props.app.name}
                  open={this.state.logsOpen}
                />
              </DialogContent>
              <DialogActions>{actions}</DialogActions>
            </Dialog>
          )}
          {this.state.revert && (
            <Dialog
              className="revert"
              open={this.state.revertOpen}
              onClose={() => { this.handleRevertClose(); }}
            >
              <DialogTitle>{this.state.title}</DialogTitle>
              <DialogContent>
                <div>
                  {getDateDiff(new Date(this.state.revert.created_at))} - {[
                    this.state.revert.description,
                    this.state.revert.source_blob.author,
                    this.state.revert.source_blob.commit ? `#${this.state.revert.source_blob.commit.substring(0, 7)}` : '',
                    this.state.revert.source_blob.message ? this.state.revert.source_blob.message.replace(/\s+/g, ' ') : '',
                  ].filter(x => x && x !== '').map(x => x.toString().replace(/\n/g, ' ')).join(' ')}
                </div>
              </DialogContent>
              <DialogActions>{actionsRevert}</DialogActions>
            </Dialog>
          )}
          {(!this.state.new && !this.state.newAuto) && (
            <Paper elevation={0}>
              <Tooltip title="Attach to Repo" placement="bottom-end">
                <IconButton style={style.iconButton} className="new-autobuild" onClick={() => { this.handleNewAutoBuild(); }}><AutoBuildIcon /></IconButton>
              </Tooltip>
              {newReleaseButton}
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton style={style.iconButton} className="build-cancel" onClick={() => { this.handleNewBuildCancel(); }}><RemoveIcon /></IconButton>
              <NewBuild
                app={this.props.app.name}
                org={this.props.org}
                onComplete={
                  (message) => { this.reload(message); }
                }
              />
            </div>
          )}
          {this.state.newAuto && (
            <div>
              <IconButton style={style.iconButton} className="auto-cancel" onClick={() => { this.handleNewAutoBuildCancel(); }}><RemoveIcon /></IconButton>
              <NewAutoBuild
                app={this.props.app.name}
                onComplete={(message) => { this.reload(message); }}
              />
            </div>
          )}
          <Table className="release-list" style={{ overflow: 'visible' }}>
            <TableBody>
              {this.renderReleases(page, rowsPerPage)}
            </TableBody>
            {releases.length !== 0 && (
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[15, 25, 50]}
                    colSpan={3}
                    count={releases.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            )}
          </Table>
          <Snackbar
            className="release-snack"
            open={this.state.snackOpen}
            message={this.state.message}
            autoHideDuration={3000}
            onClose={() => { this.handleSnackClose(); }}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

Releases.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  accountInfo: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  org: PropTypes.string.isRequired,
};
