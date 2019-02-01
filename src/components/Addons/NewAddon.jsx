import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, FormControl, CircularProgress, LinearProgress,
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

  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '350px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
};

export default class NewAddon extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      stepIndex: 0,
      submitFail: false,
      provisioning: false,
      provisionStatus: 0,
      provisionMessage: '',
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

  submitAddon = async () => {
    try {
      this.setState({ loading: true })
      let {data: addon} = await api.createAddon(this.props.app, this.state.plan.id);

      for(let i=0; i < 2000; i++) {
        if (i % 20 === 0) {
          ({data: addon} = await api.getAddon(this.props.app, addon.id))
        }
        if(i === 1999) {
          throw new Error('It seems this addon is taking too long to complete its task. When the provisioning finishes your application will automatically be restarted with the new addon.')
        }
        if(addon.state !== 'provisioning') {
          this.props.onComplete('Addon Created');
          this.setState({ provisioning:false, provisionStatus:0, provisionMessage:'', loading:false });
          return
       } else {
          this.setState({ provisioning:true, provisionStatus:Math.atan(0.2 * i) / (Math.PI/2), provisionMessage:addon.state_description || "Provisioning...", loading:false });
        }
        await new Promise((res, rej) => setTimeout(res, 500))
      }
    } catch (error) {
      if(!error.response) {
        console.error(error)
      }
      this.setState({
        submitMessage: error.response ? error.response.data : error.message,
        submitFail: true,
        stepIndex: 0,
        loading: false,
        plans: [],
        plan: {},
      });
    }
  }

  renderContent() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'hidden' };
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
          {stepIndex === 0 && (
            <Button
              variant="contained"
              className="next"
              color="primary"
              onClick={this.handleNext}
            >
              Next
            </Button>
          )}

          {stepIndex > 0 && (
            <Button
              variant="contained"
              className="next"
              color="primary"
              onClick={this.submitAddon}
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    );
    return null;
  }

  render() {
    const { loading, stepIndex  } = this.state;
    let provisionStyle = {display:'block', ...style.stepper};
    let provisioningStyle = {display:'none', ...style.stepper};

    if(this.state.provisioning) {
      provisionStyle.display = 'none';
      provisioningStyle.display = 'block';
    }

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={provisionStyle}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel>Select Addon Service</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Plan</StepLabel>
            </Step>
          </Stepper>
          {(!loading) && (
            <div>
              {this.renderContent()}
            </div>
          )}
          {(loading) && (
            <div style={style.refresh.div}>
              <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
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
        <div style={provisioningStyle}>
          <label>{this.state.provisionMessage}</label>
          <LinearProgress variant="determinate" value={this.state.provisionStatus * 100} />
        </div>
      </MuiThemeProvider>
    );
  }
}

NewAddon.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
