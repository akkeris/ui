import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Step, Stepper, StepLabel, Select, MenuItem,
  Dialog, DialogActions, DialogContent,
} from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

import ConfirmationModal from '../ConfirmationModal';
import Search from '../Search';
import api from '../../services/api';
import util from '../../services/util';

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
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
    api.getApps().then((response) => {
      this.setState({
        apps: response.data,
        loading: false,
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stepIndex !== prevState.stepIndex && this.state.stepIndex === 1) {
      this.setState({ loading: true }); // eslint-disable-line react/no-did-update-set-state
      api.getAppAddons(this.state.app).then((response) => {
        this.setState({
          addons: response.data,
          addon: response.data[0],
          loading: false,
        });
      }).catch((err) => {
        this.setState(prevState, () => this.setState({ loadingErrorMessage: 'Could not find specified app', loadingError: true }));
      });
    }
  }

  getAddons() {
    return this.state.addons.map(addon => (
      <MenuItem
        className={addon.addon_service.name}
        key={addon.name}
        value={addon}
      >
        {addon.addon_service.name}
      </MenuItem>
    ));
  }

  getStepContent(stepIndex) {
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
            <p>
              The application name that has an addon you want to attach. Ex. my-test-app-dev
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <Select className="addon-menu" value={this.state.addon} onChange={this.handleAddonChange}>
              {this.getAddons()}
            </Select>
            <p>
              Select the addon you want to attach.
            </p>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
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
        finished: stepIndex >= 1,
        loading: stepIndex >= 1,
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

  submitAddonAttachment = () => {
    api.attachAddon(this.props.app, this.state.addon.name).then(() => {
      this.props.onComplete('Addon Attached');
    }).catch((error) => {
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
    });
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 32px' };
    if (finished) {
      this.submitAddonAttachment();
    } else {
      return (
        <div style={contentStyle}>
          <div>{this.getStepContent(stepIndex)}</div>
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
                {stepIndex === 1 ? 'Finish' : 'Next'}
              </Button>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { loading, stepIndex, finished } = this.state;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel>Select Addon Service</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Plan</StepLabel>
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
          <Dialog
            className="load-app-error"
            open={this.state.loadingError}
          >
            <DialogContent>
              {this.state.loadingErrorMessage}
            </DialogContent>
            <DialogActions>
              <Button
                className="ok"
                color="primary"
                onClick={() => this.setState({ loadingError: false, loadingErrorMessage: '' })}
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
