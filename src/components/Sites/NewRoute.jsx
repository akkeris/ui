import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, TextField, Collapse, Button, Typography,
} from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import ConfirmationModal from '../ConfirmationModal';
import Select from '../Select';
import api from '../../services/api';

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
    MuiButton: {
      root: {
        marginRight: '15px',
      },
    },
    MuiFormControl: {
      root: {
        marginBottom: '15px',
      },
    },
  },
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
  selectContainer: {
    maxWidth: '400px',
  },
  stepDescription: {
    marginTop: '24px',
  },
  h6: {
    marginBottom: '12px',
  },
  bold: {
    fontWeight: 'bold',
  },
};

export default class NewRoute extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      errorText: null,
      source: '',
      target: '',
      app: null,
      apps: [],
    };
  }

  componentDidMount() {
    this.getApps();
  }

  getApps = async () => {
    const { data: apps } = await api.getApps();
    apps.forEach((i) => { i.value = i.id; i.label = i.name; }); // eslint-disable-line
    this.setState({ apps, app: apps[0], loading: false });
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if ((stepIndex === 0 && this.state.source === '') || (stepIndex === 2 && this.state.target === '')) {
      this.setState({ errorText: 'field required' });
    } else if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 3,
        loading: stepIndex >= 3,
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

  handleSourceChange = (event) => {
    this.setState({
      source: event.target.value,
    });
  }

  handleTargetChange = (event) => {
    this.setState({
      target: event.target.value,
    });
  }

  handleAppChange = (event) => {
    const { apps } = this.state;
    this.setState({ app: apps.find(a => a.value === event.value) });
  }

  submitRoute = async () => {
    try {
      await api.createRoute(
        this.props.site,
        this.state.app.id,
        this.state.source,
        this.state.target,
      );
      this.props.onComplete('Route Created');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        errorText: null,
        source: '',
        target: '',
        app: null,
      });
    }
  }

  renderStepContent(stepIndex) {
    const { apps, app, source, errorText, target } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="source-path"
              label="Source Path"
              type="text"
              value={source}
              onChange={this.handleSourceChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Path of route after domain ex. \'/\' or \'/source\'.'}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <div style={style.selectContainer}>
              <Select
                options={apps}
                value={app}
                onChange={this.handleAppChange}
                placeholder="Search for an app"
              />
            </div>
            <Typography variant="body1" style={style.stepDescription}>
              {'The app to route to.'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField
              className="target-path"
              label="Target Path"
              type="text"
              value={target}
              onChange={this.handleTargetChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'The path on the app to route to.'}
            </Typography>
          </div>
        );
      case 3:
        return (
          <div>
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The source path '}
              <span style={style.bold}>{source}</span>
              {' will be routed to the destination path '}
              <span style={style.bold}>{target}</span>
              {' on the app '}
              <span style={style.bold}>{app.label}</span>
              {'.'}
            </Typography>
          </div>
        );
      case 4:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px' };
    if (finished) {
      this.submitRoute();
    }
    return (
      <div style={contentStyle}>
        <div>{this.renderStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (
            <Button
              className="back"
              disabled={stepIndex === 0}
              onClick={this.handlePrev}
              style={style.buttons.back}
            >
              Back
            </Button>
          )}
          <Button
            variant="contained"
            className="next"
            color="primary"
            onClick={this.handleNext}
          >
            {stepIndex === 3 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      loading, stepIndex, submitFail, submitMessage, source, app, target,
    } = this.state;

    const renderCaption = text => <Typography variant="caption">{text}</Typography>;

    return (
      <MuiThemeProvider theme={theme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel optional={stepIndex > 0 && renderCaption(source)}>
                Input Source
              </StepLabel>
            </Step>
            <Step>
              <StepLabel optional={stepIndex > 1 && renderCaption(app.name)}>
                Select App
              </StepLabel>
            </Step>
            <Step>
              <StepLabel optional={stepIndex > 2 && renderCaption(target)}>
                Input Target
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirm</StepLabel>
            </Step>
          </Stepper>
          <Collapse in={!loading}>
            {this.renderContent()}
          </Collapse>
          <ConfirmationModal
            open={submitFail}
            onOk={this.handleClose}
            message={submitMessage}
            title="Error"
            className="new-route-error"
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

NewRoute.propTypes = {
  site: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
