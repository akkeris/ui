import React, { Component } from 'react';
import {
  Step, Stepper, StepLabel, Button, TextField, Collapse, Paper, Select, MenuItem,
  Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText, FormControl, InputLabel,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: {       main: '#0097a7',     },
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
    width: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    marginBottom: '12px',
  },
  div: {
    width: '90%',
    margin: 'auto',
  },
  menu: {
    minWidth: 180,
  },
};

export default class NewApp extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      errorText: null,
      submitFail: false,
      submitMessage: '',
      spaces: [],
      space: '',
      orgs: [],
      org: 'akkeris',
      app: '',
    };
  }

  componentDidMount() {
    api.getOrgs().then((response) => {
      this.setState({
        orgs: response.data,
      });
    });
    api.getSpaces().then((response) => {
      this.setState({
        spaces: response.data,
        loading: false,
      });
    });
  }

  getStepContent(stepIndex) {
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
            />
            <p>
              Create an akkeris app! Enter a name that will define your app.
              (this is typically on par with the repository name).
              This app will be build with a source then create a docker image to deploy.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <FormControl>
              <InputLabel htmlFor="org-select">Org</InputLabel>
              <Select
                className="dropdown"
                value={this.state.org}
                onChange={this.handleChange('org')}
                style={style.menu}
                inputProps={{
                  id: 'org-select',
                }}
              >
                {this.getOrgs()}
              </Select>
            </FormControl>
            <p>
              Specify the organization this app belongs to. This will link attribution and alerting.
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <FormControl>
              <InputLabel htmlFor="space-select">Space</InputLabel>
              <Select
                className="dropdown"
                value={this.state.space}
                onChange={this.handleChange('space')}
                style={style.menu}
                inputProps={{
                  id: 'space-select',
                }}
              >
                {this.getSpaces()}
              </Select>
            </FormControl>
            <p>
              Specify the space your app will live in.
              Spaces contain multiple apps and configurations at a similar stage in a pipeline
              (ex. dev, qa, prod)
            </p>
          </div>
        );
      case 3:
        return null;
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  getSpaces() {
    return this.state.spaces.map(space => (
      <MenuItem className={space.name} key={space.id} value={space.name}>{space.name}</MenuItem>
    ));
  }

  getOrgs() {
    return this.state.orgs.map(org => (
      <MenuItem className={org.name} key={org.id} value={org.name}>{org.name}</MenuItem>
    ));
  }

  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleOrgChange = (event, index, value) => {
    this.setState({
      org: value,
    });
  }

  handleSpaceChange = (event, index, value) => {
    this.setState({
      space: value,
    });
  }

  handleAppChange = (event) => {
    this.setState({
      app: event.target.value,
    });
  }

  handleNext = () => {
    if (this.state.stepIndex === 0 && this.state.app === '') {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      if (!this.state.loading) {
        this.setState({
          stepIndex: stepIndex + 1,
          finished: stepIndex >= 2,
          loading: stepIndex >= 2,
          errorText: null,
        });
      }
    }
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex - 1,
        errorText: null,
        loading: false,
      });
    }
  }

  submitApp = () => {
    api.createApp(this.state.app, this.state.org, this.state.space).then(() => {
      window.location = '#/apps';
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        errorText: null,
        space: '',
        org: 'akkeris',
        app: '',
        loading: false,
      });
    });
  };

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'visible' };
    if (finished) {
      this.submitApp();
    }
    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
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
          >{stepIndex === 2 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex}>
              <Step>
                <StepLabel>Create app name</StepLabel>
              </Step>
              <Step>
                <StepLabel>Select org</StepLabel>
              </Step>
              <Step>
                <StepLabel>Select space</StepLabel>
              </Step>
            </Stepper>
            <Collapse in={!loading}>
              {this.renderContent()}
            </Collapse>
            <Dialog
              className="new-app-error"
              open={this.state.submitFail}
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {this.state.submitMessage}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button className="ok" color="primary" onClick={this.handleClose}>Ok</Button>
              </DialogActions>
            </Dialog>
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }
}
