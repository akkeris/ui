import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Step, Stepper, StepLabel, Select, MenuItem, Typography, CircularProgress,
} from '@material-ui/core';
import ReactGA from 'react-ga';
import ConfirmationModal from '../ConfirmationModal';
import AutoSuggest from '../AutoSuggest';
import api from '../../services/api';
import util from '../../services/util';

const style = {
  stepper: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
    minHeight: 200,
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
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '50px',
      paddingTop: '36px',
      paddingBottom: '36px',
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
    this._cancelSource = api.getCancelSource();
    this.getApps();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stepIndex !== prevState.stepIndex && this.state.stepIndex === 1) {
      this.getAddons(prevState);
    }
  }

  componentWillUnmount() {
    this._cancelSource.cancel('Component unmounted.');
  }

  getApps = async () => {
    const { app } = this.props;
    try {
      const { data: apps } = await api.getApps(this._cancelSource.token);
      // Remove the current app from the results
      apps.splice(apps.findIndex(i => i.name.toLowerCase() === app.toLowerCase()), 1);
      this.setState({ apps, loading: false });
    } catch (err) {
      if (!api.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  getAddons = async (prevState) => {
    this.setState({ loading: true }); // eslint-disable-line react/no-did-update-set-state
    try {
      const response = await api.getAppAddons(this.state.app, this._cancelSource.token);
      this.setState({ addons: response.data, addon: response.data[0], loading: false });
    } catch (err) {
      if (!api.isCancel(err)) {
        this.setState(prevState, () => this.setState({ loadingErrorMessage: 'Could not find specified app', loadingError: true }));
      }
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
      await api.attachAddon(this.props.app, this.state.addon.id, this._cancelSource.token);
      ReactGA.event({
        category: 'ADDONS',
        action: 'Attached new addon',
      });
      this.props.onComplete('Addon Attached');
    } catch (error) {
      if (!api.isCancel(error)) {
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
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0px 32px 24px' };
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
                style={style.buttons.back}
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
        {loading && (
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        )}
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
