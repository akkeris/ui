import React, { Component } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import Button from '@material-ui/core/Button';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import Checkbox from 'material-ui/Checkbox';
import Paper from 'material-ui/Paper';
import Dialog from 'material-ui/Dialog';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import api from '../../services/api';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const tags = ['internal', 'socs', 'prod', 'dev', 'qa'];

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
  compliance: {
    paddingLeft: '14px',
  },
};

export default class NewApp extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      finished: false,
      stepIndex: 0,
      errorText: null,
      submitFail: false,
      submitMessage: '',
      space: '',
      description: '',
      compliance: [],
      stacks: [],
      stack: [],
    };
  }

  componentDidMount() {
    api.getStacks().then((response) => {
      const stacks = response.data;
      this.setState({
        stacks,
        stack: stacks[0].name,
        loading: false,
      });
    });
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField className="space-name" floatingLabelText="Space name" value={this.state.space} onChange={this.handleSpaceChange} errorText={this.state.errorText} />
            <p>
              Create a space! Enter a name that will define your space.
              (this is typically an org id with environment ex. perf-dev, perf-qa, perf-prod).
              This will be used to group apps, and provides some service discovery.
            </p>
          </div>
        );
      case 1:
        return (
          <div>
            <DropDownMenu className="dropdown" value={this.state.stack} onChange={this.handleStackChange}>
              {this.getStacks()}
            </DropDownMenu>
            <p>
            Stacks are unique runtimes in akkeris.
            One or more of them may exist in any one region.
            The difference between stacks may be physical location,
            an upgrade to backend components on one stack vs the
            other or on prem vs cloud offerings.
            A space must soley exist in one stack
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <TextField className="space-description" floatingLabelText="Description" value={this.state.description} onChange={this.handleDescriptionChange} />
            <p>
              Give a description of your space.
            </p>
          </div>
        );
      case 3:
        return (
          <div>
            <h3>Compliance Tags</h3>
            <div style={style.compliance}>
              {this.getCompliance()}
            </div>
            <p>
              Add these to your space.
              (ex. socs allows socs credentials to be added to apps in this space
              and redacts the info from the console.)
            </p>
          </div>
        );
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  getCompliance = () => tags.map(tag => (
    <Checkbox
      className={`checkbox-${tag}`}
      key={tag}
      onCheck={this.handleCheck}
      value={tag}
      label={tag}
      checked={this.state.compliance.indexOf(tag) !== -1}
    />
  ))

  getStacks() {
    return this.state.stacks.map(stack => (
      <MenuItem className={stack.name} key={stack.id} value={stack.name} label={`Stack: ${stack.name}`} primaryText={stack.name} />
    ));
  }

  handleStackChange = (event, index, value) => {
    this.setState({
      stack: value,
    });
  }
  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleSpaceChange = (event) => {
    this.setState({
      space: event.target.value,
    });
  }

  handleDescriptionChange = (event) => {
    this.setState({
      description: event.target.value,
    });
  }

  handleCheck = (event, checked) => {
    const { compliance } = this.state;
    if (checked) {
      compliance.push(event.target.value);
    } else {
      compliance.splice(compliance.indexOf(event.target.value), 1);
    }
    this.setState({ compliance });
  }

  handleNext = () => {
    if (this.state.stepIndex === 0 && this.state.space === '') {
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

  submitSpace = () => {
    api.createSpace(
      this.state.space,
      this.state.description,
      this.state.compliance,
      this.state.stack,
    )
      .then(() => {
        window.location = '#/spaces';
      }).catch((error) => {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          finished: false,
          stepIndex: 0,
          errorText: null,
          space: '',
          description: '',
          compliance: [],
          stack: this.state.stacks[0].name,
          loading: false,
        });
      });
  };

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 16px', overflow: 'hidden' };
    if (finished) {
      this.submitSpace();
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
            label={stepIndex === 3 ? 'Finish' : 'Next'}
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
                <StepLabel>Create space name</StepLabel>
              </Step>
              <Step>
                <StepLabel>Select stack</StepLabel>
              </Step>
              <Step>
                <StepLabel>Describe space</StepLabel>
              </Step>
              <Step>
                <StepLabel>Select tags</StepLabel>
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
