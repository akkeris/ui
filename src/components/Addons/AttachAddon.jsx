import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';

import Search from '../Search';
import api from '../../services/api';
import util from '../../services/util';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
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
      });
    }
  }

  getAddons() {
    return this.state.addons.map(addon => (
      <MenuItem
        className={addon.addon_service.name}
        key={addon.name}
        value={addon}
        label={addon.addon_service.name}
        primaryText={addon.addon_service.name}
      />
    ));
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <Search className={'app-search'} label="App" data={util.filterName(this.state.apps)} handleSearch={this.handleSearch} searchText="" errorText={this.state.errorText} />
            <p>
              The application name that has an addon you want to attach. Ex. my-test-app-dev
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <DropDownMenu className="addon-menu" value={this.state.addon} onChange={this.handleAddonChange}>
              {this.getAddons()}
            </DropDownMenu>
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

  handleAddonChange = (event, index, value) => {
    this.setState({
      addon: value,
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
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitAddonAttachment();
    } else {
      return (
        <div style={contentStyle}>
          <div>{this.getStepContent(stepIndex)}</div>
          <div style={style.buttons.div}>
            {stepIndex > 0 && (<FlatButton
              className="back"
              label="Back"
              disabled={stepIndex === 0}
              onTouchTap={this.handlePrev}
              style={style.buttons.Back}
            />)}
            {stepIndex > 0 && (
              <RaisedButton
                className="next"
                label={stepIndex === 1 ? 'Finish' : 'Next'}
                primary
                onTouchTap={this.handleNext}
              />
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
      <MuiThemeProvider muiTheme={muiTheme}>
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
            modal
            actions={
              <FlatButton
                className="ok"
                label="Ok"
                primary
                onTouchTap={this.handleClose}
              />}
          >
            {this.state.submitMessage}
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

AttachAddon.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
