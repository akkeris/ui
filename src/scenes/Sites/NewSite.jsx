import React, { Component } from 'react';

import {
  Step, Stepper, StepLabel, Button, TextField, Collapse, Paper, Switch,
  Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText,
  FormControl, FormControlLabel, RadioGroup, Radio,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import api from '../../services/api';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
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
    this.getRegions();
  }

  getRegions = async () => {
    const { data: regions } = await api.getRegions();
    this.setState({ regions, loading: false, region: regions[0].name });
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

  submitSite = async () => {
    try {
      await api.createSite(this.state.domain, this.state.region, this.state.internal);
      window.location = '/sites';
    } catch (error) {
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
    }
  };

  renderStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="site-name"
              label="Domain Name"
              value={this.state.domain}
              onChange={this.handleDomainChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
              style={{ minWidth: '50%' }}
            />
            <p>
                The domain name of a site must only use alphanumerics, hyphens and periods.
            </p>
          </div>
        );
      case 1:
        return (
          <div className="region">
            <h3>Region</h3>
            <FormControl component="fieldset" className="radio-group">
              <RadioGroup
                aria-label="Select Region"
                name="region-radio-group"
                className="region-radio-group"
                value={this.state.region}
                onChange={this.handleRegionChange}
              >
                {this.renderRegions()}
              </RadioGroup>
            </FormControl>
            {this.state.errorText !== '' && (
              <p style={style.error}>{this.state.errorText}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.internal}
                  onChange={this.handleToggleInternal}
                  value="internal"
                  className="toggle"
                />
              }
              label="Internal"
            />
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderRegions() {
    return this.state.regions.map(region => (
      <FormControlLabel
        className={region.name}
        key={region.name}
        value={region.name}
        label={region.name}
        control={<Radio />}
      />
    ));
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 58px', overflow: 'hidden' };
    if (finished) {
      this.submitSite();
    }
    return (
      <div style={contentStyle}>
        <div>{this.renderStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (
            <Button
              className="back-button"
              disabled={stepIndex === 0}
              onClick={this.handlePrev}
              style={style.buttons.back}
            >Back</Button>
          )}
          <Button
            className="next"
            color="primary"
            variant="contained"
            onClick={this.handleNext}
          >{stepIndex === 2 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
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
            <Collapse in={!loading}>
              {this.renderContent()}
            </Collapse>
            <Dialog
              className="error"
              open={this.state.submitFail}
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {this.state.submitMessage}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button className="ok" color="primary" onClick={this.handleClose}>Ok</Button>
              </DialogActions>
            </Dialog>
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }
}
