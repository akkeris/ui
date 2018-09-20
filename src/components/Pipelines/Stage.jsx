import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import Button from '@material-ui/core/Button';
import Divider from 'material-ui/Divider';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import PromoteIcon from 'material-ui/svg-icons/file/cloud-upload';
import AddIcon from 'material-ui/svg-icons/content/add';

import api from '../../services/api';
import util from '../../services/util';
import ConfirmationModal from '../ConfirmationModal';
import { NewPipelineCoupling } from '../../components/Pipelines';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  tableRow: {
    height: '100px',
  },
  tableRowColumn: {
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
      height: '40px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  link: {
    textDecoration: 'none',
    color: muiTheme.palette.primary1Color,
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
    if (!prevProps.active && this.props.active) {
      this.loadPipelineCouplings();
    }
  }

  getTargets(stage) {
    if (stage !== 'production') {
      return util.filterCouplings(this.state.couplings, stages[stages.indexOf(stage) + 1]);
    }
    return null;
  }

  loadPipelineCouplings() {
    api.getPipelineCouplings(this.props.pipeline.name).then((response) => {
      const stageCouplings = util.filterCouplings(response.data, this.props.stage);
      this.setState({
        couplings: response.data,
        stageCouplings,
        loading: false,
      });
    });
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

  handleRemoveCoupling = () => {
    this.setState({ loading: true });
    api.deletePipelineCoupling(this.state.coupling.id).then(() => {
      this.reload('Removed Coupling');
    }).catch((error) => {
      this.props.onError(error.response.data);
    });
  }

  handleNewCoupling = () => {
    this.setState({ new: true });
  }

  handleSafePromoteCheck = (event, isInputChecked) => {
    this.setState({ safePromote: !isInputChecked });
  }

  handlePromote = () => {
    const targets = this.getTargets(this.state.coupling.stage);
    if (targets.length === 0) {
      this.setState({ promoteOpen: false });
      this.props.onError('No Promotion Targets', 404);
    } else {
      api.promotePipeline(
        this.props.pipeline.id,
        this.state.coupling.app.id,
        targets,
        this.state.safePromote,
      )
        .then(() => {
          this.reload(`Promoted: ${this.state.coupling.app.name} to ${targets[0].stage}`);
        }).catch((error) => {
          this.setState({ promoteOpen: false });
          this.props.onError(error.response.data);
        });
    }
  }

  handleGoToApp = (app) => {
    window.location = `#/apps/${app}/info`;
  }

  handleNewCouplingCancel = () => {
    this.setState({ new: false });
  }

  reload = (message) => {
    api.getPipelineCouplings(this.props.pipeline.name).then((response) => {
      const stageCouplings = util.filterCouplings(response.data, this.props.stage);
      this.setState({
        couplings: response.data,
        stageCouplings,
        loading: false,
        new: false,
        open: false,
        promoteOpen: false,
        safePromote: true,
      });
      this.props.onAlert(message);
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
    const couplingList = this.state.stageCouplings.map((coupling) => {
      const releaseDate = new Date(coupling.release.updated_at);
      const buildDate = new Date(coupling.release.build.updated_at);
      const commitSha = coupling.release.build.commit.sha ? `Commit: ${coupling.release.build.commit.sha.substring(0, 8)}...` : `Build: ${coupling.release.build.id}`;
      const commitMessage = coupling.release.build.commit.message ? `, ${coupling.release.build.commit.message.substring(0, 60)}` : null;
      const commitAuthor = coupling.release.build.commit.author ? `, ${coupling.release.build.commit.author.substring(0, 20)}` : null;

      return (
        <TableRow className={coupling.app.name} key={coupling.id} style={style.tableRow}>
          <TableRowColumn>
            <div style={style.tableRowColumn.title}><a style={style.link} href={`#/apps/${coupling.app.name}/info`}>{coupling.app.name}</a></div>
            <div style={style.tableRowColumn.sub}>id: {coupling.id}</div>
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
              <div style={style.tableRowColumn.last}>Release: {coupling.release.version}</div>
            )}
          </TableRowColumn>
          <TableRowColumn style={style.tableRowColumn.button}>
            {coupling.stage !== 'production' && (
              <div>
                <Button
                  variant="contained"
                  style={style.tableRowColumn.button}
                  className="promote"
                  label="Promote"
                  onClick={() => this.handlePromoteConfirmation(coupling)}
                  primary
                  icon={<PromoteIcon />}
                />
              </div>
            )}
          </TableRowColumn>
          <TableRowColumn style={style.tableRowColumn.icon}>
            <div style={style.tableRowColumn.end}>
              <IconButton
                className="remove"
                onClick={() => this.handleConfirmation(coupling)}
              >
                <RemoveIcon />
              </IconButton>
            </div>
          </TableRowColumn>
        </TableRow>
      );
    });

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Table className={`${this.props.stage}-coupling-list`} wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
            <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
              {couplingList}
            </TableBody>
          </Table>
          <Divider />
          {!this.state.new && (
            <Paper zDepth={0}>
              <IconButton className={`${this.props.stage}-new-coupling`} onClick={this.handleNewCoupling} tooltip="New Coupling" tooltipPosition="bottom-left"><AddIcon /></IconButton>
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
            actions={
              <Checkbox
                className="force-check"
                label="Force"
                checked={!this.state.safePromote}
                onCheck={this.handleSafePromoteCheck}
                style={{ maxWidth: '120', textAlign: 'left', marginLeft: '12' }}
                iconStyle={{ textAlign: 'left' }}
              />}
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
