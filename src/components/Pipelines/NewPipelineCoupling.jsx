import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ExpandTransition from 'material-ui/internal/ExpandTransition';

import api from '../../services/api';
import Search from '../../components/Search';
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

export default class NewPipelineCoupling extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      errorText: null,
      stepIndex: 0,
      apps: [],
      app: '',
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

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <Search className={`${this.props.stage}-app-search`} label="App" data={util.filterName(this.state.apps)} handleSearch={this.handleSearch} searchText="" errorText={this.state.errorText} />
            <p>
              The application name or id to add to the pipeline. Ex. my-test-app-dev
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

  handleNext = () => {
    const { stepIndex } = this.state;
    if (!this.state.loading) {
      this.setState({
        loading: stepIndex >= 0,
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 0,
        errorText: null,
      });
    }
  };

  submitPipelineCoupling = () => {
    api.createPipelineCoupling(this.props.pipeline, this.state.app, this.props.stage).then(() => {
      this.props.onComplete('Coupling Added');
    }).catch((error) => {
      this.setState({
        finished: false,
        stepIndex: 0,
        errorText: null,
        app: '',
        loading: false,
      });
      this.props.onError(error.response.data);
    });
  };

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };

    if (finished) {
      this.submitPipelineCoupling();
    }

    return (
      <div style={contentStyle}>
        <div>{this.getStepContent(stepIndex)}</div>
      </div>
    );
  }

  render() {
    const { loading, stepIndex } = this.state;

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={style.stepper}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel>Select App</StepLabel>
            </Step>
          </Stepper>
          <ExpandTransition loading={loading} open>
            {this.renderContent()}
          </ExpandTransition>
        </div>
      </MuiThemeProvider>
    );
  }
}

NewPipelineCoupling.propTypes = {
  pipeline: PropTypes.string.isRequired,
  stage: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};
