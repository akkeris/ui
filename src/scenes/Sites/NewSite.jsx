import React, { Component } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import Button from '@material-ui/core/Button';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Paper from 'material-ui/Paper';
import Dialog from 'material-ui/Dialog';
import Toggle from 'material-ui/Toggle';

import api from '../../services/api';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 12,
    },
    back: {
      marginRight: 12,
    },
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
  div: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
  },
  radio: {
    paddingLeft: '14px',
  },
  error: {
    color: 'red',
  },
};

export default class NewSite extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      errorText: null,
      submitFail: false,
      submitMessage: '',
      domain: '',
      region: '',
      regions: [],
      internal: false,
    };
  }

  componentDidMount() {
    api.getRegions().then((response) => {
      this.setState({
        regions: response.data,
        loading: false,
        region: response.data[0].name,
      });
    });
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField className="site-name" floatingLabelText="Domain name" value={this.state.domain} onChange={this.handleDomainChange} errorText={this.state.errorText} />
            <p>
                The domain name of a site must only use alphanumerics, hyphens and periods.
            </p>
          </div>
        );
      case 1:
        return (
          <div className="region">
            <h3>Region</h3>
            <RadioButtonGroup className="radio" name="regionSelect" style={style.radio} onChange={this.handleRegionChange} valueSelected={this.state.region}>
              {this.getRegions()}
            </RadioButtonGroup>
            {this.state.errorText !== '' && (
              <p style={style.error}>{this.state.errorText}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <Toggle
              className="toggle"
              label="Internal"
              toggled={this.state.internal}
              onToggle={this.handleToggleInternal}
            />
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  getRegions() {
    return this.state.regions.map(region => (
      <RadioButton
        className={region.name}
        key={region.name}
        value={region.name}
        label={region.name}
      />
    ));
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleDomainChange = (event) => {
    this.setState({
      domain: event.target.value,
    });
  }

  handleToggleInternal = (event, isInputChecked) => {
    this.setState({ internal: isInputChecked });
  }

  handleRegionChange = (event, value) => {
    this.setState({
      region: value,
    });
  }

  handleNext = () => {
    if ((this.state.stepIndex === 0 && this.state.domain === '') || (this.state.stepIndex === 1 && this.state.region === '')) {
      this.setState({ errorText: 'field required' });
    } else {
      const { stepIndex } = this.state;
      if (!this.state.loading) {
        if (stepIndex + 1 <= 2) {
          this.setState({
            stepIndex: stepIndex + 1,
            errorText: null,
          });
        } else {
          this.setState({
            finished: true,
            loading: true,
          });
        }
      }
    }
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex - 1,
        errorText: null,
        loading: false,
      });
    }
  }

  submitSite = () => {
    api.createSite(this.state.domain, this.state.region, this.state.internal).then(() => {
      window.location = '#/sites';
    }).catch((error) => {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        errorText: null,
        domain: '',
        region: '',
        internal: false,
        loading: false,
      });
    });
  };

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitSite();
    }
    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (<FlatButton
            className="back"
            label="Back"
            disabled={stepIndex === 0}
            onClick={this.handlePrev}
            style={style.buttons.back}
          />)}
          <Button
                        variant="contained"
            className="next"
            label={stepIndex === 2 ? 'Finish' : 'Next'}
            primary
            onClick={this.handleNext}
          />
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex}>
              <Step>
                <StepLabel>Create domain</StepLabel>
              </Step>
              <Step>
                <StepLabel>Select Region</StepLabel>
              </Step>
              <Step>
                <StepLabel>Select Internal</StepLabel>
              </Step>
            </Stepper>
            <ExpandTransition loading={loading} open>
              {this.renderContent()}
            </ExpandTransition>
            <Dialog
              className="error"
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
        </Paper>
      </MuiThemeProvider>
    );
  }
}
