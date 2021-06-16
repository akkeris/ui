import React from 'react';
import {
  Step, Stepper, StepLabel, Button, TextField, Checkbox, Paper, CircularProgress, IconButton,
  MenuItem, Select, FormControl, InputLabel, FormControlLabel, Typography, Tooltip,
} from '@material-ui/core';
import DocumentationIcon from '@material-ui/icons/DescriptionOutlined';
import ReactGA from 'react-ga';
import { MuiThemeProvider } from '@material-ui/core/styles';
import deepmerge from 'deepmerge';
import History from '../../config/History';
import ConfirmationModal from '../../components/ConfirmationModal';
import BaseComponent from '../../BaseComponent';
import { truncstr } from '../../services/util';

const tags = ['internal', 'socs', 'prod', 'dev', 'qa'];

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
  compliance: {
    paddingLeft: '14px',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    height: '132px',
    width: '312px',
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
    name: { width: '300px' },
    stack: { width: '300px' },
    description: { width: '600px' },
  },
};

export default class NewApp extends BaseComponent {
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
    this.getStacks();
  }

  getStacks = async () => {
    try {
      const { data: stacks } = await this.api.getStacks();
      this.setState({ stacks, stack: stacks[0].name, loading: false });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
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
      if (stepIndex + 1 <= 4) {
        this.setState({
          stepIndex: stepIndex + 1,
          errorText: null,
        });
      } else {
        this.setState({ stepIndex: stepIndex + 1 });
        this.submitSpace();
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
      await this.api.createSpace(
        this.state.space,
        this.state.description,
        this.state.compliance,
        this.state.stack,
      );
      ReactGA.event({
        category: 'SPACES',
        action: 'Created new space',
      });
      History.get().push('/spaces');
    } catch (error) {
      if (!this.isCancel(error)) {
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
        });
      }
    }
  };

  renderStepContent(stepIndex) {
    const { space, stack, compliance, errorText, description } = this.state;
    switch (stepIndex) {
      case 0:
        return (
          <div style={style.stepContainer}>
            <TextField
              className="space-name"
              label="Space Name"
              value={space}
              onChange={this.handleSpaceChange}
              error={!!errorText}
              helperText={errorText || ''}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              style={style.textField.name}
            />
            <Typography variant="body1" style={style.stepDescription}>
              Choose a name that will define your space.
              Typically, this will be an organization ID with an environment.<br />
              (e.g. perf-dev, perf-qa, perf-prd)
            </Typography>
          </div>
        );
      case 1:
        return (
          <div style={style.stepContainer}>
            <FormControl className="stack-form">
              <InputLabel htmlFor="stack-select">Stack</InputLabel>
              <Select
                className="stack-menu"
                value={stack}
                onChange={this.handleStackChange}
                inputProps={{
                  id: 'stack-select',
                  name: 'stack',
                }}
                style={style.textField.stack}
              >
                {this.renderStacks()}
              </Select>
            </FormControl>
            <Typography variant="body1" style={style.stepDescription}>
              Stacks are unique runtimes in Akkeris. A space can only exist in one
              stack.<br /><br />
              The difference between stacks may include physical location, backend
              component versions, or on prem vs cloud offerings.
            </Typography>
          </div>
        );
      case 2:
        return (
          <div style={style.stepContainer}>
            <TextField
              className="space-description"
              label="Description"
              value={description}
              onChange={this.handleDescriptionChange}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              style={style.textField.description}
            />
            <Typography variant="body1" style={style.stepDescription}>
              {'Include a description for your space (optional)'}
            </Typography>
          </div>
        );
      case 3:
        return (
          <div style={style.stepContainer}>
            <h3>Compliance Tags</h3>
            <div style={style.compliance}>
              {this.renderCompliance()}
            </div>
            <Typography variant="body1" style={style.stepDescription}>
              Add these to your space if your apps require specific compliance or protection.
            </Typography>
          </div>
        );
      case 4:
        return (
          <div className="new-space-summary" style={style.stepContainer}>
            <Typography variant="h6" style={style.h6}>Summary</Typography>
            <Typography variant="subtitle1">
              {'The space '}
              <span style={style.bold}>{space}</span>
              {' will be created in the stack '}
              <span style={style.bold}>{stack}</span>
              {compliance.length > 0 && (
                <React.Fragment>
                  {' with the following compliance(s): '}
                  <span style={style.bold}>{compliance.join(', ')}</span>
                </React.Fragment>
              )}
              {'.'}
            </Typography>
          </div>
        );
      case 5:
        return (
          <div style={style.loadingContainer}>
            <CircularProgress />
          </div>
        );
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
        value={`${stack.name}`}
      >{stack.name} ({stack.region.name})</MenuItem>
    ));
  }

  render() {
    const {
      stepIndex, submitFail, submitMessage, space, stack,
    } = this.state;
    const renderCaption = text => <Typography variant="caption" className="step-label-caption">{text}</Typography>;
    return (
      <MuiThemeProvider theme={this.theme}>
        <Paper style={style.paper}>
          <div style={style.div}>
            <Stepper activeStep={stepIndex} style={style.stepper}>
              <Step>
                <StepLabel className="step-0-label" optional={stepIndex > 0 && renderCaption(truncstr(space, 12))}>
                  Create space name
                </StepLabel>
              </Step>
              <Step>
                <StepLabel className="step-1-label" optional={stepIndex > 1 && renderCaption(stack)}>
                  Select stack
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>Describe space</StepLabel>
              </Step>
              <Step>
                <StepLabel>Select tags</StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirm</StepLabel>
              </Step>
            </Stepper>
            <div style={style.contentStyle}>
              {this.renderStepContent(stepIndex)}
              {stepIndex < 5 && (
                <div style={style.buttons.div}>
                  <div>
                    <Button
                      className="back"
                      disabled={stepIndex === 0}
                      onClick={this.handlePrev}
                      style={style.buttons.back}
                    >Back</Button>
                    <Button
                      variant="contained"
                      className="next"
                      color="primary"
                      onClick={this.handleNext}
                    >{stepIndex === 4 ? 'Finish' : 'Next'}</Button>
                  </div>
                  <Tooltip title="Documentation" placement="top">
                    <IconButton
                      role="link"
                      tabindex="0"
                      onClick={() => window.open('https://docs.akkeris.io/architecture/spaces.html')}
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
