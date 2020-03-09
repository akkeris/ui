import React from 'react';
import PropTypes from 'prop-types';
import { grey } from '@material-ui/core/colors';
import {
  Snackbar, CircularProgress, Table, TableBody, TableRow, TableCell,
  IconButton, Dialog, Button, DialogActions, DialogContent, DialogTitle,
  Tooltip, TablePagination, TableFooter, Divider, Typography, Collapse,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import BuildOutputIcon from '@material-ui/icons/Assignment';
import BuildIcon from '@material-ui/icons/Build';
import ReleaseIcon from '@material-ui/icons/Backup';
import RevertIcon from '@material-ui/icons/Replay';
import RebuildIcon from '../Icons/RebuildIcon';
import Logs from './Logs';
import NewBuild from './NewBuild';
import ConfirmationModal from '../ConfirmationModal';
import ReleaseStatus from './ReleaseStatus';
import GlobalStyles from '../../config/GlobalStyles';
import { getDateDiff } from '../../services/util/index';
import BaseComponent from '../../BaseComponent';

function addRestrictedTooltip(title, placement, children) {
  return (
    <Tooltip title={title} placement={placement}>
      <div style={{ display: 'inline' }}>{children}</div>
    </Tooltip>
  );
}

const style = {
  iconButton: {
    color: 'black',
  },
  rebuildIcon: {
    width: '48px',
    height: '48px',
    size: {
      fontSize: '2rem',
    },
  },
  table: {
    overflow: 'visible',
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
      marginTop: '10px',
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
  mainIcon: {
    position: 'absolute',
    opacity: 0.5,
    top: '50%',
    marginTop: '-12px',
  },
  collapse: {
    container: {
      display: 'flex', flexDirection: 'column',
    },
    header: {
      container: {
        display: 'flex', alignItems: 'center', padding: '6px 26px 0px',
      },
      title: {
        flex: 1,
      },
    },
  },
  header: {
    container: {
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 24px',
    },
    title: {
      flex: 1,
    },
    actions: {
      container: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 0,
      },
      button: {
        width: '50px',
      },
    },
  },
  logContent: {
    padding: '0px', margin: '0px',
  },
  release: {
    root: {
      display: 'flex', padding: '12px 24px', minHeight: '64px', alignItems: 'center', justifyContent: 'space-between',
    },
    icon: {
      root: {
        width: '25px', paddingRight: '24px', flexGrow: '0',
      },
      inner: {
        position: 'relative', height: '100%',
      },
      releaseIcon: {
        position: 'absolute', opacity: 0.5, top: '50%', marginTop: '-12px',
      },
    },
    info: {
      root: {
        fontSize: '0.8125rem', lineHeight: '10px', flexGrow: '1',
      },
    },
    actions: {
      root: {
        flexGrow: '0', display: 'flex', justifyContent: 'space-between',
      },
    },
  },
  textEllipses: {
    color: 'rgb(88, 96, 105)',
    maxWidth: '700px',
    overflowY: 'hidden',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
    verticalAlign: 'middle',
    lineHeight: '1rem',
    boxSizing: 'border-box',
    marginTop: '0.5rem',
  },
};

export default class Releases extends BaseComponent {
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
      rowsPerPage: 15,
      page: 0,
      isElevated: false,
      restrictedSpace: false,
      confirmRebuildOpen: false,
      rebuildRelease: null,
      collapse: true,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getReleases();

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

    this.setState({ isElevated, restrictedSpace }); // eslint-disable-line 
  }

  getReleases = async () => {
    try {
      const { data: builds } = await this.api.getBuilds(this.props.app.name);
      let { data: releases } = await this.api.getReleases(this.props.app.name);

      releases = (await Promise.all(releases
        .map(async (release) => {
          const build = builds.filter(b => b.id === release.slug.id);
          if (build.length === 0 && release.slug && release.slug.id) {
            // this build may have come from a promotion.
            build[0] = (await this.api.getSlug(release.slug.id)).data;
            release.promoted = true; // eslint-disable-line
          }
          const source_blob = build[0] ? build[0].source_blob : {};  // eslint-disable-line 
          return {
            release: true, slug: build[0] || {}, source_blob, ...release,
          };
        })))
        .concat(builds
          .filter(a => !releases.some(x => x.slug.id === a.id))
          .map(a => Object.assign({
            releases: releases.filter(b => b.slug.id === a.id),
          }, a)))
        .sort((a, b) => (new Date(a.created_at).getTime() < new Date(b.created_at) ? 1 : -1));
      this.setState({
        releases,
        loading: false,
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  handleConfirmRebuild = (release) => {
    this.setState({ confirmRebuildOpen: true, rebuildRelease: release });
  }

  handleCancelRebuild = () => {
    this.setState({ confirmRebuildOpen: false, rebuildRelease: null });
  }

  handleRebuild = async () => {
    try {
      this.setState({ confirmRebuildOpen: false });
      await this.api.rebuild(this.props.app.name, this.state.rebuildRelease);
      this.reload('Rebuilding image...');
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
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
    try {
      this.setState({ revert: null, revertOpen: false, loading: true });
      await this.api.createRelease(
        this.props.app.name,
        null,
        this.state.revert.id,
        `Rollback to release v${this.state.revert.version}`,
      );
      this.getReleases();
      this.setState({ loading: false });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  handleClose() {
    this.setState({ logsOpen: false });
  }

  handleRevertClose() {
    this.setState({ revert: null, revertOpen: false });
  }

  handleNewBuild() {
    this.setState({ collapse: false, new: true });
  }

  handleNewBuildCancel() {
    this.setState({ collapse: true });
  }

  handleBuildLogs(release) {
    this.setState({
      logsOpen: true,
      release,
      title: `Logs for v${release.id}`,
    });
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
      snackOpen: true,
      message,
      collapse: true,
    });
    this.getReleases();
  }

  refresh() {
    this.setState({
      loading: true,
      new: false,
      snackOpen: false,
      collapse: true,
    });
    this.getReleases();
  }

  renderReleases(page, rowsPerPage) {
    return this.state.releases
      .slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
      .map((release, index) => {
        const rowColor = release.current ? grey[50] : null;
        const info1 = [
          release.description,
          release.source_blob.author,
        ];
        const info2 = [
          release.source_blob.message ? release.source_blob.message.replace(/\s+/g, ' ') : '',
        ].filter(x => x && x !== '').map(x => x.toString().replace(/\n/g, ' '));
        return (
          <TableRow hover className={`r${index}`} key={release.id} style={{ backgroundColor: rowColor }}>
            <TableCell style={style.release.root}>
              <div style={style.release.icon.root}>
                <div style={style.release.icon.inner}>
                  {!release.release ? (
                    <BuildIcon style={style.mainIcon} />
                  ) : (
                    <ReleaseIcon style={style.release.icon.releaseIcon} />
                  )}
                </div>
              </div>
              <div style={style.release.info.root}>
                {!release.release ? `Build ${release.status} - ` : `Deployed v${release.version} - `} {info1.join(' ')}
                {release.source_blob && release.source_blob.version ? (
                  <a style={{ textDecoration: 'none', marginLeft: '0.5em' }} href={release.source_blob.version}>
                    <pre style={GlobalStyles.CommitLink}><code>#{release.source_blob.commit.substring(0, 7)}</code></pre> { /* eslint-disable-line */ }
                  </a>
                ) : ''}&nbsp;<ReleaseStatus release={release} />
                <div style={style.textEllipses}>{info2.join('\n')}</div>
                <div style={style.tableCell.sub}> {getDateDiff(new Date(release.created_at))} </div> { /* eslint-disable-line */ }
              </div>
              <div style={style.release.actions.root}>
                {!release.current && release.release &&
                <Tooltip title="Rollback" placement="top-end">
                  <IconButton
                    color="default"
                    className="revert"
                    onClick={() => this.handleRevertOpen(release)}
                  ><RevertIcon />
                  </IconButton>
                </Tooltip>
                }
                {!release.release &&
                <Tooltip title="Rebuild" placement="top-end">
                  <IconButton
                    disabled={!(release.slug && release.slug.id)}
                    onClick={() => this.handleConfirmRebuild(release)}
                    style={style.rebuildIcon}
                    color="default"
                    className="rebuild"
                  ><RebuildIcon />
                  </IconButton>
                </Tooltip>
                }
                <Tooltip title="Build Logs" placement="top-end">
                  <IconButton
                    color="default"
                    className="logs"
                    onClick={() => this.handleBuildLogs(release)}
                    disabled={release.promoted}
                  ><BuildOutputIcon />
                  </IconButton>
                </Tooltip>

              </div>
            </TableCell>
          </TableRow>
        );
      });
  }

  renderLogs() {
    const { logsOpen, release, title } = this.state;
    return (
      <Dialog
        className="logs-dialog"
        open={logsOpen}
        onClose={() => { this.handleClose(); }}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle className="logs-dialog-title">{title}</DialogTitle>
        <DialogContent style={style.logContent}>
          <Logs
            build={release.slug.id}
            app={this.props.app.name}
            open={logsOpen}
          />
        </DialogContent>
        <DialogActions>
          <IconButton className="logs-dialog-close" style={style.iconButton} onClick={() => { this.handleClose(); }}>
            <RemoveIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    );
  }

  renderRevert() {
    const { revertOpen, title, revert } = this.state;
    return (
      <Dialog
        className="revert"
        open={revertOpen}
        onClose={() => { this.handleRevertClose(); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div>
            {getDateDiff(new Date(revert.created_at))} - {[
              revert.description,
              revert.source_blob.author,
              revert.source_blob.commit ? `#${revert.source_blob.commit.substring(0, 7)}` : '',
              revert.source_blob.message ? revert.source_blob.message.replace(/\s+/g, ' ') : '',
            ].filter(x => x && x !== '').map(x => x.toString().replace(/\n/g, ' ')).join(' ')}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            className="ok"
            color="primary"
            onClick={() => { this.handleRevertGo(); }}
          >Ok
          </Button>
          <Button
            className="cancel"
            color="secondary"
            onClick={() => { this.handleRevertClose(); }}
          >Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  render() {
    const {
      releases, rowsPerPage, page, isElevated, restrictedSpace,
    } = this.state;
    let newReleaseButton;
    if (!restrictedSpace || isElevated) {
      newReleaseButton = (
        <Tooltip title="New Release" placement="bottom-end">
          <IconButton style={style.iconButton} className="new-build" onClick={() => { this.handleNewBuild(); }}><AddIcon /></IconButton>
        </Tooltip>
      );
    } else {
      // Wrap the new release button in a tooltip to avoid confusion as to why it is disabled
      newReleaseButton = addRestrictedTooltip(
        'Elevated access required', 'right', (
          <IconButton
            disabled
            style={{ ...style.iconButton, opacity: 0.35 }}
            className="new-build"
          >
            <AddIcon />
          </IconButton>
        ),
      );
    }

    return (
      <div>
        <Collapse
          unmountOnExit
          mountOnEnter
          onExited={() => this.setState({ new: false })}
          in={!this.state.collapse}
        >
          <div style={style.collapse.container}>
            <div style={style.collapse.header.container}>
              <Typography style={style.collapse.header.title} variant="overline">{this.state.new && 'New Build'}</Typography>
              <div >
                {this.state.new && (
                  <IconButton style={style.iconButton} className="build-cancel" onClick={() => { this.handleNewBuildCancel(); }}><RemoveIcon /></IconButton>
                )}
              </div>
            </div>
            <div>
              {this.state.new && (
                <NewBuild
                  app={this.props.app.name}
                  org={this.props.org}
                  onComplete={message => this.reload(message)}
                />
              )}
            </div>
          </div>
        </Collapse>
        <div style={style.header.container}>
          <Typography style={style.header.title} variant="overline">Release</Typography>
          {this.state.collapse && (
            <div style={style.header.actions.container}>
              <div style={style.header.actions.button}>
                {newReleaseButton}
              </div>
            </div>
          )}
        </div>
        <Divider />
        {this.state.loading ? (
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        ) : (
          <Table className="release-list" style={style.table}>
            <TableBody>
              {(!this.state.releases || this.state.releases.length === 0) ? (
                <TableRow><TableCell><span className="no-results">No Releases</span></TableCell></TableRow>
              ) : this.renderReleases(page, rowsPerPage)}
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
        )}
        <ConfirmationModal
          title="Rebuild"
          className="rebuild-confirm"
          open={this.state.confirmRebuildOpen}
          onOk={this.handleRebuild}
          onCancel={this.handleCancelRebuild}
          message="Are you sure you want to rebuild this?"
        />
        <Snackbar
          className="release-snack"
          open={this.state.snackOpen}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={() => { this.handleSnackClose(); }}
        />
        {this.state.release && this.renderLogs()}
        {this.state.revert && this.renderRevert()}
      </div>
    );
  }
}

Releases.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  accountInfo: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  org: PropTypes.string.isRequired,
};
