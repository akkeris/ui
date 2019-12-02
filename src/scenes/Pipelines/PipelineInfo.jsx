import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconButton, CircularProgress, Grid, Paper, Typography, Link } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ForwardIcon from '@material-ui/icons/Forward';
import RemoveIcon from '@material-ui/icons/Delete';
import ReactGA from 'react-ga';
import ConfirmationModal from '../../components/ConfirmationModal';
import GlobalStyles from '../../config/GlobalStyles.jsx'; // eslint-disable-line import/extensions
import { Stage } from '../../components/Pipelines';
import api from '../../services/api';
import util from '../../services/util';
import CreateOrUpdatePipelineCoupling from '../../components/Pipelines/CreateOrUpdatePipelineCoupling';
import History from '../../config/History';

const innerPanelStyle = { ...GlobalStyles.InnerPanel, ...GlobalStyles.PaddedInnerPanel };
const subtleSubHeaderStyle = { ...GlobalStyles.SubHeader, ...GlobalStyles.FairlySubtle };
const originalState = {
  loading: true,
  delete: false,
  pipeline: null,
  new: null,
  error: null,
  stages: {},
  isElevated: false,
};

export default class PipelineInfo extends Component {
  static renderLoading() {
    return (
      <Paper style={GlobalStyles.MainPanel}>
        <div style={innerPanelStyle}>
          <CircularProgress style={{ ...GlobalStyles.CenteredCircularProgress, marginTop: '3rem' }} status="loading" />
        </div>
      </Paper>
    );
  }

  constructor(props, context) {
    super(props, context);
    this.state = util.deepCopy(originalState);
  }

  componentDidMount = () => this.refreshPipeline();

  handleError(err) {
    console.error(err); // eslint-disable-line no-console
    const error = err.response && err.response.data ? err.response.data : (err.message || err);
    this.setState({ loading: false, error });
  }

  refreshPipeline = async (loading = true) => {
    try {
      this.setState({ loading, ...util.deepCopy(originalState) });
      const { data: stages } = await api.getPipelineStages();
      const { data: pipeline } = await api.getPipeline(this.props.match.params.pipeline);
      util.updateHistory('pipelines', pipeline.id, pipeline.name);
      const accountResponse = await api.getAccount();
      const isElevated = (accountResponse.data && 'elevated_access' in accountResponse.data) ? accountResponse.data.elevated_access : true;
      this.setState({
        loading: false, pipeline, stages, isElevated,
      });
    } catch (err) {
      this.handleError(err);
    }
  };

  handleDeletePipeline = async () => {
    try {
      await api.deletePipeline(this.props.match.params.pipeline);
      ReactGA.event({ category: 'PIPELINES', action: 'Deleted pipeline' });
      History.get().push('/pipelines');
    } catch (err) {
      this.handleError(err);
    }
  };

  handleCreatePipelineCoupling = async (pipeline, coupling, stage, app, statuses) => {
    try {
      await api.createPipelineCoupling(pipeline.id, app, stage, statuses);
      ReactGA.event({ category: 'PIPELINES', action: 'Created new coupling' });
      this.refreshPipeline();
    } catch (err) {
      this.handleError(err);
    }
  }

  renderDeletePipeline() { // eslint-disable-line consistent-return
    if (this.state.delete === true) {
      return (
        <ConfirmationModal
          key={`delete-confirmation-${this.props.match.params.pipeline}`}
          className={`${this.props.match.params.pipeline}-remove-confirm confirm`}
          open={this.state.delete}
          onOk={this.handleDeletePipeline}
          onCancel={() => this.setState({ delete: false })}
          message="Are you sure you want to delete this pipeline?"
        />
      );
    }
  }

  renderStage(name) {
    return (
      <Grid className={`${name}-coupling-list ${name}-stage`} key={name} item xs={3}>
        <Typography style={GlobalStyles.VerticalAlign}>
          <div style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle, textTransform: 'uppercase' }}>{name}</div>
          <Link href="#" onClick={() => this.setState({ new: name })} style={{ ...GlobalStyles.VerticalAlign, ...GlobalStyles.HeaderSmall }}> { /* eslint-disable-line */ }
            <IconButton className={`${name}-new-coupling`} color="primary" size="small"><AddIcon fontSize="inherit" /></IconButton>
          </Link>
          <span style={{ flexGrow: '1' }} />
          {name !== 'production' ? (
            <ForwardIcon style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.VerySubtle }} fontSize="inherit" />
          ) : ''}
        </Typography>
        <Stage
          isElevated={this.state.isElevated}
          pipeline={this.state.pipeline}
          stages={this.state.stages}
          stage={name}
          onError={(err) => { this.handleError(err); }}
          refresh={() => this.refreshPipeline()}
        />
      </Grid>
    );
  }

  renderNewCoupling() { // eslint-disable-line consistent-return
    if (this.state.new !== null) {
      return (
        <CreateOrUpdatePipelineCoupling
          open={this.state.new !== null}
          pipeline={this.state.pipeline}
          stage={this.state.new}
          onCreateOrUpdate={this.handleCreatePipelineCoupling}
          onCancel={() => this.setState({ new: null })}
          onError={error => this.setState({ new: null, error })}
        />
      );
    }
  }

  renderError() {
    return (<ConfirmationModal className="error" open message={this.state.error} onOk={() => this.refreshPipeline()} title="Error" />);
  }

  render() {
    if (this.state.loading) {
      return PipelineInfo.renderLoading();
    } else if (this.state.error) {
      return this.renderError();
    }
    return (
      <Paper className="pipeline-info" style={{ ...GlobalStyles.MainPanel, ...GlobalStyles.PaperSubtleContainerStyle }}>
        <Typography variant="h3" style={{ ...GlobalStyles.TopOfPaperHeaderLarge, ...GlobalStyles.LargePadding }}>
          {this.state.pipeline.name}
          <IconButton size="small" onClick={() => this.setState({ delete: true })} className="delete-pipeline" style={{ float: 'right' }}><RemoveIcon /></IconButton>
          <sub style={subtleSubHeaderStyle}>{this.state.pipeline.id}</sub>
        </Typography>
        <Grid style={innerPanelStyle} container spacing={1}>
          {Object.keys(this.state.stages).map(stage => this.renderStage(stage, this.state.stages[stage]))} { /* eslint-disable-line max-len */ }
        </Grid>
        {this.renderDeletePipeline()}
        {this.renderNewCoupling()}
      </Paper>
    );
  }
}

PipelineInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
