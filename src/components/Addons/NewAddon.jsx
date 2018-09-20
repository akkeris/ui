import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import Button from '@material-ui/core/Button';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';

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
      plans: [],
      plan: {},
    };
  }

  componentDidMount() {
    api.getAddonServices().then((response) => {
      this.setState({
        services: response.data,
        service: response.data[0],
        loading: false,
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stepIndex !== prevState.stepIndex && this.state.stepIndex === 1) {
      this.setState({ loading: true }); // eslint-disable-line react/no-did-update-set-state
      api.getAddonServicePlans(this.state.service.name).then((response) => {
        this.setState({
          plans: response.data,
          plan: response.data[0],
          loading: false,
        });
      });
    }
  }

  getServices() {
    return this.state.services.map(service => (
      <MenuItem
        className={service.human_name}
        key={service.id}
        value={service}
        label={service.human_name}
        primaryText={service.human_name}
      />
    ));
  }

  getPlans() {
    return this.state.plans.map(plan => (
      <MenuItem
        className={plan.human_name}
        key={plan.name}
        value={plan}
        label={plan.name}
        primaryText={plan.name}
      />
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <DropDownMenu className="service-menu" value={this.state.service} onChange={this.handleServiceChange}>
              {this.getServices()}
            </DropDownMenu>
            <p>
              Select the akkeris addon you would like to attach to your app.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <DropDownMenu className="plan-menu" value={this.state.plan} onChange={this.handlePlanChange}>
              {this.getPlans()}
            </DropDownMenu>
            <div className="plan-info">
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

  handleServiceChange = (event, index, value) => {
    this.setState({
      service: value,
    });
  }

  handlePlanChange = (event, index, value) => {
    this.setState({
      plan: value,
    });
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
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitAddon();
    } else {
      return (
        <div style={contentStyle}>
          <div>{this.getStepContent(stepIndex)}</div>
          <div style={style.buttons.div}>
            {stepIndex > 0 && (<FlatButton
              className="back"
              label="Back"
              disabled={stepIndex === 0}
              onClick={this.handlePrev}
              style={style.buttons.Back}
            />)}
            <Button
              variant="contained"
              className="next"
              label={stepIndex === 1 ? 'Finish' : 'Next'}
              primary
              onClick={this.handleNext}
            />
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { loading, stepIndex, finished } = this.state;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
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
      </MuiThemeProvider>
    );
  }
}

NewAddon.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
