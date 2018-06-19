import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';

import api from '../../services/api';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  radio: {
    paddingLeft: '14px',
  },
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

export default class NewFormation extends Component {
  constructor(props, context) {
    super(props, context);
    this.types = '';
    this.quantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      sizes: [],
      size: null,
      quantity: null,
      type: null,
      port: 9000,
      command: '',
      errorText: null,
    };
  }

  componentDidMount() {
    api.getFormationSizes().then((response) => {
      const sizes = [];
      response.data.forEach((size) => {
        if (size.name.indexOf('prod') === -1) {
          sizes.push(size);
        }
      });
      sizes.sort((a, b) =>
        parseInt(a.resources.limits.memory, 10) - parseInt(b.resources.limits.memory, 10));
      this.setState({
        sizes,
        size: sizes[0].name,
        type: null,
        quantity: 1,
        loading: false,
      });
    });
  }

  getSizes() {
    return this.state.sizes.map(size => (
      <RadioButton
        className={size.name}
        key={size.name}
        value={size.name}
        label={`${size.resources.limits.memory} (${size.name})`}
      />
    ));
  }

  getQuantity() {
    return this.quantities.map(quantity => (
      <MenuItem className={`q${quantity}`} key={quantity} value={quantity} primaryText={quantity} />
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <h3 className="type-header" >Type</h3>
            <div>
              <TextField className="new-type" floatingLabelText="Type" type="text" value={this.state.type} onChange={this.handleTypeChange} errorText={this.state.errorText} />
              <p>
                Enter a name for your new dyno.
              </p>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <DropDownMenu className="new-dropdown" value={this.state.quantity} onChange={this.handleQuantityChange}>
              {this.getQuantity()}
            </DropDownMenu>
            <p>
              Select the amount of instances for your app.
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <h3>Sizes</h3>
            <RadioButtonGroup className="new-size" name="sizeSelect" style={style.radio} onChange={this.handleSizeChange} valueSelected={this.state.size}>
              {this.getSizes()}
            </RadioButtonGroup>
          </div>
        );
      case 3:
        if (this.state.type === 'web') {
          const port = this.state.port === null ? '' : this.state.port;
          return (
            <div>
              <TextField className="new-port" floatingLabelText="Port" type="numeric" value={port} onChange={this.handlePortChange} errorText={this.state.errorText} />
              <p>
                Specify the port that your app will run on
                (If your app listens to $PORT, then leave default)
              </p>
            </div>
          );
        }
        return (
          <div>
            <TextField className="new-command" floatingLabelText="Command" value={this.state.command || ''} onChange={this.handleCommandChange} errorText={this.state.errorText} />
            <p>
                The command to run when the build image spins up,
                this if left off will default to the RUN command in the docker image.
            </p> Port
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
    if (stepIndex === 0 && /[^a-zA-Z0-9]/.test(this.state.type)) {
      this.setState({ errorText: 'Alphanumeric characters only' });
    } else if (stepIndex === 0 && !this.state.type ) {
      this.setState({ errorText: 'Field required' });
    }
    else if ((stepIndex === 3 && this.state.command === '' && this.state.type === 'worker') || (stepIndex === 3 && this.state.port === null && this.state.type === 'web')) {
      this.setState({ errorText: 'Field required' });
    } else if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 3,
        loading: stepIndex >= 3,
        errorText: null
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

  handleSizeChange = (event, value) => {
    this.setState({
      size: value,
    });
  }

  handleTypeChange = (event, value) => {
    this.setState({
      type: value,
    });
  }

  handleQuantityChange = (event, index, value) => {
    this.setState({ quantity: value });
  }

  handlePortChange = (event) => {
    const port = parseInt(event.target.value, 10);
    this.setState({
      port: Number.isNaN(port) ? (event.target.value === '' ? null : this.state.port) : port, // eslint-disable-line no-nested-ternary
    });
  }

  handleCommandChange = (event) => {
    this.setState({
      command: event.target.value,
    });
  }

  submitFormation = () => {
    api.createFormation(this.props.app, this.state.size, this.state.quantity, this.state.type, (this.state.type === 'web' ? this.state.port : null), (this.state.command === '' ? null : this.state.command)).then(() => {
      this.props.onComplete('New Formation Added');
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        size: this.state.sizes[0].name,
        type: null,
        port: null,
        command: null,
        quantity: 1,
        errorText: null,
      });
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitFormation();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (<FlatButton
            className="back"
            label="Back"
            disabled={stepIndex === 0}
            onTouchTap={this.handlePrev}
            style={style.buttons.back}
          />)}
          <RaisedButton
            className="next"
            label={stepIndex === 3 ? 'Finish' : 'Next'}
            primary
            onTouchTap={this.handleNext}
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
              <StepLabel>Select Type</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Quantity</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Size</StepLabel>
            </Step>
            <Step>
              <StepLabel>Describe Port/Command</StepLabel>
            </Step>
          </Stepper>
          {
            <ExpandTransition loading={loading} open>
              {this.renderContent()}
            </ExpandTransition>
          }
          <Dialog
            className="new-error"
            open={this.state.submitFail}
            modal
            actions={
              <FlatButton
                className="ok"
                label="Ok"
                primary
                onTouchTap={this.handleClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

NewFormation.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
