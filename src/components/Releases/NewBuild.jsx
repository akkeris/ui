import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';

import api from '../../services/api';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  stepper: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
  },
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 12,
    },
    back: {
      marginRight: 12,
    },
  },
};

export default class NewBuild extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      errorText: null,
      orgs: [],
      org: null,
      checksum: '',
      url: '',
      repo: '',
      sha: '',
      branch: '',
      version: '',
    };
  }

  componentDidMount() {
    api.getOrgs().then((response) => {
      const orgs = response.data.sort((a, b) => a.name > b.name);
      this.setState({
        orgs,
        org: orgs[0].name,
        loading: false,
      });
    });
  }

  getOrgs() {
    return this.state.orgs.map(org => (
      <MenuItem className={org.name} key={org.id} value={org.name} primaryText={org.name} />
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <DropDownMenu className="org-menu" value={this.state.org} onChange={this.handleOrgChange}>
              {this.getOrgs()}
            </DropDownMenu>
            <p>
              Select the org for this build.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField className="url" floatingLabelText="URL" value={this.state.url} onChange={this.handleUrlChange} errorText={this.state.errorText} />
            <p>
              The URI to fetch the image or sources for this build.
              If an image is provided no build will occur, but the image will be fetched.
              See Docker Integrations at the top for more information on using build images.
              Data URI&apos;s are also allowed to push code rather than pull.
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField className="checksum" floatingLabelText="Checksum (optional)" value={this.state.checksum} onChange={this.handleChecksumChange} errorText={this.state.errorText} />
            <p>
              The sha 256 checksum (prepended with sha256:)
              of the contents specified in the url parameter,
              note if the URL is a base64 data URI then it is the content of
              the base64 content DECODED.
            </p>
          </div>
        );
      case 3:
        return (
          <div>
            <TextField className="repo" floatingLabelText="Repo (optional)" value={this.state.repo} onChange={this.handleRepoChange} />
            <p>
              The href of the repo that will show in the logs and build information.
            </p>
          </div>
        );
      case 4:
        return (
          <div>
            <TextField className="sha" floatingLabelText="Sha (optional)" value={this.state.sha} onChange={this.handleShaChange} />
            <p>
              SHA commit value (shown in logs and build info)
            </p>
          </div>
        );
      case 5:
        return (
          <div>
            <TextField className="branch" floatingLabelText="Branch (optional)" value={this.state.branch} onChange={this.handleBranchChange} />
            <p>
              Branch of commit that caused the build (shown in logs and build info)
            </p>
          </div>
        );
      case 6:
        return (
          <div>
            <TextField className="version" floatingLabelText="Version (optional)" value={this.state.version} onChange={this.handleVersionChange} />
            <p>
              An optional version to specify that will show in the logs
            </p>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if (stepIndex === 1 && this.state.url === '') {
      this.setState({ errorText: 'field required' });
    } else if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 6,
        loading: stepIndex >= 6,
        errorText: null,
      });
    }
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex - 1,
        loading: false,
        errorText: null,
      });
    }
  }

  handleOrgChange = (event, index, value) => {
    this.setState({ org: value });
  }

  handleChecksumChange = (event) => {
    this.setState({
      checksum: event.target.value,
    });
  }

  handleUrlChange = (event) => {
    this.setState({
      url: event.target.value,
    });
  }

  handleRepoChange = (event) => {
    this.setState({
      repo: event.target.value,
    });
  }

  handleShaChange = (event) => {
    this.setState({
      sha: event.target.value,
    });
  }

  handleBranchChange = (event) => {
    this.setState({
      branch: event.target.value,
    });
  }

  handleVersionChange = (event) => {
    this.setState({
      version: event.target.value,
    });
  }

  submitBuild = () => {
    api.createBuild(
      this.props.app, this.state.org, this.state.checksum, this.state.url,
      this.state.repo, this.state.sha, this.state.branch, this.state.version,
    ).then(() => {
      this.props.onComplete('New Deployment Requested');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        errorText: null,
        org: null,
        checksum: null,
        url: '',
        repo: null,
        sha: null,
        branch: null,
        version: null,
      });
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitBuild();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (<FlatButton
            className="back"
            label="Back"
            disabled={stepIndex === 0}
            onTouchTap={this.handlePrev}
            style={style.buttons.back}
          />)}
          <RaisedButton
            className="next"
            label={stepIndex === 6 ? 'Finish' : 'Next'}
            primary
            onTouchTap={this.handleNext}
          />
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel className="select-org" >Select Org</StepLabel>
            </Step>
            <Step>
              <StepLabel>Url</StepLabel>
            </Step>
            <Step>
              <StepLabel>Checksum</StepLabel>
            </Step>
            <Step>
              <StepLabel>Repo</StepLabel>
            </Step>
            <Step>
              <StepLabel>Sha</StepLabel>
            </Step>
            <Step>
              <StepLabel>Branch</StepLabel>
            </Step>
            <Step>
              <StepLabel>Version</StepLabel>
            </Step>
          </Stepper>
          {
            <ExpandTransition loading={loading} open>
              {this.renderContent()}
            </ExpandTransition>
          }
          <Dialog
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                label="Ok"
                primary
                onTouchTap={this.handleClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

NewBuild.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
