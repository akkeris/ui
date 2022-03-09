import React from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Link, Paper, Typography, Select, MenuItem, FormControlLabel } from '@material-ui/core';
import { ArrowDownward, CheckBoxOutlineBlank, CheckBox, Delete, DeveloperBoard, Edit, Error, CheckCircle, Cancel, Lens } from '@material-ui/icons/';
import { grey, yellow } from '@material-ui/core/colors';
import GlobalStyles from '../../config/GlobalStyles.jsx'; // eslint-disable-line import/extensions
import { getDateDiff, deepCopy, filterCouplings } from '../../services/util';
import BaseComponent from '../../BaseComponent';

const originalState = {
  loading: true,
  sourceApp: null,
  sourceReleases: null,
  targets: [],
  release: null,
  editRelease: false,
  safe: false,
};

const formTextStyle = {
  display: 'block',
  ...GlobalStyles.StandardLabelMargin,
  ...GlobalStyles.FairlySubtle,
  ...GlobalStyles.Text,
};
const formTextEmphasizedStyle = {
  display: 'block',
  ...GlobalStyles.StandardLabelMargin,
  ...GlobalStyles.Text,
};
const couplingCardStyle = {
  ...GlobalStyles.Subtle,
  ...GlobalStyles.HeaderSmall,
  ...GlobalStyles.StandardLabelMargin,
  ...GlobalStyles.NoWrappingText,
  ...GlobalStyles.VerticalAlign,
};
const stateImage = {
  maxHeight: '0.9rem',
  maxWidth: '0.9rem',
  margin: '0 9px 0 0',
  verticalAlign: 'middle',
  flexGrow: '0',
};

function statusIcon(state) {
  let StatusIcon = Lens;
  switch (state) {
    case 'success':
    case 'succeeded':
      StatusIcon = CheckCircle;
      break;
    case 'failure':
    case 'failed':
    case 'error':
      StatusIcon = Cancel;
      break;
    default:
      StatusIcon = Lens;
  }
  return StatusIcon;
}

function statusIconColor(state) {
  let releaseColor = grey[500];
  switch (state) {
    case 'success':
    case 'succeeded':
      releaseColor = 'rgb(40, 167, 69)';
      break;
    case 'failure':
    case 'failed':
    case 'error':
      releaseColor = 'rgb(203, 36, 49)';
      break;
    case 'pending':
      releaseColor = yellow[800]; // eslint-disable-line prefer-destructuring
      break;
    default:
      releaseColor = yellow[800]; // eslint-disable-line prefer-destructuring
      break;
  }
  return releaseColor;
}

export default class PipelinePromote extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = deepCopy(originalState);
  }

  async componentDidMount() {
    super.componentDidMount();
    this.refresh();
  }

  refresh = async (loading = true) => {
    try {
      this.setState({ loading, ...deepCopy(originalState) });
      const { data: sourceApp } = await this.api.getApp(this.props.source.app.id);
      const { data: sourceReleases } = await this.api.getReleases(this.props.source.app.id);
      const { data: fullCouplings } = await this.api.getPipelineCouplings(this.props.pipeline.name);
      let targets = filterCouplings(fullCouplings, this.props.stages[this.props.stage]);
      targets = await Promise.all(targets.map(async (target) => {
        try {
          const { data: slug } = await this.api.getSlug(target.release.build.id);
          const { data: releases } = await this.api.getReleases(target.app.id);
          return { ...target, slug, releases };
        } catch (e) {
          return { ...target, slug: { source_blob: {} }, releases: [] };
        }
      }));
      const release = sourceReleases.filter(x => x.current === true)[0];

      const {
        data: statuses,
      } = await this.api.getReleaseStatuses(this.props.source.app.id, release.id);
      release.statuses = statuses;
      this.setState({
        loading: false, sourceApp, sourceReleases, targets, release,
      });
    } catch (e) {
      if (!this.isCancel(e)) {
        console.error(e); // eslint-disable-line no-console
        this.props.onError(e);
      }
    }
  }

  handleOk() {
    this.props.onPromote(
      this.props.pipeline,
      this.props.source,
      this.state.targets,
      this.state.release,
      this.state.safe,
    );
  }

  handleRemoveTarget(targetId) {
    this.setState({ targets: this.state.targets.filter(x => x.id !== targetId) });
  }

  handleEditRelease() {
    this.setState({ editRelease: true });
  }

  handleChangeRelease = async (event) => {
    try {
      const {
        data: release,
      } = await this.api.getRelease(this.props.source.app.id, event.target.value);

      const {
        data: statuses,
      } = await this.api.getReleaseStatuses(this.props.source.app.id, release.id);

      release.statuses = statuses;
      this.setState({ editRelease: false, release });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  handleSafePromoteChange(event) {
    this.setState({ safe: !event.target.checked });
  }

  requiredStatuses() {
    const required = this.state.targets
      .map(x => (x.required_status_checks ? x.required_status_checks.contexts : []))
      .reduce((acc, cur) => acc.concat(cur), []);
    return required.filter((x, i) => i === required.lastIndexOf(x)); // make unique
  }

  statusByContext(context) {
    const statuses = this.state.release.statuses.statuses; // eslint-disable-line
    const status = statuses.filter(x => x.context === context);
    if (status.length === 0) {
      return { state: 'unknown', context, description: 'This status check is still pending' };
    }
    return status[0];
  }

  canPromote() {
    const statuses = this.state.release.statuses.statuses; // eslint-disable-line
    const required = this.requiredStatuses();
    const successfulContexts = statuses.filter(x => x.state === 'success').map(x => x.context);
    return required.filter(x => !successfulContexts.includes(x));
  }

  renderLoading = () => (<DialogContent><LinearProgress /></DialogContent>);

  renderSource() {
    const description = `${this.props.source.release.build.commit.message || this.props.source.release.description || ''} ${this.props.source.release.build.author || ''}`;
    const commitUrl = this.props.source.slug.source_blob.url || this.props.source.slug.source_blob.version || '';
    const commitSha = this.props.source.release.build.commit.sha.substring(0, 7);
    return (
      <Paper style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
        <div style={couplingCardStyle}>
          <DeveloperBoard style={{ marginRight: '0.25rem', ...GlobalStyles.FairlySubtle }} />
          <Link style={{ ...GlobalStyles.Subtle, fontSize: '16px' }} target="_blank" href={`/apps/${this.state.sourceApp.name}/info`}>{this.state.sourceApp.name}</Link>
          <span style={{ flexGrow: '1' }} />
          {!this.state.editRelease ? (
            <IconButton style={GlobalStyles.FairlySubtle} onClick={() => this.handleEditRelease()} size="small">
              <Edit fontSize="inherit" />
            </IconButton>
          ) : ''}
        </div>
        {!this.state.editRelease ? (
          <div style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.NoWrappingText }}>
            { commitUrl ? (
              <a style={{ textDecoration: 'none' }} rel="noopener noreferrer" target="_blank" href={commitUrl}>
                <pre style={GlobalStyles.CommitLink} ><code>#{commitSha}</code></pre>
              </a>
            ) : '' }
            <span style={GlobalStyles.Subtle}> {description}</span>
            <div style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.Subtle, marginBottom: '0' }}>
              Deployed <pre style={GlobalStyles.CommitLink}><code>v{this.state.release.version}</code></pre>  { /* eslint-disable-line */ }
              <span style={{ float: 'right' }}>{getDateDiff(this.state.release.created_at)}</span>
            </div>
          </div>
        ) : (
          <div style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.NoWrappingText }}>
            <Select onChange={this.handleChangeRelease} style={{ ...GlobalStyles.Subtle, ...GlobalStyles.Text, width: '100%' }} value={this.state.release.id}>
              {this.state.sourceReleases.slice(-15).map(release => (
                <MenuItem key={`menuitem-${release.id}`} value={release.id}>v{release.version} Deployed {getDateDiff(release.created_at)} - {release.description}</MenuItem>
              ))}
            </Select>
          </div>
        )}
      </Paper>
    );
  }

  renderTargets() {
    return this.state.targets.map((coupling) => {
      let description = '';
      if (coupling.release.build.commit.message) {
        description = `${coupling.release.build.commit.message || ''} ${coupling.release.build.author || ''}`;
      }
      if (description === '' && coupling.releases.length > 0) {
        description = coupling.releases[coupling.releases.length - 1].description; // eslint-disable-line
      }
      const commitUrl = coupling.slug.source_blob.url || coupling.slug.source_blob.version;
      return (
        <Paper key={`target-${coupling.id}`} style={{ marginBottom: '0.5rem', ...GlobalStyles.StandardPadding }}>
          <div style={couplingCardStyle}>
            <DeveloperBoard style={{ marginRight: '0.25rem', ...GlobalStyles.FairlySubtle }} />
            <Link style={{ ...GlobalStyles.Subtle, fontSize: '16px' }} target="_blank" href={`/apps/${coupling.app.name}/info`}>{coupling.app.name}</Link>
            <span style={{ flexGrow: '1' }} />
            {this.state.targets.length > 1 ? (
              <IconButton style={GlobalStyles.FairlySubtle} onClick={this.handleRemoveTarget.bind(this, coupling.id) /* eslint-disable-line */ } size="small">
                <Delete fontSize="inherit" />
              </IconButton>
            ) : ''}
          </div>
          <div style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.NoWrappingText }}>
            { coupling.release.build.commit && coupling.release.build.commit.sha ? (
              <a style={{ textDecoration: 'none' }} rel="noopener noreferrer" target="_blank" href={commitUrl}>
                <pre style={GlobalStyles.CommitLink}>
                  <code>#{coupling.release.build.commit.sha.substring(0, 7)}</code>
                </pre>
              </a>
            ) : '' }
            <span style={GlobalStyles.Subtle}> {description}</span>
          </div>
          <div style={{ ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.Subtle }}>
            {coupling.release.version ? (
              <React.Fragment>
                {'Deployed '}
                <pre style={GlobalStyles.CommitLink}><code>v{coupling.release.version}</code></pre>
                <span style={{ float: 'right' }}>{getDateDiff(coupling.release.updated_at)}</span>
              </React.Fragment>
            ) : <span>This app does not have any releases.</span>}
          </div>
        </Paper>
      );
    });
  }

  renderPipelineStatus() {
    const needed = this.canPromote();
    const required = this.requiredStatuses();
    if (needed.length === 0 && required.length === 0) {
      return (
        <DialogTitle id="scroll-dialog-title2" style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}> { /* eslint-disable-line */ }
          <Typography style={formTextStyle}>
            <ArrowDownward style={{ margin: '0 auto', display: 'block' }} color="disabled" />
          </Typography>
        </DialogTitle>
      );
    }
    const Icon = needed.length === 0 ? CheckCircle : Error;
    const IconStyle = needed.length === 0 ? GlobalStyles.SuccessText : GlobalStyles.ErrorText;
    return (
      <div>
        <DialogTitle disableTypography style={{ display: 'flex', ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}> { /* eslint-disable-line */ }
          <Icon style={{ marginRight: '0.5rem', ...IconStyle }} />
          { needed.length === 0 ?
            (
              <div>
                <Typography variant="h3" style={{ ...GlobalStyles.Header, ...GlobalStyles.SuccessText }}>
                    All checks have passed
                </Typography>
                <Typography variant="body1" style={{ ...GlobalStyles.SubHeader }}>{required.length} successful checks</Typography> { /* eslint-disable-line */ }
              </div>
            ) :
            (
              <div>
                <Typography variant="h3" style={{ ...GlobalStyles.Header, ...GlobalStyles.ErrorText }}>
                    Some checks have not succeeded.
                </Typography>
                <Typography variant="body1" style={{ ...GlobalStyles.SubHeader }}>{needed.length} of {required.length} status checks have not succeeded</Typography> { /* eslint-disable-line */ }
              </div>
            )
          }
        </DialogTitle>
        {required.map((context, i) => {
          const status = this.statusByContext(context);
          const StatusIcon = statusIcon(status.state);
          const dividerStyle = (i > 0) ? { borderTop: '0px' } : {};
          const statusIconStyle = {
            color: statusIconColor(status.state),
            fillColor: statusIconColor(status.state),
            marginTop: '0.1rem',
            maxHeight: '0.8rem',
            maxWidth: '0.8rem',
            marginLeft: '0.25rem',
            marginRight: '1rem',
          };
          return (
            <DialogContent
              key={context}
              dividers
              style={{ ...GlobalStyles.PaperSubtleContainerStyle, ...dividerStyle }}
            >
              <Typography variant="body1" style={{ ...formTextEmphasizedStyle, display: 'flex', alignItems: 'center' }}>
                <StatusIcon style={statusIconStyle} />
                {status.image_url ? (<img style={stateImage} alt={status.description} src={status.image_url} />) : ''}
                  {status.context} <span style={{ ...GlobalStyles.Subtle }}>&nbsp;{( status.description || status.target_url ) ? `—` : ''}&nbsp;{status.description}</span>&nbsp;{status.target_url ? (<a target="_blank" style={GlobalStyles.Link} href={status.target_url}>Details</a>) : ''} { /* eslint-disable-line */ }
              </Typography>
            </DialogContent>
          );
        })}
        { needed.length === 0 ? (
          <div />
        ) : (
          <DialogTitle disableTypography style={{ display: 'flex', ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}>
            <Error style={{ marginRight: '0.5rem', ...GlobalStyles.ErrorText }} />
            <div>
              <Typography variant="h3" style={{ ...GlobalStyles.Header, ...GlobalStyles.ErrorText }}>
                  Promotion is blocked
              </Typography>
              <Typography variant="body1" style={{ ...GlobalStyles.SubHeader }}>
                {this.props.isElevated ? (`
                  A promotion should not be performed unless the status checks above succeed. As an elevated access user you may override these checks and promote this release.
                `) : (`
                  A promotion cannot be performed unless the status checks above succeed. Those with elevated access may still promote a release.
                `)}
              </Typography>
            </div>
          </DialogTitle>
        )}

      </div>
    );
  }

  renderForm() {
    return (
      <div>
        <DialogContent dividers style={{ ...GlobalStyles.PaperSubtleContainerStyle }}>
          <Typography id="dialog-description" variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
            From {this.props.stage}
          </Typography>
          {this.renderSource()}
        </DialogContent>
        {this.renderPipelineStatus()}
        <DialogContent dividers style={{ ...GlobalStyles.PaperSubtleContainerStyle }}>
          <Typography id="dialog-description2" variant="h6" style={{ ...GlobalStyles.FormSubHeaderStyle }}>
            To {this.props.stages[this.props.stage]}
          </Typography>
          {this.renderTargets()}
        </DialogContent>
      </div>
    );
  }

  render() {
    const statusChecksFailed = !this.state.release || !this.state.release.statuses || this.canPromote().length > 0; // eslint-disable-line
    const promoteButtonStyle = !this.state.loading && statusChecksFailed && this.props.isElevated ? GlobalStyles.DangerButton : {}; // eslint-disable-line
    const promoteButtonVariant = !this.state.loading && statusChecksFailed && this.props.isElevated ? 'outlined' : 'text';
    return (
      <Dialog
        className="promote-confirm"
        open={this.props.open}
        onClose={this.props.onCancel}
        fullWidth
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="scroll-dialog-title" style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}>
            Promote
        </DialogTitle>
        {this.state.loading ? this.renderLoading() : this.renderForm()}
        <DialogActions>
          {!(statusChecksFailed && this.props.isElevated) ? (
            <FormControlLabel
              className="force-check"
              style={{
                flexGrow: '1', marginLeft: '0.5rem', ...GlobalStyles.Subtle, ...GlobalStyles.Text,
              }}
              control={
                <Checkbox
                  style={GlobalStyles.Subtle}
                  checked={this.state.safe}
                  onChange={(event) => { this.handleSafePromoteChange(event); }}
                  icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBox fontSize="small" />}
                />
              }
              label={<span style={GlobalStyles.Text}>Override safety checks</span>}
            />
          ) : ''}
          <Button onClick={this.props.onCancel} color="secondary">Cancel</Button>
          <Button className="ok" onClick={() => this.handleOk()} variant={promoteButtonVariant} style={promoteButtonStyle} disabled={this.state.loading || (statusChecksFailed && !this.props.isElevated)} color="primary">
              Promote
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}


PipelinePromote.propTypes = {
  open: PropTypes.bool.isRequired,
  pipeline: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  stage: PropTypes.string.isRequired,
  stages: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  source: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isElevated: PropTypes.bool.isRequired,
  onPromote: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};
