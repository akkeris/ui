import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Step, Stepper, StepLabel, Select, MenuItem, Typography, CircularProgress,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import ConfirmationModal from '../ConfirmationModal';
import AutoSuggest from '../AutoSuggest';
import util from '../../services/util';
import BaseComponent from '../../BaseComponent';

const style = {
  root: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
    minHeight: 200,
    paddingBottom: '12px',
  },
  stepper: {
    height: '40px',
  },
  buttons: {
    back: {
      marginRight: 12,
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
  h6: {
    marginBottom: '12px',
  },
  bold: {
    fontWeight: 'bold',
  },
  stepDescription: {
    marginTop: '24px',
  },
  contentContainer: {
    margin: '0 32px', height: '200px', display: 'flex', flexDirection: 'column',
  },
  stepContainer: {
    flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  buttonContainer: {
    paddingTop: '12px',
  },
};

export default class AttachAddon extends BaseComponent {
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
    super.componentDidMount();
    this.getApps();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stepIndex !== prevState.stepIndex && this.state.stepIndex === 1) {
      this.getAddons(prevState);
    }
  }

  getApps = async () => {
    const { app } = this.props;
    try {
      const { data: apps } = await this.api.getApps();
      // Remove the current app from the results
      apps.splice(apps.findIndex(i => i.name.toLowerCase() === app.toLowerCase()), 1);
      this.setState({ apps, loading: false });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  getAddons = async (prevState) => {
    this.setState({ loading: true });
    const { app } = this.state;
    try {
      const { data: addons } = await this.api.getAppAddons(app);
      if (!addons || addons.length < 1) {
        this.setState(prevState, () => this.setState({ loadingErrorMessage: `Specified app "${app}" does not have any addons.`, loadingError: true }));
      }
      this.setState({ addons, addon: addons[0], loading: false });
    } catch (err) {
      if (!this.isCancel(err)) {
        this.setState(prevState, () => this.setState({ loadingErrorMessage: `Could not find specified app "${app}"`, loadingError: true }));
      }
    }
  }

  handleSearch = (searchText) => {
    this.setState({ app: searchText });
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
      await this.api.attachAddon(this.props.app, this.state.addon.id);
      ReactGA.event({
        category: 'ADDONS',
        action: 'Attached new addon',
      });

      // Add a pleasing amount of loading instead of flashing the indicator
      // for a variable amount of time
      setTimeout(() => this.props.onComplete('Addon Attached', true), 1000);
    } catch (error) {
      if (!this.isCancel(error)) {
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
            <AutoSuggest
              className={'app-search'}
              label="App"
              data={util.filterName(this.state.apps)}
              handleSearch={this.handleSearch}
              errorText={this.state.errorText}
              color="black"
              holdSelection
              initialValue={this.state.app}
            />
            <Typography variant="body2" style={style.stepDescription}>
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
            <Typography variant="body2" style={style.stepDescription}>
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
    const { stepIndex, loading } = this.state;

    return (
      <div style={style.contentContainer}>
        {!loading ? (
          <div style={style.stepContainer}>
            {this.renderStep(stepIndex)}
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
            onClick={stepIndex > 1 ? this.submitAddonAttachment : this.handleNext}
            disabled={loading || (stepIndex === 0 && this.state.app === '') || stepIndex > 2}
          >
            {stepIndex < 2 ? 'Next' : 'Finish'}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { stepIndex, app, addon } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    return (
      <div style={style.root}>
        <Stepper style={style.stepper} activeStep={stepIndex}>
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
        {this.renderContent()}
        <ConfirmationModal
          open={this.state.submitFail}
          onOk={this.handleClose}
          message={this.state.submitMessage}
          title="Error"
          className="attach-addon-error"
        />
        <ConfirmationModal
          open={this.state.loadingError}
          onOk={() => this.setState({ loadingError: false, loadingErrorMessage: '' })}
          message={this.state.loadingErrorMessage}
          title="Error"
        />
      </div>
    );
  }
}

AttachAddon.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
