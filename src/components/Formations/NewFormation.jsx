import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Radio, RadioGroup,
  FormControl, FormLabel, FormControlLabel, MenuItem, Typography,
  Button, TextField, Select, Collapse,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';

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
    maxWidth: 800,
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
  body1: {
    marginTop: '12px',
  },
  h6: {
    marginBottom: '12px',
  },
  bold: {
    fontWeight: 'bold',
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
      size: '',
      quantity: 1,
      type: 'web',
      port: 9000,
      command: '',
      errorText: '',
    };
  }

  componentDidMount() {
    this.getSizes();
  }

  getSizes = async () => {
    const { data: formationSizes } = await api.getFormationSizes();
    const sizes = [];
    formationSizes.forEach((size) => {
      if (size.name.indexOf('prod') === -1) {
        sizes.push(size);
      }
    });
    sizes.sort((a, b) =>
      parseInt(a.resources.limits.memory, 10) - parseInt(b.resources.limits.memory, 10),
    );
    this.setState({
      sizes,
      size: sizes[0].name,
      type: '',
      quantity: 1,
      loading: false,
    });
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
      if (stepIndex === 4) {
        this.submitFormation();
      }
      this.setState({
        stepIndex: stepIndex + 1,
        loading: stepIndex >= 4,
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

  submitFormation = async () => {
    try {
      await api.createFormation(
        this.props.app,
        this.state.size,
        this.state.quantity,
        this.state.type,
        this.state.type === 'web' ? this.state.port : null,
        this.state.command === '' ? null : this.state.command,
      );
      this.props.onComplete('New Formation Added');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        size: this.state.sizes[0].name,
        type: '',
        port: '',
        command: '',
        quantity: 1,
        errorText: '',
      });
    }
  }

  renderSizes() {
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

  renderQuantity() {
    return this.quantities.map(quantity => (
      <MenuItem className={`q${quantity}`} key={quantity} value={quantity}>{quantity}</MenuItem>
    ));
  }

  renderStepContent(stepIndex) {
    const { type, quantity, size, port, errorText, command } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="new-type"
              label="Type"
              type="text"
              value={type}
              onChange={this.handleChange('type')}
              error={errorText.length > 0}
              helperText={errorText}
            />
            <p>
              Enter a name for your new dyno.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <Select className="new-dropdown" value={quantity} onChange={this.handleChange('quantity')}>
              {this.renderQuantity()}
            </Select>
            <p>
              Select the number of dyno instances to be created.
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <FormControl component="fieldset">
              <FormLabel component="h1" style={{ color: 'black' }}>
                Sizes
              </FormLabel>
              <RadioGroup
                name="sizeSelect"
                className="new-size"
                value={size}
                onChange={this.handleChange('size')}
              >
                {this.renderSizes()}
              </RadioGroup>
            </FormControl>
          </div>
        );
      case 3:
        if (type === 'web') {
          const p = port === null ? '' : port;
          return (
            <div>
              <TextField className="new-port" label="Port" type="numeric" value={p} onChange={this.handleChange('port')} error={errorText.length > 0} helperText={errorText} />
              <p>
                Specify the port that your app will run on
                (If your app listens to $PORT, then leave default)
              </p>
            </div>
          );
        }
        return (
          <div>
            <TextField className="new-command" label="Command" value={command || ''} onChange={this.handleChange('command')} error={errorText.length > 0} helperText={errorText} />
            <p>
                The command to run when the build image spins up,
                this if left off will default to the RUN command in the docker image.
            </p>
          </div>
        );
      case 4:
        return (
          <div>
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'['}
              <span style={style.bold}>{quantity}</span>
              {'] '}
              <span style={style.bold}>{type}</span>
              {' dyno(s) will be created with size  '}
              <span style={style.bold}>{size}</span>
              {', and will '}
              {type === 'web' && port === 9000 && 'use the default port.'}
              {type === 'web' && port !== 9000 && (
                <React.Fragment>
                  {'use port '}<span style={style.bold}>{port}</span>{'.'}
                </React.Fragment>
              )}
              {type !== 'web' && command === '' && 'use the RUN command in the docker image.'}
              {type !== 'web' && command !== '' && (
                <React.Fragment>
                  {'run "'}<span style={style.bold}>{command}</span>{'".'}
                </React.Fragment>
              )}
            </Typography>
          </div>
        );
      // Have to have this otherwise it displays "you're a long way from home sonny jim" on submit
      case 5:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 32px', overflow: 'visible' };

    return (
      <div style={contentStyle}>
        <div>{this.renderStepContent(stepIndex)}</div>
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
            {stepIndex === 4 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      loading, stepIndex, submitFail, submitMessage,
      type, quantity, size,
    } = this.state;

    const renderCaption = text => <Typography variant="caption">{text}</Typography>;

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel optional={stepIndex > 0 && renderCaption(type)}>
                Select Type</StepLabel>
            </Step>
            <Step>
              <StepLabel optional={stepIndex > 1 && renderCaption(quantity)}>
                Select Quantity</StepLabel>
            </Step>
            <Step>
              <StepLabel optional={stepIndex > 2 && renderCaption(size)}>
                Select Size</StepLabel>
            </Step>
            <Step>
              <StepLabel> {/* optional={stepIndex > 3 && renderCaption(service.label)}> */}
                Describe Port/Command</StepLabel>
            </Step>
            <Step>
              <StepLabel>
                Confirm</StepLabel>
            </Step>
          </Stepper>
          <Collapse in={!loading}>
            {this.renderContent()}
          </Collapse>
          <ConfirmationModal
            open={submitFail}
            onOk={this.handleClose}
            message={submitMessage}
            title="Error"
            className="new-error"
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

NewFormation.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
