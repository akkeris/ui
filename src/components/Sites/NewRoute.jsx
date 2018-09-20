import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import Button from '@material-ui/core/Button';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import Dialog from 'material-ui/Dialog';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

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
      <MenuItem key={app.id} value={app} primaryText={app.name} />
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField floatingLabelText="Source Path" value={this.state.source} onChange={this.handleSourceChange} errorText={this.state.errorText} />
            <p>
              Path of route after domain ex. `/` or `/source`.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <DropDownMenu value={this.state.app} onChange={this.handleAppChange}>
              {this.getApps()}
            </DropDownMenu>
            <p>
                          The app to route to.
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField floatingLabelText="Target Path" value={this.state.target} onChange={this.handleTargetChange} errorText={this.state.errorText} />
            <p>
              The path on the app to route to.
            </p>
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

  handleAppChange = (event, index, value) => {
    this.setState({ app: value });
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
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitRoute();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (<FlatButton
            label="Back"
            disabled={stepIndex === 0}
            onClick={this.handlePrev}
            style={style.buttons.back}
          />)}
          <Button
                        variant="contained"
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
                onClick={this.handleClose}
              />
            }
          >
            {this.state.submitMessage}
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
