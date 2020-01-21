import React from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, MenuItem, Typography,
  Button, TextField, Select, CircularProgress,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import Search from '../Search';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';

const style = {
  radio: {
    paddingLeft: '14px',
  },
  root: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
    minHeight: 200,
    paddingBottom: '12px',
  },
  stepper: {
    height: 40,
  },
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 12,
    },
    back: {
      marginRight: 15,
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
    margin: '0 32px', height: '250px', display: 'flex', flexDirection: 'column',
  },
  stepContainer: {
    flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  buttonContainer: {
    paddingTop: '12px',
  },
  searchContainer: {
    maxWidth: '600px',
  },
};

export default class NewFormation extends BaseComponent {
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
      size: {},
      quantity: 1,
      type: 'web',
      port: 9000,
      command: '',
      errorText: '',
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getSizes();
  }

  getSizes = async () => {
    try {
      const { data: formationSizes } = await this.api.getFormationSizes();

      const sizes = [];
      formationSizes.forEach((size) => {
        if (size.name.indexOf('prod') === -1) {
          sizes.push(size);
        }
      });

      const groupedSizes = sizes.reduce((acc, size) => {
        const idx = acc.findIndex(e => e.label.toLowerCase() === size.type.toLowerCase());
        if (idx === -1) {
          acc.push({
            label: size.type.charAt(0).toUpperCase() + size.type.slice(1),
            options: [{
              value: size.name,
              label: `${size.name}: ${size.description}`,
            }],
          });
        } else {
          acc[idx].options.push({
            value: size.name,
            label: `${size.name}: ${size.description}`,
            memory: parseInt(size.resources.limits.memory, 10),
          });
        }
        return acc;
      }, []);

      groupedSizes.forEach(size => size.options.sort((a, b) => a.memory - b.memory));
      groupedSizes.sort((a, b) => {
        const la = a.label.toLowerCase();
        const lb = b.label.toLowerCase();
        if (la < lb) return -1;
        if (la > lb) return 1;
        return 0;
      });

      this.setState({
        sizes: groupedSizes,
        type: '',
        quantity: 1,
        loading: false,
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
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
    } else if (stepIndex === 2 && !this.state.size.value) {
      this.setState({ errorText: 'Field required' });
    } else if ((stepIndex === 3 && this.state.command === '' && this.state.type !== 'web') || (stepIndex === 3 && this.state.port === null && this.state.type === 'web')) {
      this.setState({ errorText: 'Field required' });
    } else if (!this.state.loading) {
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

  handleSizeChange = (event) => {
    this.setState({ errorText: '', size: event });
  }

  submitFormation = async () => {
    this.setState({ loading: true });
    try {
      await this.api.createFormation(
        this.props.app.name,
        this.state.size.value,
        this.state.quantity,
        this.state.type,
        this.state.type === 'web' ? this.state.port : null,
        this.state.command === '' ? null : this.state.command,
      );

      ReactGA.event({
        category: 'DYNOS',
        action: 'Created new formation',
      });

      // Add a pleasing amount of loading instead of flashing the indicator
      // for a variable amount of time
      setTimeout(() => this.props.onComplete('New Formation Added', true), 1000);
    } catch (error) {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          finished: false,
          stepIndex: 0,
          loading: false,
          size: {},
          type: '',
          port: '',
          command: '',
          quantity: 1,
          errorText: '',
        });
      }
    }
  }

  renderQuantity() {
    return this.quantities.map(quantity => (
      <MenuItem className={`q${quantity}`} key={quantity} value={quantity}>{quantity}</MenuItem>
    ));
  }

  renderStepContent(stepIndex) {
    const { type, quantity, size, sizes, port, errorText, command } = this.state;
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
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body2" style={style.stepDescription}>
              {'Enter a name for your new dyno.'}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <Select className="new-dropdown" value={quantity} onChange={this.handleChange('quantity')}>
              {this.renderQuantity()}
            </Select>
            <Typography variant="body2" style={style.stepDescription}>
              {'Select the number of dyno instances to be created.'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div style={style.searchContainer}>
            <Search
              options={sizes}
              value={size}
              onChange={this.handleSizeChange}
              placeholder="Select a Size"
              label="Size"
              helperText={errorText}
              error={!!errorText}
            />
          </div>
        );
      case 3:
        if (type === 'web') {
          const p = port === null ? '' : port;
          return (
            <div>
              <TextField
                className="new-port"
                label="Port"
                type="numeric"
                value={p}
                onChange={this.handleChange('port')}
                error={errorText.length > 0}
                helperText={errorText}
                onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
                autoFocus
              />
              <Typography variant="body2" style={style.stepDescription}>
                {`
                  Specify the port that your app will run on.
                  If your app listens to $PORT, then leave default.
                `}
              </Typography>
            </div>
          );
        }
        return (
          <div>
            <TextField
              className="new-command"
              label="Command"
              value={command || ''}
              onChange={this.handleChange('command')}
              error={errorText.length > 0}
              helperText={errorText}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body2" style={style.stepDescription}>
              {`
                The command to run when the build image spins up.
              `}
            </Typography>
          </div>
        );
      case 4:
        return (
          <div className="new-formation-summary">
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'['}
              <span style={style.bold}>{quantity}</span>
              {'] '}
              <span style={style.bold}>{type}</span>
              {' dyno(s) will be created with size  '}
              <span style={style.bold}>{size.value}</span>
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
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { stepIndex, loading } = this.state;

    return (
      <div style={style.contentContainer}>
        {!loading ? (
          <div style={style.stepContainer}>
            {this.renderStepContent(stepIndex)}
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
            onClick={stepIndex < 4 ? this.handleNext : this.submitFormation}
            disabled={loading}
          >
            {stepIndex === 4 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      stepIndex, submitFail, submitMessage, type, quantity, size,
    } = this.state;

    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;

    return (
      <div style={style.root}>
        <Stepper style={style.stepper} activeStep={stepIndex}>
          <Step>
            <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(type.length > 12 ? `${type.slice(0, 12)}...` : type)}>
              Select Type
            </StepLabel>
          </Step>
          <Step>
            <StepLabel className="step-1-label" optional={stepIndex > 1 && renderCaption(quantity)}>
              Select Quantity
            </StepLabel>
          </Step>
          <Step>
            <StepLabel className="step-2-label" optional={stepIndex > 2 && renderCaption(size.value)}>
              Select Size
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>Describe Port/Command</StepLabel>
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
          className="new-error"
        />
      </div>
    );
  }
}

NewFormation.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line
  onComplete: PropTypes.func.isRequired,
};
