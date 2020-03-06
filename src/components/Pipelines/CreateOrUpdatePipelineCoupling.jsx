import React from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Link, Typography, FormControlLabel } from '@material-ui/core';
import { DeveloperBoard, ArrowDownward } from '@material-ui/icons/';
import AutoSuggest from '../AutoSuggest';
import GlobalStyles from '../../config/GlobalStyles.jsx'; // eslint-disable-line import/extensions
import { deepCopy, filterName } from '../../services/util';
import BaseComponent from '../../BaseComponent';

const originalState = {
  loading: true,
  apps: [],
  statuses: [],
  selected: [],
  search: '',
  appErrorText: null,
};

const formSubHeaderStyle = {
  ...GlobalStyles.StandardLabelMargin,
  ...GlobalStyles.HeaderSmall,
  ...GlobalStyles.Subtle,
};
const formTextStyle = {
  display: 'block', ...GlobalStyles.StandardLabelMargin, ...GlobalStyles.FairlySubtle, ...GlobalStyles.Text,
};
export default class CreateOrUpdatePipelineCoupling extends BaseComponent {
  static renderPipelineDiagram() {
    const diagramAppRow = {
      display: 'flex', height: '20px', boxShadow: '0 0 10px 1px rgba(0,0,0,0.125)', borderRadius: '3px',
    };
    const diagramBox = {
      width: '90px', display: 'inline-block', float: 'left', paddingTop: '4px', paddingRight: '12.5px', boxSizing: 'border-box',
    };
    const diagramIconStyle = {
      display: 'inline-block', width: '35px', opacity: '0.7', textAlign: 'center',
    };
    const diagramMiddleArrowIconStyle = { ...diagramIconStyle, height: '1rem', opacity: '0.5' };
    const diagramTextOutline = {
      display: 'inline-block', width: '40px', lineHeight: '0px', height: '20px', paddingTop: '3px',
    };
    const diagramTextShadow = {
      display: 'block', marginTop: '0.08rem', marginBottom: '0.08rem', backgroundColor: 'rgb(230,230,230)', height: '0.35rem', width: '90%',
    };
    const diagramTextShadowBottom = { ...diagramTextShadow, backgroundColor: 'rgb(240,240,240)', width: '50%' };
    const diagramMiddleArrow = { height: '1rem', marginTop: '-3px', marginBottom: '-2px' };
    return (
      <div style={diagramBox}>
        <div style={diagramAppRow}>
          <span style={diagramIconStyle}><DeveloperBoard fontSize="small" color="secondary" /></span>
          <span style={diagramTextOutline}>
            <div style={diagramTextShadow} />
            <div style={diagramTextShadowBottom} />
          </span>
        </div>
        <div style={diagramMiddleArrow}><span style={diagramMiddleArrowIconStyle}><ArrowDownward fontSize="inherit" color="action" /></span></div>
        <div style={diagramAppRow}>
          <span style={diagramIconStyle}><DeveloperBoard fontSize="small" color="secondary" /></span>
          <span style={diagramTextOutline}>
            <div style={diagramTextShadow} />
            <div style={diagramTextShadowBottom} />
          </span>
        </div>
      </div>
    );
  }

  constructor(props, context) {
    super(props, context);
    this.state = deepCopy(originalState);
  }

  componentDidMount() {
    super.componentDidMount();
    this.refresh();
  }

  refresh = async (loading = true) => {
    try {
      this.setState({
        loading,
        ...deepCopy(originalState),
        selected: this.props.coupling ? this.props.coupling.required_status_checks.contexts : [],
      });
      const { data: apps } = await this.api.getApps();
      const {
        data: statuses,
      } = await this.api.getAvailablePipelineStatuses(this.props.pipeline.name);
      this.setState({ loading: false, apps, statuses });
    } catch (e) {
      if (!this.isCancel(e)) {
        console.error(e); // eslint-disable-line no-console
      }
    }
  }

  handleSearch = (search) => {
    this.setState({ search });
  }

  handleStatusCheckChange = (context, event) => {
    if (event.target.checked) {
      this.setState({ selected: this.state.selected.concat(context) });
    } else {
      this.setState({ selected: this.state.selected.filter(x => x !== context) });
    }
  }

  handleOk = () => {
    if (!this.props.coupling && (this.state.search === '' || !this.state.search)) {
      this.setState({ appErrorText: 'Select an application to continue' });
    } else {
      this.props.onCreateOrUpdate(
        this.props.pipeline,
        this.props.coupling,
        this.props.stage,
        this.state.search,
        this.state.selected,
      );
    }
  }

  renderLoading = () => (<LinearProgress />);

  renderAvailableStatusChecks() {
    if (this.state.statuses.length !== 0 && this.props.stage !== 'review') {
      return (
        <div key="status-check-box" style={{ marginTop: '2rem' }}>
          <Typography variant="h6" style={formSubHeaderStyle}>Require these status checks before allowing promotions</Typography>
          <Typography variant="body1" style={formTextStyle}>
            Choose which <Link rel="noopener" target="_blank" href="https://docs.akkeris.io/architecture/pipelines.html">status checks</Link> must pass before code can be promoted to the <pre style={GlobalStyles.CommitLink}><code>{this.props.stage}</code></pre> stage. When enabled, code may not be introduced into this app or stage of the pipeline without first being deployed to a prior stage where the checks have passed.
          </Typography>
          <div key="status-check-list" style={{ ...GlobalStyles.SubtleContainerStyle }}>
            {this.state.statuses.map(status => (
              <FormControlLabel
                key={status.context}
                control={
                  <Checkbox
                    size="small"
                    checked={this.state.selected.includes(status.context)}
                    onChange={this.handleStatusCheckChange.bind(this, status.context) /* eslint-disable-line */ }
                    key={status.context}
                  />}
                label={
                  <Typography style={formSubHeaderStyle}>
                    {status.context} - {status.name}
                  </Typography>
                }
              />
            ))}
          </div>
        </div>
      );
    } else if (this.props.stage === 'review') {
      return (
        <div key="status-check-box" style={{ marginTop: '2rem' }}>
          <Typography variant="h6" style={{ ...formSubHeaderStyle, ...GlobalStyles.VerySubtle }}>
            Status checks cannot be added to the review stage.
          </Typography>
        </div>
      );
    }
    return (
      <div key="status-check-box" style={{ marginTop: '2rem' }}>
        <Typography variant="h6" style={formSubHeaderStyle}>
          No available status checks were found on this pipeline.
          To use required status checks on a pipeline it must first
          report a status (at least once) on any release in the pipeline.
        </Typography>
      </div>
    );
  }

  renderAppSelection() {
    if (this.props.coupling) {
      return; // eslint-disable-line consistent-return
    }
    if (this.state.search === '' || !this.state.search) {
      return ( // eslint-disable-line consistent-return
        <AutoSuggest
          className={`${this.props.stage}-app-search`}
          key={`${this.props.stage}-app-search`}
          labelText="Choose an application"
          errorText={this.state.appErrorText}
          data={filterName(this.state.apps)}
          handleSearch={this.handleSearch}
          color="black"
        />
      );
    }
    return ( // eslint-disable-line consistent-return
      <div style={{ marginTop: '24px' }} key={`${this.props.stage}-app-selection`}>
        <Chip
          onDelete={() => this.setState({ search: '' })}
          color="primary"
          variant="outlined"
          icon={<DeveloperBoard />}
          label={this.state.search}
        />
      </div>
    );
  }

  renderForm() {
    return [
      this.renderAppSelection(),
      this.renderAvailableStatusChecks(),
    ];
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onCancel}
        fullWidth
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="scroll-dialog-title" style={{ ...GlobalStyles.HeaderSmall, ...GlobalStyles.Subtle }}>
          {!this.props.coupling ? 'Add an app to a pipeline' : 'Modify pipeline coupling'}
        </DialogTitle>
        <DialogContent style={{ overflowY: 'visible', minHeight: '340px' }} dividers>
          {!this.props.coupling ? (
            <Typography id="dialog-description" variant="h6" style={formSubHeaderStyle}>
              Choose an application to add to the <pre style={GlobalStyles.CommitLink}><code>{this.props.stage}</code></pre> stage in the <pre style={GlobalStyles.CommitLink}><code>{this.props.pipeline.name}</code></pre> pipeline. { /* eslint-disable-line */ }
            </Typography>
          ) : (
            <Typography id="dialog-description" variant="h6" style={formSubHeaderStyle}>
                Pipelines &amp; Pipeline Couplings
            </Typography>
          )}
          {CreateOrUpdatePipelineCoupling.renderPipelineDiagram()}
          <Typography style={formTextStyle}>
              Pipelines allow you to connect multiple apps together and promote code between them. An app in a pipeline can ensure the quality of the promotion using status checks. <Link rel="noopener" target="_blank" href="https://docs.akkeris.io/architecture/pipelines.html">Learn more</Link>  { /* eslint-disable-line */ }
          </Typography>
          {this.state.loading ? this.renderLoading() : this.renderForm()}
        </DialogContent>
        <DialogActions>
          <Button className={`${this.props.stage}-cancel`} onClick={this.props.onCancel} color="secondary">Cancel</Button>
          <Button className={`${this.props.stage}-ok`} onClick={this.handleOk} autoFocus color="primary">Ok</Button>
        </DialogActions>
      </Dialog>
    );
  }
}


CreateOrUpdatePipelineCoupling.propTypes = {
  open: PropTypes.bool.isRequired,
  pipeline: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  coupling: PropTypes.object, // eslint-disable-line
  stage: PropTypes.string.isRequired,
  onCreateOrUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
