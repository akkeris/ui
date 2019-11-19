import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GlobalStyles from '../../config/GlobalStyles.jsx';
import { DeveloperBoard, Delete, Edit } from '@material-ui/icons/';
import { Paper, CircularProgress, Button, Link, IconButton, FormControlLabel, Checkbox } from '@material-ui/core'
import ReleaseStatus from '../Releases/ReleaseStatus.jsx';
import api from '../../services/api';
import util from '../../services/util';
import ReactGA from 'react-ga';
import ConfirmationModal from '../ConfirmationModal';
import CreateOrUpdatePipelineCoupling from './CreateOrUpdatePipelineCoupling';
import PipelinePromote from './PipelinePromote';

const style = {
  AppPaperPanel: {
    marginTop: '1rem',
  },
  NoAppsFoundPanel: {
    marginTop: '0.5rem',
    paddingLeft: '0'
  }
} 

const couplingCardStyle = {...GlobalStyles.Subtle, ...GlobalStyles.HeaderSmall, ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.NoWrappingText, ...GlobalStyles.VerticalAlign};
const originalState = {
  loading:true,
  couplings:[],
  releases:[],
  editCoupling:null,
  deleteCoupling:null,
  promoteCoupling:null,
  fullCouplings:null,
};

export default class Stage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = util.deepCopy(originalState);
  }

  componentDidMount = () => this.refreshStage();

  refreshStage = async(loading = true) => {
    try {
      this.setState({loading, ...util.deepCopy(originalState)});
      const { data: fullCouplings } = await api.getPipelineCouplings(this.props.pipeline.name);
      let couplings = await Promise.all(util.filterCouplings(fullCouplings, this.props.stage).map(async (coupling) => {
        try {
          let { data: statuses } = await api.getReleaseStatuses(coupling.app.id, coupling.release.id);
          let { data: slug } = await api.getSlug(statuses.release.slug.id);
          return {...coupling, slug, statuses}
        } catch (e) {
          return {...coupling, slug:{source_blob:{}}, statuses:{release:coupling.release, required_status_checks:{contexts:[]}}}
        }
      }));
      this.setState({loading:false, couplings, fullCouplings});
    } catch (err) {
      this.props.onError(err);
    }
  }
  
  canPromote(coupling) {
    if(coupling.stage === "production") {
      return false;
    }
    return true;
  }

  getTargets(stage) {
    if (stage !== 'production') {
      return util.filterCouplings(this.state.couplings, this.props.stages[stage]);
    }
    return null;
  }

  handleRemoveCoupling = async () => {
    this.setState({ loading: true });
    try {
      await api.deletePipelineCoupling(this.state.deleteCoupling.id);
      ReactGA.event({ category: 'PIPELINES', action: 'Removed pipeline coupling'});
      await this.refreshStage();
    } catch (err) {
      this.props.onError(err);
    }
  }

  handleUpdatePipelineCoupling = async (pipeline, coupling, stage, app, statuses) => {
    try {
      await api.updatePipelineCoupling(pipeline.id, coupling.id, statuses);
      ReactGA.event({
        category: 'PIPELINES',
        action: 'Updated coupling',
      });
      this.refreshStage();
    } catch (err) {
      this.props.onError(err);
    }
  }

  handlePromote = async (pipeline, source, targets, release, safe) => {
    try {
      ReactGA.event({ category: 'PIPELINES', action: 'Application Promoted'});
      await api.promotePipeline(pipeline.id, source.app.id, targets.map((x) => { return {app:{id:x.app.id}} }), safe, release.id);
      this.refreshStage();
    } catch (err) {
      this.props.onError(err);
    }
  }

  renderPipelinePromote() {
    if(this.state.promoteCoupling === null) {
      return;
    }
    return (
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
        onCancel={() => this.setState({promoteCoupling:null})}
        onError={(error) => this.setState({promoteCoupling:null, error})}
      />
    );
  }

  renderEditCoupling() {
    if(this.state.editCoupling !== null) {
      return (
        <CreateOrUpdatePipelineCoupling
          key={`update-pipeline-coupling-${this.state.editCoupling.id}`}
          open
          pipeline={this.props.pipeline}
          stage={this.props.stage}
          coupling={this.state.editCoupling}
          onCreateOrUpdate={this.handleUpdatePipelineCoupling}
          onCancel={() => this.setState({editCoupling:null})}
          onError={(error) => this.setState({editCoupling:null, error})}
        />
      );
    }
  }

  renderDeleteCoupling() {
    if(this.state.deleteCoupling !== null) {
      return (
        <ConfirmationModal
          key={`delete-confirmation-${this.props.stage}`}
          className={`${this.props.stage}-remove-confirm`}
          open={this.state.deleteCoupling !== null}
          onOk={this.handleRemoveCoupling}
          onCancel={() => { this.setState({deleteCoupling:null}); }}
          message={`Are you sure you want to remove ${this.state.deleteCoupling.app.name} from the ${this.props.stage} stage?`}
        />
      );
    }
  }

  renderLoading(coupling) {
    const circularStyle = {...GlobalStyles.CenteredCircularProgress};
    return (
      <Paper style={{...style.AppPaperPanel, ...GlobalStyles.StandardPadding}}>
        <div style={couplingCardStyle}>
          <CircularProgress style={circularStyle} status="loading" />
        </div>
      </Paper>
    );
  }

  renderNoCouplingsFound() {
    return (
      <div style={{...GlobalStyles.StandardPadding, ...style.NoAppsFoundPanel, ...GlobalStyles.VerySubtle}}>
        No apps exist at this stage.
      </div>
    );
  }

  renderCouplingWithRelease(coupling) {
    let description = `${coupling.release.build.commit.message || coupling.statuses.release.description} ${coupling.release.build.author}`;
    let commitUrl = coupling.slug.source_blob.url || coupling.slug.source_blob.version;
    return (
      <Paper key={coupling.id} style={{...style.AppPaperPanel, ...GlobalStyles.StandardPadding}}>
        <div style={couplingCardStyle}>
          <DeveloperBoard style={{marginRight:'0.25rem', ...GlobalStyles.FairlySubtle}} fontSize="small"/>
          <Link style={{...GlobalStyles.Subtle}} href={`/apps/${coupling.app.id}/info`}>{coupling.app.name}</Link>
          <span style={{flexGrow:'1'}}></span>
          {this.props.stage !== 'review' ? (
            <IconButton style={GlobalStyles.FairlySubtle} onClick={() => {this.setState({editCoupling:coupling})}} size="small">
              <Edit fontSize="inherit" />
            </IconButton>
          ) : ''}
          <IconButton style={GlobalStyles.FairlySubtle} onClick={() => {this.setState({deleteCoupling:coupling})}} size="small">
            <Delete fontSize="inherit" />
          </IconButton>
        </div>
        <div style={{...GlobalStyles.StandardLabelMargin, ...GlobalStyles.NoWrappingText}}>
          { coupling.release.build.commit && coupling.release.build.commit.sha ? (
            <a style={GlobalStyles.CommitLink} href={commitUrl}>
              <pre style={GlobalStyles.CommitLinkPre}><code>#{coupling.release.build.commit.sha.substring(0, 7)}</code></pre>
            </a>
          ) : '' }
          <span style={GlobalStyles.Subtle}> {description}</span>
        </div>
        <div style={{...GlobalStyles.StandardLabelMargin, ...GlobalStyles.Subtle}}>
          <ReleaseStatus release={{release:true, ...coupling.statuses.release}}></ReleaseStatus> 
          <label> Deployed <pre style={GlobalStyles.CommitLinkPre}><code>v{coupling.release.version}</code></pre> {util.getDateDiff(coupling.release.updated_at)}</label>
        </div>
        {this.canPromote(coupling) ? (
          <Button 
            style={{...GlobalStyles.StandardLabelMargin, ...GlobalStyles.Subtle, marginTop:'0'}} 
            size="small"
            variant="outlined" 
            fullWidth 
            onClick={() => this.setState({promoteCoupling: coupling})}>
            Promote
          </Button>
        ) : ''}
      </Paper>
    );
  }

  renderCouplingWithNoRelease(coupling) {
    return (
      <Paper key={coupling.id} style={{...style.AppPaperPanel, ...GlobalStyles.StandardPadding}}>
        <div style={couplingCardStyle}>
          <DeveloperBoard style={{marginRight:'0.25rem', ...GlobalStyles.FairlySubtle}} fontSize="small"/>
          <Link style={{...GlobalStyles.Subtle}} href={`/apps/${coupling.app.id}/info`}>{coupling.app.name}</Link>
          <span style={{flexGrow:'1'}}></span>
          <IconButton style={GlobalStyles.FairlySubtle} onClick={() => {this.setState({editCoupling:coupling})}} size="small">
            <Edit fontSize="inherit" />
          </IconButton>
          <IconButton style={GlobalStyles.FairlySubtle} onClick={() => {this.setState({deleteCoupling:coupling})}} size="small">
            <Delete fontSize="inherit" />
          </IconButton>
        </div>
        <div style={{...GlobalStyles.StandardLabelMargin, ...GlobalStyles.Subtle}}>
         This app does not have any releases.
        </div>
      </Paper>
    );
  }

  render() {
    if (this.state.loading) {
      return this.renderLoading();
    } else if(this.state.couplings.length === 0) {
      return this.renderNoCouplingsFound();
    } else {
      return [this.renderPipelinePromote(), this.renderEditCoupling(), this.renderDeleteCoupling()]
        .concat(this.state.couplings.map(
          (coupling) => coupling.release.id ? 
            this.renderCouplingWithRelease(coupling) : 
              this.renderCouplingWithNoRelease(coupling)));
    }
  }
}

Stage.propTypes = {
  pipeline: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  stage: PropTypes.string.isRequired,
  stages: PropTypes.object.isRequired,
  isElevated: PropTypes.bool.isRequired,
  onError: PropTypes.func.isRequired
};
