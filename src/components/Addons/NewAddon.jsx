import React from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, CircularProgress, LinearProgress, Button, Typography,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import Search from '../Search';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';

const style = {
  root: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
    height: '266px',
    paddingBottom: '12px',
  },
  stepper: {
    height: '40px',
  },
  buttons: {
    back: {
      marginRight: 12,
    },
  },
  refresh: {
    div: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexGrow: 1,
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
  contentContainer: {
    margin: '0 32px', height: '200px', display: 'flex', flexDirection: 'column',
  },
  stepContainer: {
    flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  buttonContainer: {
    paddingTop: '12px',
  },
};

const isEmpty = obj => (obj && obj.constructor === Object && Object.entries(obj).length === 0);

export default class NewAddon extends BaseComponent {
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
    super.componentDidMount();
    this.getServices();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stepIndex !== prevState.stepIndex && this.state.stepIndex === 1) {
      this.getPlans();
    }
  }

  getServices = async () => {
    try {
      const { data: services } = await this.api.getAddonServices();
      const groupedServices = [{ label: 'Services', options: [] }, { label: 'Credentials', options: [] }];
      services.forEach((addon) => {
        const formattedAddon = { value: addon.id, label: addon.human_name };
        groupedServices[addon.human_name.toLowerCase().includes('credential') ? 1 : 0].options.push(formattedAddon);
      });
      this.setState({ services, groupedServices, loading: false });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  getPlans = async () => {
    try {
      this.setState({ loading: true });
      let { data: plans } = await this.api.getAddonServicePlans(this.state.serviceid);
      plans = plans.filter(x => x.state !== 'deprecated').map(x => ({
        value: x.id,
        label: x.name,
        human_name: x.human_name,
        price: x.price,
        description: x.description,
      }));
      this.setState({ plans, loading: false });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
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
        plan: stepIndex === 1 ? {} : this.state.plan,
      });
    }
  }

  submitAddon = async () => {
    try {
      this.setState({ loading: true });

      let { data: addon } = await this.api.createAddon(
        this.props.app,
        this.state.plan.value,
      );

      for (let i = 0; i < 2000; i++) {
        if (i % 20 === 0) {
          ({ data: addon } = await this.api.getAddon(this.props.app, addon.id)); // eslint-disable-line
        }
        if (i === 1999) {
          throw new Error('It seems this addon is taking too long to complete its task. When the provisioning finishes your application will automatically be restarted with the new addon.');
        }
        if (addon.state !== 'provisioning') {
          ReactGA.event({
            category: 'ADDONS',
            action: 'Created new addon',
          });

          // Add a pleasing amount of loading instead of flashing the indicator
          // for a variable amount of time
          setTimeout(() => this.props.onComplete('Addon Created', true), 1000);
          this.setState({ provisioning: false, provisionStatus: 0, provisionMessage: '' });
          return;
        }
        this.setState({ provisioning: true, provisionStatus: Math.atan(0.2 * i) / (Math.PI / 2), provisionMessage: addon.state_description || 'Provisioning...', loading: false });

        await new Promise((res, rej) => setTimeout(res, 500)); // eslint-disable-line
      }
    } catch (error) {
      if (!this.isCancel(error)) {
        if (error.response) {
          this.setState({
            submitMessage: error.response ? error.response.data : error.message,
            submitFail: true,
            stepIndex: 0,
            loading: false,
            plans: [],
            plan: {},
          });
        } else {
          console.error(error); // eslint-disable-line no-console
        }
      }
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
            <Typography variant="body2" style={style.stepDescription}>
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
                value={(plan && plan.value) ? plan : {}}
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
            <Typography variant="body2" style={style.stepDescription}>
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
    const { stepIndex, serviceid, plan, loading } = this.state;
    return (
      <div style={style.contentContainer}>
        {!loading ? (
          <div style={style.stepContainer}>
            {this.renderStep(stepIndex)}
          </div>
        ) : (
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} status="loading" />
          </div>
        )}
        <div style={style.buttonContainer}>
          <Button
            className="back"
            disabled={stepIndex === 0}
            onClick={this.handlePrev}
            style={style.buttons.back}
          >
            Back
          </Button>
          <Button
            variant="contained"
            className="next"
            color="primary"
            onClick={stepIndex > 1 ? this.submitAddon : this.handleNext}
            disabled={loading || stepIndex > 2 || (stepIndex === 0 ? (serviceid === '') : (isEmpty(plan)))}
          >
            {stepIndex < 2 ? 'Next' : 'Finish'}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      stepIndex, provisioning, provisionMessage, provisionStatus,
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
      <div style={style.root}>
        <div style={provisionStyle}>
          <Stepper style={style.stepper} activeStep={stepIndex}>
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
          {this.renderContent()}
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
