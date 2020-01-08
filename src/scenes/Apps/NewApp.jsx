import React from 'react';
import {
  Step, Stepper, StepLabel, Button, TextField, Collapse, Paper, Typography, CircularProgress,
} from '@material-ui/core';
import ReactGA from 'react-ga';

import Search from '../../components/Search';
import History from '../../config/History';
import ConfirmationModal from '../../components/ConfirmationModal';
import BaseComponent from '../../BaseComponent';

const isEmpty = obj => (obj && obj.constructor === Object && Object.entries(obj).length === 0);

function trunc(str, count) {
  if (!str || str.length < count) { return str; }
  return `${str.substring(0, count)}...`;
}

const style = {
  stepper: {
    width: '100%',
    margin: 'auto',
    maxWidth: 900,
  },
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 24,
    },
    back: {
      marginRight: 12,
    },
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    width: '100%',
  },
  div: {
    width: '100%',
    margin: 'auto',
  },
  menu: {
    minWidth: 180,
  },
  contentStyle: {
    margin: '0 94px',
  },
  bold: {
    fontWeight: 'bold',
  },
  err: {
    color: 'red',
  },
  selectContainer: {
    maxWidth: '300px',
  },
  stepDescription: {
    marginTop: '24px',
  },
  h6: {
    marginBottom: '12px',
  },
};

export default class NewApp extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      collapsed: true,
      finished: false,
      stepIndex: 0,
      errorText: null,
      submitFail: false,
      selectErr: null,
      submitMessage: '',
      spaces: [],
      space: {},
      orgs: [],
      org: {},
      app: '',
      description: '',
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getData();
  }

  getData = async () => {
    try {
      const { data: orgs } = await this.api.getOrgs();
      const { data: spaces } = await this.api.getSpaces();
      this.setState({ orgs, spaces, loading: false, collapsed: false });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
  }

  handleSelectChange = name => (item) => {
    this.setState({ [name]: item, selectErr: null });
  }

  handleNext = () => {
    if (this.state.stepIndex === 0 && this.state.app === '') {
      this.setState({ errorText: 'App required' });
    } else if (this.state.stepIndex === 1 && isEmpty(this.state.org)) {
      this.setState({ selectErr: 'Org required' });
    } else if (this.state.stepIndex === 2 && isEmpty(this.state.space)) {
      this.setState({ selectErr: 'Space required' });
    } else {
      const { stepIndex } = this.state;
      if (!this.state.loading) {
        this.setState({
          stepIndex: stepIndex + 1,
          finished: stepIndex >= 4,
          loading: stepIndex >= 4,
          errorText: null,
          selectErr: null,
        });
      }
    }
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  };

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex - 1,
        errorText: null,
        selectErr: null,
        loading: false,
      });
    }
  }

  submitApp = async () => {
    try {
      await this.api.createApp(this.state.app, this.state.org.value, this.state.space.value, this.state.description); // eslint-disable-line
      await this.api.createFavorite(`${this.state.app}-${this.state.space.value}`);
      ReactGA.event({
        category: 'Apps',
        action: 'Created new app',
      });
      History.get().push(`/apps/${this.state.app}-${this.state.space.value}`);
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          finished: false,
          stepIndex: 0,
          errorText: null,
          space: {},
          org: {},
          app: '',
          description: '',
          loading: false,
        });
      }
    }
  }

  renderStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="app-name"
              label="App name"
              value={this.state.app}
              onChange={this.handleChange('app')}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {`
                Enter a name that will define your new akkeris app
                (typically matches the repository name)!
                This app will then be built from a source and deployed as a Docker image.
              `}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <div style={style.selectContainer}>
              <Search
                onChange={this.handleSelectChange('org')}
                value={this.state.org}
                placeholder="Select an Org"
                options={this.state.orgs.map(i => ({ value: i.name, label: i.name }))}
                error={!!(this.state.selectErr)}
                autoFocus
              />
              {this.state.selectErr && <Typography variant="subtitle2" style={style.err}>{this.state.selectErr}</Typography>}
            </div>
            <Typography variant="body1" style={style.stepDescription}>
              {'Specify the organization this app belongs to. This will link attribution and alerting.'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div>
            <div style={style.selectContainer}>
              <Search
                onChange={this.handleSelectChange('space')}
                value={this.state.space}
                placeholder="Select a Space"
                options={this.state.spaces.map(i => ({ value: i.name, label: i.name }))}
                error={!!(this.state.selectErr)}
                autoFocus
              />
              {this.state.selectErr && <Typography variant="subtitle2" style={style.err}>{this.state.selectErr}</Typography>}
            </div>
            <Typography variant="body1" style={style.stepDescription}>
              {`
                Specify the space your app will live in.
                Spaces contain multiple apps and configurations at a similar stage in a pipeline
                (e.g. dev, qa, prod).
              `}
            </Typography>
          </div>
        );
      case 3:
        return (
          <div style={{ maxWidth: '450px' }}>
            <TextField
              className="app-description"
              label="Description"
              value={this.state.description}
              onChange={this.handleChange('description')}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              fullWidth
            />
            <Typography variant="body1" style={style.stepDescription}>
              {`
                Enter a short description of your app (optional)
              `}
            </Typography>
          </div>
        );
      case 4:
        return (
          <div className="new-app-summary">
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The app '}
              <span style={style.bold}>{this.state.app}-{this.state.space.value}</span>
              {' will be created in the '}
              <span style={style.bold}>{this.state.org.value}</span>
              {' org'}
              {this.state.description !== '' ? (
                <React.Fragment>
                  {' with the description "'}
                  <span style={style.bold}>{this.state.description}</span>
                  {'".'}
                </React.Fragment>
              ) : ('.')}
            </Typography>
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', width: '100%' }}>
            <CircularProgress />
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  render() {
    const {
      collapsed, finished, stepIndex, app, org, space, description, submitFail, submitMessage,
    } = this.state;
    if (finished) { this.submitApp(); }

    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;

    return (
      <Paper style={style.paper}>
        <div style={style.div}>
          <Stepper activeStep={stepIndex} style={style.stepper}>
            <Step>
              <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(app.length > 12 ? `${app.slice(0, 12)}...` : app)}>
                  Create app name
              </StepLabel>
            </Step>
            <Step>
              <StepLabel className="step-1-label" optional={stepIndex > 1 && renderCaption(org.value)}>
                  Select Org
              </StepLabel>
            </Step>
            <Step>
              <StepLabel className="step-2-label" optional={stepIndex > 2 && renderCaption(space.value)}>
                  Select Space
              </StepLabel>
            </Step>
            <Step>
              <StepLabel className="step-3-label" optional={stepIndex > 3 && renderCaption(trunc(description, 20))}>
                  Create Description
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirm</StepLabel>
            </Step>
          </Stepper>
          <Collapse in={!collapsed}>
            <div style={style.contentStyle}>
              <div>{this.renderStepContent(stepIndex)}</div>
              <div style={style.buttons.div}>
                {stepIndex > 0 && (
                  <Button
                    className="back-button"
                    disabled={stepIndex === 0}
                    onClick={this.handlePrev}
                    style={style.buttons.back}
                  >Back</Button>
                )}
                <Button
                  className="next"
                  color="primary"
                  variant="contained"
                  onClick={this.handleNext}
                >{stepIndex === 4 ? 'Finish' : 'Next'}</Button>
              </div>
            </div>
          </Collapse>
          <ConfirmationModal
            open={submitFail}
            onOk={this.handleClose}
            message={submitMessage}
            title="Error"
            className="new-app-error"
          />
        </div>
      </Paper>

    );
  }
}
