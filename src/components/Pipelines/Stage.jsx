import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import PropTypes from 'prop-types';
import { MuiThemeProvider } from '@material-ui/core/styles';
import {
  CircularProgress, IconButton, Button, Paper, Divider, FormControlLabel,
  Table, TableBody, TableRow, TableCell, Tooltip, Checkbox,
} from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Clear';
import PromoteIcon from '@material-ui/icons/CloudUpload';
import AddIcon from '@material-ui/icons/Add';

import api from '../../services/api';
import util from '../../services/util';
import ConfirmationModal from '../ConfirmationModal';
import { NewPipelineCoupling } from '../../components/Pipelines';
import History from '../../config/History';

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
    MuiCheckbox: {
      root: {
        padding: '2px 12px',
      },
    },
  },
});

const style = {
  tableRow: {
    height: '100px',
  },
  tableCell: {
    title: {
      fontSize: '16px',
      paddingTop: '1em',
    },
    last: {
      paddingBottom: '1em',
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
    button: {
      width: '140px',
    },
  },
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '200px',
      display: 'flex',
      alignItems: 'center',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  link: {
    textDecoration: 'none',
  },
};

const stages = [
  'review',
  'development',
  'staging',
  'production',
];

export default class Stage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      new: false,
      open: false,
      promoteOpen: false,
      couplings: [],
      coupling: null,
      stageCouplings: [],
      safePromote: true,
    };
  }

  componentDidMount() {
    if (this.props.active) {
      this.loadPipelineCouplings();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.stage !== this.props.stage) {
      this.loadPipelineCouplings();
    }
  }

  getTargets(stage) {
    if (stage !== 'production') {
      return util.filterCouplings(this.state.couplings, stages[stages.indexOf(stage) + 1]);
    }
    return null;
  }

  loadPipelineCouplings = async () => {
    const { data: couplings } = await api.getPipelineCouplings(this.props.pipeline.name);
    const stageCouplings = util.filterCouplings(couplings, this.props.stage);
    this.setState({ couplings, stageCouplings, loading: false });
  }

  handleConfirmation = (coupling) => {
    this.setState({
      open: true,
      coupling,
    });
  }

  handleCancelConfirmation = () => {
    this.setState({
      open: false,
      coupling: null,
    });
  }

  handleError = (message) => {
    this.props.onError(message);
    this.setState({ new: false });
  }

  handlePromoteConfirmation = (coupling) => {
    this.setState({
      promoteOpen: true,
      coupling,
    });
  }

  handlePromoteCancelConfirmation = () => {
    this.setState({
      promoteOpen: false,
      coupling: null,
      safePromote: true,
    });
  }

  handleRemoveCoupling = async () => {
    this.setState({ loading: true });
    try {
      await api.deletePipelineCoupling(this.state.coupling.id);
      this.reload('Removed Coupling');
    } catch (error) {
      this.props.onError(error.response.data);
    }
  }

  handleNewCoupling = () => {
    this.setState({ new: true });
  }

  handleSafePromoteCheck = (event, isInputChecked) => {
    this.setState({ safePromote: !isInputChecked });
  }

  handlePromote = async () => {
    const targets = this.getTargets(this.state.coupling.stage);
    if (targets.length === 0) {
      this.setState({ promoteOpen: false });
      this.props.onError('No Promotion Targets', 404);
    } else {
      this.setState({ loading: true });
      try {
        await api.promotePipeline(
          this.props.pipeline.id,
          this.state.coupling.app.id,
          targets,
          this.state.safePromote,
        );
        this.reload(`Promoted: ${this.state.coupling.app.name} to ${targets[0].stage}`);
      } catch (error) {
        this.setState({ promoteOpen: false, loading: false });
        this.props.onError(error.response.data);
      }
    }
  }

  handleGoToApp = (app) => {
    History.get().push(`/apps/${app}/info`);
  }

  handleNewCouplingCancel = () => {
    this.setState({ new: false });
  }

  reload = async (message) => {
    const { data: couplings } = await api.getPipelineCouplings(this.props.pipeline.name);
    const stageCouplings = util.filterCouplings(couplings, this.props.stage);
    this.setState({
      couplings,
      stageCouplings,
      loading: false,
      new: false,
      open: false,
      promoteOpen: false,
      safePromote: true,
    });
    this.props.onAlert(message);
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={theme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    }

    const couplingList = this.state.stageCouplings.map((coupling) => {
      const releaseDate = new Date(coupling.release.updated_at);
      const buildDate = new Date(coupling.release.build.updated_at);
      const commitSha = coupling.release.build.commit.sha ? `Commit: ${coupling.release.build.commit.sha.substring(0, 8)}...` : `Build: ${coupling.release.build.id}`;
      const commitMessage = coupling.release.build.commit.message ? `, ${coupling.release.build.commit.message.substring(0, 60)}` : null;
      const commitAuthor = coupling.release.build.commit.author ? `, ${coupling.release.build.commit.author.substring(0, 20)}` : null;

      console.log(this.context);

      return (
        <TableRow hover className={coupling.app.name} key={coupling.id} style={style.tableRow}>
          <TableCell>
            <div style={style.tableCell.title}><a style={style.link} href={`/apps/${coupling.app.name}/info`}>{coupling.app.name}</a></div>
            <div style={style.tableCell.sub}>id: {coupling.id}</div>
            {coupling.release.updated_at && (
              <div>
                Released on: {releaseDate.toLocaleString()},
                Built on: {buildDate.toLocaleString()}
              </div>
            )}
            {coupling.release.build.commit.sha && (
              <div>
                {commitSha} {commitAuthor} {commitMessage}
              </div>
            )}
            {coupling.release.version && (
              <div style={style.tableCell.last}>Release: {coupling.release.version}</div>
            )}
          </TableCell>
          <TableCell style={style.tableCell.button}>
            {coupling.stage !== 'production' && (
              <div>
                <Button
                  variant="contained"
                  style={style.tableCell.button}
                  className="promote"
                  onClick={() => this.handlePromoteConfirmation(coupling)}
                  color="primary"
                ><PromoteIcon style={{ paddingRight: '10px' }} />Promote</Button>
              </div>
            )}
          </TableCell>
          <TableCell style={style.tableCell.icon}>
            <div style={style.tableCell.end}>
              <IconButton
                className="remove"
                onClick={() => this.handleConfirmation(coupling)}
              >
                <RemoveIcon />
              </IconButton>
            </div>
          </TableCell>
        </TableRow>
      );
    });

    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Table className={`${this.props.stage}-coupling-list`}>
            <TableBody>
              {couplingList}
            </TableBody>
          </Table>
          <Divider />
          {!this.state.new && (
            <Paper elevation={0}>
              <Tooltip title="New Coupling" placement="left">
                <IconButton className={`${this.props.stage}-new-coupling`} onClick={this.handleNewCoupling}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          )}
          {this.state.new && (
            <div>
              <IconButton className={`${this.props.stage}-cancel`} onClick={this.handleNewCouplingCancel}><RemoveIcon /></IconButton>
              <NewPipelineCoupling
                onError={this.handleError}
                pipeline={this.props.pipeline.name}
                onComplete={this.reload}
                stage={this.props.stage}
              />
            </div>
          )}
          <ConfirmationModal
            className={`${this.props.stage}-promote-confirm`}
            open={this.state.promoteOpen}
            onOk={this.handlePromote}
            onCancel={this.handlePromoteCancelConfirmation}
            message="Are you sure you want to promote?"
            title="Promote"
            loading={this.state.loading}
            actions={
              <FormControlLabel
                control={
                  <Checkbox
                    className="force-check"
                    checked={!this.state.safePromote}
                    onChange={this.handleSafePromoteCheck}
                    style={{ maxWidth: '120', textAlign: 'left', marginLeft: '12' }}
                    iconStyle={{ textAlign: 'left' }}
                  />}
                label="Force"
              />
            }
          />
          <ConfirmationModal
            className={`${this.props.stage}-remove-confirm`}
            open={this.state.open}
            onOk={this.handleRemoveCoupling}
            onCancel={this.handleCancelConfirmation}
            message="Are you sure you want to delete this coupling?"
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

Stage.propTypes = {
  pipeline: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  stage: PropTypes.string.isRequired,
  onAlert: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
};
