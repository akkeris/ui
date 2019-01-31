import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, FormControl,
  Select, MenuItem, Dialog, Button, Input,
  DialogTitle, DialogActions, DialogContent,
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

export default class NewAddon extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      services: [],
      service: {},
      serviceid: '',
      plans: [],
      plan: {},
    };
  }

  async componentDidMount() {
    let { data: services } = await api.getAddonServices();
    this.setState({ services, service: services[0], loading: false });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.stepIndex !== prevState.stepIndex && this.state.stepIndex === 1) {
      this.setState({ loading: true }); // eslint-disable-line react/no-did-update-set-state
      let { data: plans } = await api.getAddonServicePlans(this.state.service.id);
      plans = plans.filter((x) => x.state !== "deprecated")
      this.setState({ plans, plan: plans[0], loading: false});
    }
  }

  getServices() {
    return this.state.services.map(service => (
      <MenuItem
        className={service.human_name}
        key={service.id}
        value={service.id}
      >
        {service.human_name}
      </MenuItem>
    ));
  }

  getPlans() {
    return this.state.plans.map(plan => (
      <MenuItem
        className={plan.human_name}
        key={plan.name}
        value={plan.id}
      >
        {plan.name}
      </MenuItem>
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <FormControl className="service-form">
              <Select
                autoWidth
                className="service-menu"
                value={this.state.service.id}
                onChange={this.handleServiceChange}
                input={<Input name="service" id="service-helper" />}
              >
                {this.getServices()}
              </Select>
            </FormControl>
            <p>
              Select the akkeris addon you would like to attach to your app.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <FormControl className="plan-form">
              <Select
                autoWidth
                className="plan-menu"
                value={this.state.plan ? this.state.plan.id : ''}
                onChange={this.handlePlanChange}
                input={<Input name="plan" id="plan-helper" />}
              >
                {this.getPlans()}
              </Select>
            </FormControl>
            <div className="plan-info" style={{ marginBottom: '15px' }}>
              {this.state.plan.price && this.state.plan.price.cents !== 0 && (
                <span className="plan-price">
                  <b>{this.formatPrice(this.state.plan.price.cents)}/mo</b>
                </span>
              )}
              {this.state.plan.price && this.state.plan.price.cents === 0 && (
                <span className="plan-price">
                  <b>{this.formatPrice(0)}/mo</b>
                </span>
              )}
              <br />
              <span className="plan-description">
                {this.state.plan.description}
              </span>
            </div>
            <p>
              Select the plan for your addon (please only use larger plans for prod)
            </p>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  formatPrice(cents) { // eslint-disable-line class-methods-use-this
    const dollars = cents / 100;
    return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleServiceChange = (event) => {
    const serviceid = event.target.value;
    const service = this.state.services.find(a => a.id === serviceid);
    this.setState({ service, serviceid });
  }

  handlePlanChange = (event) => {
    const plan = this.state.plans.find(a => a.id === event.target.value);
    this.setState({ plan });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 1,
        loading: stepIndex >= 1,
      });
    }
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex - 1,
        loading: false,
      });
    }
  }

  submitAddon = () => {
    api.createAddon(this.props.app, this.state.plan.id).then(() => {
      this.props.onComplete('Addon Created');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        plans: [],
        plan: {},
      });
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'hidden' };
    if (finished) {
      this.submitAddon();
    } else {
      return (
        <div style={contentStyle}>
          <div>{this.getStepContent(stepIndex)}</div>
          <div style={style.buttons.div}>
            {stepIndex > 0 && (
              <Button
                className="back"
                disabled={stepIndex === 0}
                onClick={this.handlePrev}
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
              {stepIndex === 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { loading, stepIndex, finished } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel>Select Addon Service</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Plan</StepLabel>
            </Step>
          </Stepper>
          {(!loading || finished) && (
            <div>
              {this.renderContent()}
            </div>
          )}
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

NewAddon.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
