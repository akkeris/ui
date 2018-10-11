import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Radio, RadioGroup, Dialog, DialogActions,
  FormControl, FormLabel, FormControlLabel, MenuItem,
  Button, TextField, Select, DialogContent, Collapse,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import api from '../../services/api';

const muiTheme = createMuiTheme({
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
    MuiSwitchBase: {
      root: {
        padding: '8px',
      },
    },
    MuiFormControlLabel: {
      root: {
        marginLeft: '-8px',
      },
    },
  },
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
      errorText: '',
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
        type: '',
        quantity: 1,
        loading: false,
      });
    });
  }

  getSizes() {
    return this.state.sizes.map(size => (
      <FormControlLabel
        key={size.name}
        value={size.name}
        className={size.name}
        label={`${size.resources.limits.memory} (${size.name})`}
        control={
          <Radio color="primary" />
        }
      />
    ));
  }

  getQuantity() {
    return this.quantities.map(quantity => (
      <MenuItem className={`q${quantity}`} key={quantity} value={quantity}>{quantity}</MenuItem>
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            {/* <h3 className="type-header" >Type</h3> */}
            <div>
              <TextField className="new-type" label="Type" type="text" value={this.state.type} onChange={this.handleChange('type')} error={this.state.errorText.length > 0} helperText={this.state.errorText} />
              <p>
                Enter a name for your new dyno.
              </p>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <Select className="new-dropdown" value={this.state.quantity} onChange={this.handleChange('quantity')}>
              {this.getQuantity()}
            </Select>
            <p>
              Select the amount of instances for your app.
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <FormControl component="fieldset">
              <FormLabel
                component="h1"
                style={{ color: 'black' }}
              >
                Sizes
              </FormLabel>
              <RadioGroup
                name="sizeSelect"
                className="new-size"
                value={this.state.size}
                onChange={this.handleChange('size')}
              >
                {this.getSizes()}
              </RadioGroup>
            </FormControl>
          </div>
        );
      case 3:
        if (this.state.type === 'web') {
          const port = this.state.port === null ? '' : this.state.port;
          return (
            <div>
              <TextField className="new-port" label="Port" type="numeric" value={port} onChange={this.handleChange('port')} error={this.state.errorText.length > 0} helperText={this.state.errorText} />
              <p>
                Specify the port that your app will run on
                (If your app listens to $PORT, then leave default)
              </p>
            </div>
          );
        }
        return (
          <div>
            <TextField className="new-command" label="Command" value={this.state.command || ''} onChange={this.handleChange('command')} error={this.state.errorText.length > 0} helperText={this.state.errorText} />
            <p>
                The command to run when the build image spins up,
                this if left off will default to the RUN command in the docker image.
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
    if (stepIndex === 0 && /[^a-zA-Z0-9]/.test(this.state.type)) {
      this.setState({ errorText: 'Alphanumeric characters only' });
    } else if (stepIndex === 0 && !this.state.type) {
      this.setState({ errorText: 'Field required' });
    } else if ((stepIndex === 3 && this.state.command === '' && this.state.type === 'worker') || (stepIndex === 3 && this.state.port === null && this.state.type === 'web')) {
      this.setState({ errorText: 'Field required' });
    } else if (!this.state.loading) {
      if (stepIndex === 3) {
        this.submitFormation();
      }
      this.setState({
        stepIndex: stepIndex + 1,
        loading: stepIndex >= 3,
        errorText: '',
      });
    }
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex - 1,
        loading: false,
        errorText: '',
      });
    }
  }

  handleChange = name => (event) => {
    if (name === 'port') {
      const port = parseInt(event.target.value, 10);
      if (Number.isNaN(port)) {
        this.setState({
          port: event.target.value === '' ? null : this.state.port,
        });
      } else {
        this.setState({
          port,
        });
      }
    } else {
      this.setState({
        [name]: event.target.value,
      });
    }
  }

  submitFormation = () => {
    console.log('submitFormation()');
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
        errorText: '',
      });
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'visible' };
    // if (finished) {
    //   this.submitFormation();
    // }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
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
          <Button
            variant="contained"
            className="next"
            color="primary"
            onClick={this.handleNext}
          >
            {stepIndex === 3 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
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
            <Collapse in={!loading}>
              {this.renderContent()}
            </Collapse>
          }
          <Dialog
            className="new-error"
            open={this.state.submitFail}
          >
            <DialogContent>
              {this.state.submitMessage}
            </DialogContent>
            <DialogActions>
              <Button
                className="ok"
                label="Ok"
                color="primary"
                onClick={this.handleClose}
              >
                Ok
              </Button>
            </DialogActions>
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
