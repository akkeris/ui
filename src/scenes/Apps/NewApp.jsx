import React, { Component } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import Button from '@material-ui/core/Button';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import Paper from 'material-ui/Paper';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';

import api from '../../services/api';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 12,
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
  },
  div: {
    width: '100%',
    maxWidth: 700,
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
              floatingLabelText="App name"
              value={this.state.app}
              onChange={this.handleAppChange}
              errorText={this.state.errorText}
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
            <DropDownMenu className="dropdown" value={this.state.org} onChange={this.handleOrgChange}>
              {this.getOrgs()}
            </DropDownMenu>
            <p>
              Specify the organization this app belongs to. This will link attribution and alerting.
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <DropDownMenu
              className="dropdown"
              style={style.menu}
              value={this.state.space}
              onChange={this.handleSpaceChange}
            >
              {this.getSpaces()}
            </DropDownMenu>
            <p>
              Specify the space your app will live in.
              Spaces contain multiple apps and configurations at a similar stage in a pipeline
              (ex. dev, qa, prod)
            </p>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  getSpaces() {
    return this.state.spaces.map(space => (
      <MenuItem className={space.name} key={space.id} value={space.name} label={`Space: ${space.name}`} primaryText={space.name} />
    ));
  }

  getOrgs() {
    return this.state.orgs.map(org => (
      <MenuItem className={org.name} key={org.id} value={org.name} label={`Org: ${org.name}`} primaryText={org.name} />
    ));
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
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitApp();
    }
    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (<FlatButton
            className="back"
            label="Back"
            disabled={stepIndex === 0}
            onClick={this.handlePrev}
            style={style.buttons.back}
          />)}
          <Button
                        variant="contained"
            className="next"
            label={stepIndex === 2 ? 'Finish' : 'Next'}
            primary
            onClick={this.handleNext}
          />
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
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
            <ExpandTransition loading={loading} open>
              {this.renderContent()}
            </ExpandTransition>
            <Dialog
              className="new-app-error"
              open={this.state.submitFail}
              modal
              actions={
                <FlatButton
                  className="ok"
                  label="Ok"
                  primary
                  onClick={this.handleClose}
                />}
            >
              {this.state.submitMessage}
            </Dialog>
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }
}
