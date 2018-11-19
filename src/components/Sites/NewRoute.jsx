import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, TextField, Collapse, Select, MenuItem, Button,
  Dialog, DialogTitle, DialogActions, DialogContent,
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiStepper: {
      root: {
        padding: '24px 0px',
      },
    },
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
    api.getApps().then((response) => {
      this.setState({
        apps: response.data,
        app: response.data[0],
        loading: false,
      });
    });
  }

  getApps() {
    return this.state.apps.map(app => (
      <MenuItem className={app.id} key={app.id} value={app.id}>{app.name}</MenuItem>
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="source-path"
              label="Source Path"
              type="text"
              value={this.state.source}
              onChange={this.handleSourceChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
            />
            <p>Path of route after domain ex. `/` or `/source`.</p>
          </div>
        );
      case 1:
        return (
          <div>
            <Select className="new-dropdown" value={this.state.app.id} onChange={this.handleAppChange}>
              {this.getApps()}
            </Select>
            <p>The app to route to.</p>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField
              className="target-path"
              label="Target Path"
              type="text"
              value={this.state.target}
              onChange={this.handleTargetChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
            />
            <p>The path on the app to route to.</p>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
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
        finished: stepIndex >= 2,
        loading: stepIndex >= 2,
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
    const id = event.target.value;
    this.setState({
      app: apps.find(i => i.id === id),
    });
  }

  submitRoute = () => {
    api.createRoute(
      this.props.site,
      this.state.app.id,
      this.state.source,
      this.state.target,
    ).then(() => {
      this.props.onComplete('Route Created');
    }).catch((error) => {
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
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'hidden' };
    if (finished) {
      this.submitRoute();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
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
            {stepIndex === 2 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel>Input Source</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select App</StepLabel>
            </Step>
            <Step>
              <StepLabel>Input Target</StepLabel>
            </Step>
          </Stepper>
          {
            <Collapse in={!loading}>
              {this.renderContent()}
            </Collapse>
          }
          <Dialog
            className="new-addon-error"
            open={this.state.submitFail}
          >
            <DialogTitle>Error</DialogTitle>
            <DialogContent>{this.state.submitMessage}</DialogContent>
            <DialogActions>
              <Button
                className="ok"
                color="primary"
                onClick={this.handleClose}
              >OK</Button>
            </DialogActions>
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

NewRoute.propTypes = {
  site: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
