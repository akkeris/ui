import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, CircularProgress, LinearProgress,
  Dialog, Button, Typography, DialogTitle, DialogActions, DialogContent,
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Select from '../Select';
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
  selectContainer: {
    maxWidth: '400px',
  },
};

const isEmpty = obj => (obj && obj.constructor === Object && Object.entries(obj).length === 0);

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
      groupedServices: [],
    };
  }

  componentDidMount() {
    this.getServices();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stepIndex !== prevState.stepIndex && this.state.stepIndex === 1) {
      this.getPlans();
    }
  }

  getServices = async () => {
    const { data: services } = await api.getAddonServices();
    const groupedServices = [{ label: 'Services', options: [] }, { label: 'Credentials', options: [] }];
    services.forEach((addon) => {
      const formattedAddon = { value: addon.id, label: addon.human_name };
      groupedServices[addon.human_name.toLowerCase().includes('credential') ? 1 : 0].options.push(formattedAddon);
    });
    this.setState({ services, groupedServices, loading: false });
  }

  getPlans = async () => {
    this.setState({ loading: true });
    let { data: plans } = await api.getAddonServicePlans(this.state.serviceid);
    plans = plans.filter(x => x.state !== 'deprecated').map(x => ({ value: x.id, label: x.name, price: x.price, description: x.description }));
    this.setState({ plans, loading: false });
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
    const { groupedServices } = this.state;
    const service = groupedServices[event.label.toLowerCase().includes('credential') ? 1 : 0].options.find(a => a.value === event.value);
    this.setState({ service, serviceid: event.value });
  }

  handlePlanChange = (event) => {
    const plan = this.state.plans.find(a => a.value === event.value);
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
      this.setState({ loading: true });
      let { data: addon } = await api.createAddon(this.props.app, this.state.plan.value);

      for (let i = 0; i < 2000; i++) {
        if (i % 20 === 0) {
          ({ data: addon } = await api.getAddon(this.props.app, addon.id)); // eslint-disable-line
        }
        if (i === 1999) {
          throw new Error('It seems this addon is taking too long to complete its task. When the provisioning finishes your application will automatically be restarted with the new addon.');
        }
        if (addon.state !== 'provisioning') {
          this.props.onComplete('Addon Created');
          this.setState({ provisioning: false, provisionStatus: 0, provisionMessage: '', loading: false });
          return;
        }
        this.setState({ provisioning: true, provisionStatus: Math.atan(0.2 * i) / (Math.PI / 2), provisionMessage: addon.state_description || 'Provisioning...', loading: false });

        await new Promise((res, rej) => setTimeout(res, 500)); // eslint-disable-line
      }
    } catch (error) {
      if (!error.response) {
        console.error(error);
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

  renderStep(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <div style={style.selectContainer}>
              <Select
                options={this.state.groupedServices}
                value={this.state.service}
                onChange={this.handleServiceChange}
                placeholder="Search for an Addon"
              />
            </div>
            <Typography variant="body1">
              Select the akkeris addon you would like to attach to your app.
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <div style={style.selectContainer}>
              <Select
                options={this.state.plans}
                value={this.state.plan ? this.state.plan.id : ''}
                onChange={this.handlePlanChange}
                placeholder="Search for a Plan"
              />
            </div>
            {!isEmpty(this.state.plan) && (
              <div className="plan-info" style={{ marginBottom: '12px' }}>
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
            )}
            <Typography variant="body1">
              Select the plan for your addon (please only use larger plans for prod)
            </Typography>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 32px' };
    return (
      <div style={contentStyle}>
        <div>{this.renderStep(stepIndex)}</div>
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
              disabled={this.state.serviceid === ''}
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
  }

  render() {
    const { loading, stepIndex } = this.state;
    const provisionStyle = { display: 'block', ...style.stepper };
    const provisioningStyle = { display: 'none', ...style.stepper };

    if (this.state.provisioning) {
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
          <label>{this.state.provisionMessage}</label> {/* eslint-disable-line */}
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
