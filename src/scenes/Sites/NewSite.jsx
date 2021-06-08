import React from 'react';

import {
  Step, Stepper, StepLabel, Button, TextField, IconButton, Paper, Switch, CircularProgress,
  Typography, FormControl, FormControlLabel, RadioGroup, Radio, Tooltip,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import DocumentationIcon from '@material-ui/icons/DescriptionOutlined';
import { MuiThemeProvider } from '@material-ui/core/styles';
import deepmerge from 'deepmerge';
import History from '../../config/History';
import ConfirmationModal from '../../components/ConfirmationModal';
import BaseComponent from '../../BaseComponent';
import { truncstr } from '../../services/util';

const style = {
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '32px',
    width: '100%',
  },
  div: {
    display: 'flex',
    flexDirection: 'column',
    height: '420px',
  },
  contentStyle: {
    margin: '0 94px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  stepper: {
    width: '100%',
    margin: '0 auto',
    maxWidth: 900,
    height: '40px',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    wordBreak: 'break-word',
  },
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 24,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    back: {
      marginRight: 12,
    },
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
  textField: {
    description: { width: '600px' },
    domain: { minWidth: '50%' },
  },
  regionRadioGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    maxHeight: '180px',
  },
};

export default class NewSite extends BaseComponent {
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

  theme = parentTheme => deepmerge(parentTheme, {
    overrides: {
      MuiStepper: {
        root: {
          padding: '24px 0px',
        },
      },
    },
  });

  componentDidMount() {
    super.componentDidMount();
    this.getRegions();
  }

  getRegions = async () => {
    try {
      const { data: regions } = await this.api.getRegions();
      const { data: stacks } = await this.api.getStacks();
      regions.forEach((region, idx) => {
        regions[idx].stack = stacks.find(stack => stack.region.id === region.id).name;
      });
      this.setState({ regions, loading: false, region: regions[0].name });
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
      if (stepIndex + 1 <= 3) {
        this.setState({
          stepIndex: stepIndex + 1,
          errorText: null,
        });
      } else {
        this.setState({ stepIndex: stepIndex + 1 });
        this.submitSite();
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
      await this.api.createSite(this.state.domain, this.state.region, this.state.internal);
      ReactGA.event({
        category: 'SITES',
        action: 'Created new site',
      });
      History.get().push('/sites');
    } catch (error) {
      if (!this.isCancel(error)) {
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
    }
  };

  renderStepContent(stepIndex) {
    const { domain, errorText, region, internal } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div style={style.stepContainer}>
            <TextField
              className="site-name"
              label="Domain Name"
              value={domain}
              onChange={this.handleDomainChange}
              error={!!errorText}
              helperText={errorText || ''}
              style={style.textField.domain}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
            />
            <Typography variant="body1" style={style.stepDescription}>
              The domain name of a site must only use alphanumerics, hyphens and periods.
            </Typography>
          </div>
        );
      case 1:
        return (
          <div className="region" style={style.stepContainer}>
            <h3>Region</h3>
            <FormControl component="fieldset" className="radio-group">
              <RadioGroup
                aria-label="Select Region"
                name="region-radio-group"
                className="region-radio-group"
                value={region}
                onChange={this.handleRegionChange}
                style={style.regionRadioGroup}
              >
                {this.renderRegions()}
              </RadioGroup>
            </FormControl>
            {errorText && errorText !== '' && (
              <p style={style.error}>{errorText}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div style={style.stepContainer}>
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
              Select whether you want your site to route to internal or external apps.
            </Typography>
          </div>
        );
      case 3:
        return (
          <div className="new-site-summary" style={style.stepContainer}>
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
        return (
          <div style={style.loadingContainer}>
            <CircularProgress />
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
        label={`${region.name} (${region.stack})`}
        control={<Radio />}
      />
    ));
  }

  render() {
    const { stepIndex, submitFail, submitMessage, domain, region, internal } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    return (
      <MuiThemeProvider theme={this.theme}>
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex} style={style.stepper}>
              <Step>
                <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(truncstr(domain, 12))}>
                  Create domain
                </StepLabel>
              </Step>
              <Step>
                <StepLabel className="step-1-label" optional={stepIndex > 1 && renderCaption(region)}>
                  Select Region
                </StepLabel>
              </Step>
              <Step>
                <StepLabel className="step-2-label" optional={stepIndex > 2 && renderCaption(internal ? 'internal' : 'external')}>
                  Select Availability
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirm</StepLabel>
              </Step>
            </Stepper>
            <div style={style.contentStyle}>
              {this.renderStepContent(stepIndex)}
              {stepIndex < 4 && (
                <div style={style.buttons.div}>
                  <div>
                    <Button
                      className="back-button"
                      disabled={stepIndex === 0}
                      onClick={this.handlePrev}
                      style={style.buttons.back}
                    >Back</Button>

                    <Button
                      className="next"
                      color="primary"
                      variant="contained"
                      onClick={this.handleNext}
                    >{stepIndex === 3 ? 'Finish' : 'Next'}</Button>
                  </div>
                  <Tooltip title="Documentation" placement="top">
                    <IconButton
                      role="link"
                      tabIndex="0"
                      onClick={() => window.open('https://docs.akkeris.io/architecture/sites-and-routes.html')}
                    >
                      <DocumentationIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
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
