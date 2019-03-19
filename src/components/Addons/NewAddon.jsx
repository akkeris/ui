import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, CircularProgress, LinearProgress, Button, Typography,
} from '@material-ui/core';
import Search from '../Search';
import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';

const style = {
  stepper: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
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
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '50px',
      paddingTop: '36px',
      paddingBottom: '36px',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
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
    plans = plans.filter(x => x.state !== 'deprecated').map(x => ({ value: x.id, label: x.name, human_name: x.human_name, price: x.price, description: x.description }));
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
        loading: stepIndex >= 2,
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
    const { groupedServices, service, plans, plan } = this.state;
    let planPrice;
    if (plan.price) { planPrice = this.formatPrice(plan.price.cents !== 0 ? plan.price.cents : 0); }
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <div style={style.selectContainer}>
              <Search
                options={groupedServices}
                value={service}
                onChange={this.handleServiceChange}
                placeholder="Search for an Addon"
              />
            </div>
            <Typography variant="body1" style={style.stepDescription}>
              {'Select the akkeris addon you would like to attach to your app.'}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <div style={style.selectContainer}>
              <Search
                options={plans}
                value={plan ? plan.id : ''}
                onChange={this.handlePlanChange}
                placeholder="Search for a Plan"
              />
            </div>
            {!isEmpty(plan) && (
              <div className="plan-info" style={{ marginBottom: '12px' }}>
                {plan.price && (
                  <span className="plan-price">
                    <b>{planPrice}/mo</b>
                  </span>
                )}
                <br />
                <span className="plan-description">
                  {plan.description}
                </span>
              </div>
            )}
            <Typography variant="body1" style={style.stepDescription}>
              {'Select the plan for your addon (please only use larger plans for prod)'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div className="new-addon-summary">
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The addon '}
              <span style={style.bold}>{service.label}</span>
              {' with plan '}
              <span style={style.bold}>{plan.human_name} ({planPrice})</span>
              {' will be created and attached to this app.'}
            </Typography>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { stepIndex, serviceid, plan } = this.state;
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
              style={style.buttons.back}
            >
              Back
            </Button>
          )}
          {(stepIndex === 0 || stepIndex === 1) && (
            <Button
              variant="contained"
              className="next"
              color="primary"
              onClick={this.handleNext}
              disabled={stepIndex === 0 ? (serviceid === '') : (isEmpty(plan))}
            >
              Next
            </Button>
          )}
          {stepIndex > 1 && (
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
    const {
      loading, stepIndex, provisioning, provisionMessage, provisionStatus,
      submitFail, submitMessage, service, plan,
    } = this.state;
    const provisionStyle = { display: 'block', ...style.stepper };
    const provisioningStyle = { display: 'none', ...style.stepper };

    if (provisioning) {
      provisionStyle.display = 'none';
      provisioningStyle.display = 'block';
    }

    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;

    return (
      <div>
        <div style={provisionStyle}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(service.label)}>
                Select Addon Service
              </StepLabel>
            </Step>
            <Step>
              <StepLabel className="step-1-label"optional={stepIndex > 1 && renderCaption(plan.human_name)}>
                Select Plan
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirm</StepLabel>
            </Step>
          </Stepper>
          {!loading ? (
            <div>
              {this.renderContent()}
            </div>
          ) : (
            <div style={style.refresh.div}>
              <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
            </div>
          )}
          <ConfirmationModal
            open={submitFail}
            onOk={this.handleClose}
            message={submitMessage}
            title="Error"
            className="new-addon-error"
          />
        </div>
        <div style={provisioningStyle}>
          <label>{provisionMessage}</label> {/* eslint-disable-line */}
          <LinearProgress variant="determinate" value={provisionStatus * 100} />
        </div>
      </div>
    );
  }
}

NewAddon.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
