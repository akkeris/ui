import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Step, Stepper, StepLabel, Select, MenuItem,
  Dialog, DialogActions, DialogContent, Typography,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import ConfirmationModal from '../ConfirmationModal';
import Search from '../Search';
import api from '../../services/api';
import util from '../../services/util';

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#0097a7',
    },
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
    MuiFormControl: {
      root: {
        marginBottom: '15px',
      },
    },
  },
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

export default class AttachAddon extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      apps: [],
      app: '',
      addons: [],
      addon: {},
      loadingError: false,
      loadingErrorMessage: '',
    };
  }

  componentDidMount() {
    this.getApps();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stepIndex !== prevState.stepIndex && this.state.stepIndex === 1) {
      this.getAddons(prevState);
    }
  }

  getApps = async () => {
    const { app } = this.props;
    const { data: apps } = await api.getApps();
    // Remove the current app from the results
    apps.splice(apps.findIndex(i => i.name.toLowerCase() === app.toLowerCase()), 1);
    this.setState({ apps, loading: false });
  }

  getAddons = async (prevState) => {
    this.setState({ loading: true }); // eslint-disable-line react/no-did-update-set-state
    try {
      const response = await api.getAppAddons(this.state.app);
      this.setState({ addons: response.data, addon: response.data[0], loading: false });
    } catch (err) {
      this.setState(prevState, () => this.setState({ loadingErrorMessage: 'Could not find specified app', loadingError: true }));
    }
  }

  handleSearch = (searchText) => {
    this.setState({ app: searchText });
    this.handleNext();
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleAddonChange = (event) => {
    this.setState({
      addon: event.target.value,
    });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 2,
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
      });
    }
  }

  submitAddonAttachment = async () => {
    try {
      await api.attachAddon(this.props.app, this.state.addon.id);
      this.props.onComplete('Addon Attached');
    } catch (error) {
      this.setState({
        submitMessage: error.response.data,
        submitFail: true,
        finished: false,
        stepIndex: 0,
        loading: false,
        addons: [],
        addon: {},
        app: '',
      });
    }
  }

  renderAddons = () => (
    this.state.addons.map(addon => (
      <MenuItem
        className={addon.addon_service.name}
        key={addon.name}
        value={addon}
      >
        {addon.addon_service.name}
      </MenuItem>
    ))
  )

  renderStep(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <Search
              className={'app-search'}
              label="App"
              data={util.filterName(this.state.apps)}
              handleSearch={this.handleSearch}
              errorText={this.state.errorText}
              color="black"
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Select the application that has an addon that you want to attach (e.g. test-dev).'}
            </Typography>
          </div>
        );
      case 1:
        return (
          <div>
            <Select className="addon-menu" value={this.state.addon} onChange={this.handleAddonChange}>
              {this.renderAddons()}
            </Select>
            <Typography variant="body1" style={style.stepDescription}>
              {'Select the addon you want to attach.'}
            </Typography>
          </div>
        );
      case 2:
        return (
          <div className="attach-addon-summary">
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The addon '}
              <span style={style.bold}>
                {this.state.addon.addon_service.name} ({this.state.addon.name})
              </span>
              {' from the app '}
              <span style={style.bold}>{this.state.app}</span>
              {' will be attached.'}
            </Typography>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px' };
    if (finished) {
      this.submitAddonAttachment();
    } else {
      return (
        <div style={contentStyle}>
          <div>{this.renderStep(stepIndex)}</div>
          <div style={style.buttons.div}>
            {stepIndex > 0 && (
              <Button
                className="back"
                disabled={stepIndex === 0}
                onClick={this.handlePrev}
                style={style.buttons.Back}
              >
                Back
              </Button>
            )}
            {stepIndex > 0 && (
              <Button
                variant="contained"
                className="next"
                color="primary"
                onClick={this.handleNext}
              >
                {stepIndex === 2 ? 'Finish' : 'Next'}
              </Button>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { loading, stepIndex, finished, app, addon } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(app)}>
                Select App
              </StepLabel>
            </Step>
            <Step>
              <StepLabel className="step-1-label" optional={stepIndex > 1 && renderCaption(addon.addon_service.name)}>
                Select Addon
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirm</StepLabel>
            </Step>
          </Stepper>
          {(!loading || finished) && (
            <div>
              {this.renderContent()}
            </div>
          )}
          <Dialog
            className="attach-addon-error"
            open={this.state.submitFail}
          >
            <DialogContent>
              {this.state.submitMessage}
            </DialogContent>
            <DialogActions>
              <Button
                className="ok"
                color="primary"
                onClick={this.handleClose}
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
          <ConfirmationModal
            open={this.state.loadingError}
            onOk={() => this.setState({ loadingError: false, loadingErrorMessage: '' })}
            message={this.state.loadingErrorMessage}
            title="Error"
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

AttachAddon.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
