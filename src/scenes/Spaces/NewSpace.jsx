import React, { Component } from 'react';
import {
  Step, Stepper, StepLabel, Button, TextField, Collapse, Checkbox, Paper,
  MenuItem, Select, FormControl, InputLabel, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
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
    margin: 'auto',
  },
  compliance: {
    paddingLeft: '14px',
    display: 'flex',
    flexDirection: 'column',
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
    this.getStacks();
  }

  getStacks = async () => {
    const { data: stacks } = await api.getStacks();
    this.setState({ stacks, stack: stacks[0].name, loading: false });
  }

  handleStackChange = (event) => {
    this.setState({
      stack: event.target.value,
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

  submitSpace = async () => {
    try {
      await api.createSpace(
        this.state.space,
        this.state.description,
        this.state.compliance,
        this.state.stack,
      );
      window.location = '#/spaces';
    } catch (error) {
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
    }
  };

  renderStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <TextField
              className="space-name"
              label="Space Name"
              value={this.state.space}
              onChange={this.handleSpaceChange}
              error={!!this.state.errorText}
              helperText={this.state.errorText ? this.state.errorText : ''}
            />
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
            <FormControl className="stack-form">
              <InputLabel htmlFor="stack-select">Stack</InputLabel>
              <Select
                className="stack-menu"
                value={this.state.stack}
                onChange={this.handleStackChange}
                inputProps={{
                  id: 'stack-select',
                  name: 'stack',
                }}
              >
                {this.renderStacks()}
              </Select>
            </FormControl>
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
            <TextField
              className="space-description"
              label="Description"
              value={this.state.description}
              onChange={this.handleDescriptionChange}
            />
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
              {this.renderCompliance()}
            </div>
            <p>
              Add these to your space.
              (ex. socs allows socs credentials to be added to apps in this space
              and redacts the info from the console.)
            </p>
          </div>
        );
      // need this otherwise "You're a long way ..." shows up when you hit finish
      case 4:
        return '';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  renderCompliance = () => tags.map(tag => (
    <FormControlLabel
      control={
        <Checkbox
          className={`checkbox-${tag}`}
          key={tag}
          onChange={this.handleCheck}
          value={tag}
          checked={this.state.compliance.indexOf(tag) !== -1}
        />
      }
      label={tag}
    />
  ))

  renderStacks() {
    return this.state.stacks.map(stack => (
      <MenuItem
        className={stack.name}
        key={stack.id}
        value={stack.name}
      >{stack.name}</MenuItem>
    ));
  }

  renderContent() {
    const { finished, stepIndex } = this.state;
    const contentStyle = { margin: '0 58px', overflow: 'hidden' };
    if (finished) {
      this.submitSpace();
    }
    return (
      <div style={contentStyle}>
        <div>{this.renderStepContent(stepIndex)}</div>
        <div style={style.buttons.div}>
          {stepIndex > 0 && (
            <Button
              className="back"
              disabled={stepIndex === 0}
              onClick={this.handlePrev}
              style={style.buttons.back}
            >Back</Button>
          )}
          <Button
            variant="contained"
            className="next"
            color="primary"
            onClick={this.handleNext}
          >{stepIndex === 3 ? 'Finish' : 'Next'}</Button>
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
            {
              <Collapse in={!loading}>
                {this.renderContent()}
              </Collapse>
            }
            <Dialog
              className="error"
              open={this.state.submitFail}
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>{this.state.submitMessage}</DialogContent>
              <DialogActions>
                <Button
                  className="ok"
                  color="primary"
                  onClick={this.handleClose}
                >OK</Button>
              </DialogActions>
            </Dialog>
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }
}
