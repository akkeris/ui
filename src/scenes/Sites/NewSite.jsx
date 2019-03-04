import React, { Component } from 'react';

import {
  Step, Stepper, StepLabel, Button, TextField, Collapse, Paper, Switch,
  Typography,
  FormControl, FormControlLabel, RadioGroup, Radio,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import api from '../../services/api';
import History from '../../config/History';
import ConfirmationModal from '../../components/ConfirmationModal';

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
      marginBottom: 24,
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
    width: '100%',
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
  h6: {
    marginBottom: '12px',
  },
  bold: {
    fontWeight: 'bold',
  },
  stepDescription: {
    marginTop: '24px',
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
        if (stepIndex + 1 <= 3) {
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
      History.get().push('/sites');
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
    const { domain, errorText, region, internal } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="site-name"
              label="Domain Name"
              value={domain}
              onChange={this.handleDomainChange}
              error={!!errorText}
              helperText={errorText || ''}
              style={{ minWidth: '50%' }}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'The domain name of a site must only use alphanumerics, hyphens and periods.'}
            </Typography>
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
                value={region}
                onChange={this.handleRegionChange}
              >
                {this.renderRegions()}
              </RadioGroup>
            </FormControl>
            {errorText !== '' && (
              <p style={style.error}>{errorText}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <FormControlLabel
              control={
                <Switch
                  checked={internal}
                  onChange={this.handleToggleInternal}
                  value="internal"
                  className="toggle"
                />
              }
              label="Internal"
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Select whether you want your site to route to internal or external apps.'}
            </Typography>
          </div>
        );
      case 3:
        return (
          <div>
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The '}
              <span style={style.bold}>{internal ? 'internal' : 'external'}</span>
              {' site '}
              <span style={style.bold}>{domain}</span>
              {' will be created in the region '}
              <span style={style.bold}>{region}</span>
              {'.'}
            </Typography>
          </div>
        );
      case 4:
        return '';
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
          >{stepIndex === 3 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex, submitFail, submitMessage, domain, region, internal } = this.state;
    const renderCaption = text => <Typography variant="caption">{text}</Typography>;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex}>
              <Step>
                <StepLabel optional={stepIndex > 0 && renderCaption(domain)}>
                  Create domain
                </StepLabel>
              </Step>
              <Step>
                <StepLabel optional={stepIndex > 1 && renderCaption(region)}>
                  Select Region
                </StepLabel>
              </Step>
              <Step>
                <StepLabel optional={stepIndex > 2 && renderCaption(internal ? 'internal' : 'external')}>
                  Select Availability
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirm</StepLabel>
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
              className="error"
            />
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }
}
