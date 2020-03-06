import React from 'react';
import PropTypes from 'prop-types';
import { DeveloperBoard, Delete, Edit } from '@material-ui/icons/';
import { Paper, CircularProgress, Button, Link, IconButton, Tooltip } from '@material-ui/core';
import ReactGA from 'react-ga';
import GlobalStyles from '../../config/GlobalStyles.jsx'; // eslint-disable-line import/extensions
import ReleaseStatus from '../Releases/ReleaseStatus.jsx'; // eslint-disable-line import/extensions
import { getDateDiff, deepCopy, filterCouplings } from '../../services/util';
import ConfirmationModal from '../ConfirmationModal';
import CreateOrUpdatePipelineCoupling from './CreateOrUpdatePipelineCoupling';
import PipelinePromote from './PipelinePromote';
import BaseComponent from '../../BaseComponent';

const style = {
  AppPaperPanel: {
    marginTop: '1rem',
  },
  NoAppsFoundPanel: {
    marginTop: '0.5rem',
    paddingLeft: '0',
  },
};

const couplingCardStyle = {
  ...GlobalStyles.Subtle,
  ...GlobalStyles.HeaderSmall,
  ...GlobalStyles.StandardLabelMargin,
  ...GlobalStyles.NoWrappingText,
  ...GlobalStyles.VerticalAlign,
};

const noCouplingCardStyle = {
  ...GlobalStyles.StandardPadding,
  ...style.NoAppsFoundPanel,
  ...GlobalStyles.VerySubtle,
};

const originalState = {
  loading: true,
  couplings: [],
  releases: [],
  editCoupling: null,
  deleteCoupling: null,
  promoteCoupling: null,
  fullCouplings: null,
};

export default class Stage extends BaseComponent {
  static renderLoading() {
    const circularStyle = { ...GlobalStyles.CenteredCircularProgress };
    return (
      <Paper style={{ ...style.AppPaperPanel, ...GlobalStyles.StandardPadding }}>
        <div style={couplingCardStyle}>
          <CircularProgress style={circularStyle} status="loading" />
        </div>
      </Paper>
    );
  }

  static renderNoCouplingsFound() {
    return (
      <div style={noCouplingCardStyle}>
        No apps exist at this stage.
      </div>
    );
  }

  constructor(props, context) {
    super(props, context);
    this.state = deepCopy(originalState);
  }

  componentDidMount() {
    super.componentDidMount();
    this.refreshStage();
  }

  getTargets(stage) {
    if (stage !== 'production') {
      return filterCouplings(this.state.couplings, this.props.stages[stage]);
    }
    return null;
  }

  refreshStage = async (loading = true) => {
    try {
      this.setState({ loading, ...deepCopy(originalState) });
      const { data: fullCouplings } = await this.api.getPipelineCouplings(this.props.pipeline.name);
      const couplings = await Promise.all(filterCouplings(fullCouplings, this.props.stage).map(async (coupling) => { // eslint-disable-line max-len
        try {
          const { data: statuses } = await this.api.getReleaseStatuses(coupling.app.id, coupling.release.id); // eslint-disable-line max-len
          const { data: slug } = await this.api.getSlug(statuses.release.slug.id);
          return { ...coupling, slug, statuses };
        } catch (e) {
          return { ...coupling, slug: { source_blob: {} }, statuses: { release: coupling.release, required_status_checks: { contexts: [] } } }; // eslint-disable-line max-len
        }
      }));
      this.setState({ loading: false, couplings, fullCouplings });
    } catch (err) {
      if (!this.isCancel(err)) {
        this.props.onError(err);
      }
    }
  }

  canPromote(coupling) {
    if (coupling.stage === 'production') {
      return false;
    }
    if (filterCouplings(this.state.fullCouplings, this.props.stages[this.props.stage]).length === 0) { // eslint-disable-line max-len
      return false;
    }
    return true;
  }

  handleRemoveCoupling = async () => {
    this.setState({ loading: true });
    try {
      await this.api.deletePipelineCoupling(this.state.deleteCoupling.id);
      ReactGA.event({ category: 'PIPELINES', action: 'Removed pipeline coupling' });
      await this.refreshStage();
    } catch (err) {
      if (!this.isCancel(err)) {
        this.props.onError(err);
      }
    }
  }

  handleUpdatePipelineCoupling = async (pipeline, coupling, stage, app, statuses) => {
    try {
      await this.api.updatePipelineCoupling(pipeline.id, coupling.id, statuses);
      ReactGA.event({ category: 'PIPELINES', action: 'Updated coupling' });
      this.refreshStage();
    } catch (err) {
      if (!this.isCancel(err)) {
        this.props.onError(err);
      }
    }
  }

  handlePromote = async (pipeline, source, targets, release, safe) => {
    try {
      ReactGA.event({ category: 'PIPELINES', action: 'Application Promoted' });
      await this.api.promotePipeline(pipeline.id, source.app.id, targets.map(x => ({ app: { id: x.app.id } })), safe, release.id); // eslint-disable-line max-len
      this.props.refresh();
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
        this.props.onError(err);
      }
    }
  }

  renderPipelinePromote() {
    if (this.state.promoteCoupling === null) {
      return; // eslint-disable-line consistent-return
    }
    return ( // eslint-disable-line consistent-return
      <PipelinePromote
        key={`promote-${this.state.promoteCoupling.id}`}
        open={this.state.promoteCoupling !== null}
        pipeline={this.props.pipeline}
        source={this.state.promoteCoupling}
        couplings={this.state.fullCouplings}
        stage={this.props.stage}
        stages={this.props.stages}
        isElevated={this.props.isElevated}
        onPromote={this.handlePromote}
        onError={this.props.onError}
        onCancel={() => this.setState({ promoteCoupling: null })}
      />
    );
  }

  renderEditCoupling() { // eslint-disable-line consistent-return
    if (this.state.editCoupling !== null) {
      return ( // eslint-disable-line consistent-return
        <CreateOrUpdatePipelineCoupling
          key={`update-pipeline-coupling-${this.state.editCoupling.id}`}
          open
          pipeline={this.props.pipeline}
          stage={this.props.stage}
          coupling={this.state.editCoupling}
          onCreateOrUpdate={this.handleUpdatePipelineCoupling}
          onCancel={() => this.setState({ editCoupling: null })}
        />
      );
    }
  }

  renderDeleteCoupling() { // eslint-disable-line consistent-return
    if (this.state.deleteCoupling !== null) {
      return (
        <ConfirmationModal
          key={`delete-confirmation-${this.props.stage}`}
          className={`${this.props.stage}-remove-confirm`}
          open={this.state.deleteCoupling !== null}
          onOk={this.handleRemoveCoupling}
          onCancel={() => { this.setState({ deleteCoupling: null }); }}
          message={`Are you sure you want to remove ${this.state.deleteCoupling.app.name} from the ${this.props.stage} stage?`}
        />
      );
    }
  }

  renderCouplingWithRelease(coupling) {
    const description = `${coupling.release.build.commit.message || coupling.statuses.release.description} ${coupling.release.build.author}`;
    const commitUrl = coupling.slug.source_blob.url || coupling.slug.source_blob.version;
    return (
      <Paper className={`coupling ${coupling.app.name}`} key={coupling.id} style={{ ...style.AppPaperPanel, ...GlobalStyles.StandardPadding }}>
        <div style={couplingCardStyle}>
          <DeveloperBoard style={{ marginRight: '0.25rem', ...GlobalStyles.FairlySubtle }} fontSize="small" />
          <Link style={{ ...GlobalStyles.Subtle }} href={`/apps/${coupling.app.id}/info`}>{coupling.app.name}</Link>
          <span style={{ flexGrow: '1' }} />
          {this.props.stage !== 'review' ? (
            <IconButton style={GlobalStyles.FairlySubtle} onClick={() => { this.setState({ editCoupling: coupling }); }} size="small">
              <Edit fontSize="inherit" />
            </IconButton>
          ) : ''}
          <IconButton className="remove" style={GlobalStyles.FairlySubtle} onClick={() => { this.setState({ deleteCoupling: coupling }); }} size="small">
            <Delete fontSize="inherit" />
          </IconButton>
        </div>
        <div style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.NoWrappingText }}>
          { coupling.release.build.commit && coupling.release.build.commit.sha ? (
            <a href={commitUrl} style={{ textDecoration: 'none' }}>
              <pre style={GlobalStyles.CommitLink}>
                <code>#{coupling.release.build.commit.sha.substring(0, 7)}</code>
              </pre>
            </a>
          ) : '' }
          <span style={GlobalStyles.Subtle}> {description}</span>
        </div>
        <div style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.Subtle }}>
          <ReleaseStatus release={{ release: true, ...coupling.statuses.release }} />
          <span style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }}>
            Deployed <pre style={GlobalStyles.CommitLink}><code>v{coupling.release.version}</code></pre>  { /* eslint-disable-line */ }
            <Tooltip title={(new Date(coupling.release.updated_at)).toLocaleString()} placement="top" interactive>
              <span style={{ float: 'right' }}> {getDateDiff(coupling.release.updated_at)}</span>
            </Tooltip>
          </span>
        </div>
        {this.canPromote(coupling) ? (
          <Button
            style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.Subtle, marginTop: '0' }}
            size="small"
            variant="outlined"
            className="promote"
            fullWidth
            onClick={() => this.setState({ promoteCoupling: coupling })}
          >
            Promote
          </Button>
        ) : ''}
      </Paper>
    );
  }

  renderCouplingWithNoRelease(coupling) {
    return (
      <Paper className={`coupling ${coupling.app.name}`} key={coupling.id} style={{ ...style.AppPaperPanel, ...GlobalStyles.StandardPadding }}>
        <div style={couplingCardStyle}>
          <DeveloperBoard style={{ marginRight: '0.25rem', ...GlobalStyles.FairlySubtle }} fontSize="small" />
          <Link style={{ ...GlobalStyles.Subtle }} href={`/apps/${coupling.app.id}/info`}>{coupling.app.name}</Link>
          <span style={{ flexGrow: '1' }} />
          <IconButton style={GlobalStyles.FairlySubtle} onClick={() => { this.setState({ editCoupling: coupling }); }} size="small">
            <Edit fontSize="inherit" />
          </IconButton>
          <IconButton className="remove" style={GlobalStyles.FairlySubtle} onClick={() => { this.setState({ deleteCoupling: coupling }); }} size="small">
            <Delete fontSize="inherit" />
          </IconButton>
        </div>
        <div style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.Subtle }}>
         This app does not have any releases.
        </div>
      </Paper>
    );
  }

  render() {
    if (this.state.loading) {
      return Stage.renderLoading();
    } else if (this.state.couplings.length === 0) {
      return Stage.renderNoCouplingsFound();
    }
    return [this.renderPipelinePromote(), this.renderEditCoupling(), this.renderDeleteCoupling()]
      .concat(this.state.couplings.map(coupling => (coupling.release.id ?
        this.renderCouplingWithRelease(coupling) :
        this.renderCouplingWithNoRelease(coupling))));
  }
}

Stage.propTypes = {
  pipeline: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  stage: PropTypes.string.isRequired,
  stages: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isElevated: PropTypes.bool.isRequired,
  onError: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
