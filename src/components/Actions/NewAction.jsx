import React from 'react';
import PropTypes from 'prop-types';
import {
  Step, Stepper, StepLabel, Button, TextField, Typography, CircularProgress,
  Tooltip, IconButton, Grid, Checkbox, FormControlLabel, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';
import ReactGA from 'react-ga';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';
import Search from '../Search';

const style = {
  root: {
    width: '100%',
    maxWidth: 700,
    margin: 'auto',
    minHeight: 200,
    paddingBottom: '12px',
  },
  stepper: {
    height: 40,
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
  stepDescription: {
    marginTop: '24px',
  },
  h6: {
    marginBottom: '12px',
  },
  bold: {
    fontWeight: 'bold',
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
  stepContent: {
    inputStep: {
      root: {
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexGrow: 1,
      },
    },
    summaryStep: {
      root: {
        height: '200px',
        display: 'flex',
        wordWrap: 'anywhere',
        overflowY: 'auto',
      },
      wrapper: {
        height: 'min-content',
        margin: 'auto 0',
      },
    },
  },
  contentContainer: {
    margin: '0 32px', height: '440px', display: 'flex', flexDirection: 'column',
  },
  stepContainer: {
    flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  buttonContainer: {
    paddingTop: '12px',
  },
  events: {
    header: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '70px',
    },
    label: {
      fontSize: '14px',
      paddingRight: '8px',
    },
    checkAllContainer: {
      borderTop: '1px solid black',
      marginTop: '5px',
      paddingTop: '5px',
    },
    gridContainer: {
      width: '550px',
    },
    checkbox: {
      marginRight: '6px',
      padding: '6px',
    },
  },
};

export default class NewBuild extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      finished: false,
      stepIndex: 0,
      submitFail: false,
      submitMessage: '',
      errorText: null,
      name: '',
      description: '',
      sizes: [],
      size: {},
      image: '',
      command: '',
      configvars: '',
      eventsDialogOpen: false,
      checkedAll: false,
      events: [],
      availableHooks: [],
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getSizes();
  }

  // Copy of the getSizes function in NewFormation
  // Also gets available hooks
  getSizes = async () => {
    try {
      const { data: formationSizes } = await this.api.getFormationSizes();
      let { data: availableHooks } = (await this.api.getAvailableHooks());
      // Filter out "destroy" hook, which we can't use for actions
      availableHooks = availableHooks.filter(hook => hook.type !== 'destroy');

      const sizes = [];
      formationSizes.forEach((size) => {
        if (size.name.indexOf('prod') === -1) {
          sizes.push(size);
        }
      });

      const smallestSize = (sizes.sort((a, b) => a.price - b.price))[0];

      const groupedSizes = sizes.reduce((acc, size) => {
        const idx = acc.findIndex(e => e.label.toLowerCase() === size.type.toLowerCase());
        if (idx === -1) {
          acc.push({
            label: size.type.charAt(0).toUpperCase() + size.type.slice(1),
            options: [{
              value: size.name,
              label: `${size.name}: ${size.description}`,
            }],
          });
        } else {
          acc[idx].options.push({
            value: size.name,
            label: `${size.name}: ${size.description}`,
            memory: parseInt(size.resources.limits.memory, 10),
          });
        }
        return acc;
      }, []);

      groupedSizes.forEach(size => size.options.sort((a, b) => a.memory - b.memory));
      groupedSizes.sort((a, b) => {
        const la = a.label.toLowerCase();
        const lb = b.label.toLowerCase();
        if (la < lb) return -1;
        if (la > lb) return 1;
        return 0;
      });

      this.setState({
        availableHooks,
        sizes: groupedSizes,
        loading: false,
        size: {
          label: `${smallestSize.name}: ${smallestSize.description}`,
          value: smallestSize.name,
        },
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  handleCheckAll = (event, checked) => {
    let currEvents = [];
    if (checked) {
      this.state.availableHooks.forEach(e => currEvents.push(e.type));
      this.setState({ checkedAll: true });
    } else {
      currEvents = [];
      this.setState({ checkedAll: false });
    }
    this.setState({ events: currEvents });
  }

  handleCheck = (event, checked) => {
    const currEvents = this.state.events;
    if (checked) {
      currEvents.push(event.target.value);
    } else {
      currEvents.splice(currEvents.indexOf(event.target.value), 1);
    }
    this.setState({
      events: currEvents,
      checkedAll: currEvents.length === this.state.availableHooks.length,
    });
  }

  handleNext = () => {
    const { stepIndex, name, image, command, configvars } = this.state;

    if (stepIndex === 0) {
      // Maximum length of description and name
      // Name must not be null
      if (!name || name === '' || name.length < 1) {
        this.setState({ errorText: 'Required' });
        return;
      } else if (!(/^[A-Za-z0-9]+$/i.test(name))) {
        this.setState({ errorText: 'Name must be an alphanumeric string' });
        return;
      }
    } else if (stepIndex === 2 && (image && image !== '')) {
      // Make sure image has tag
      const imgArr = image.split(':');
      if (imgArr.length < 2 || imgArr[0].length < 1 || imgArr[1].length < 1) {
        this.setState({ errorText: 'Docker image must contain tag' });
        return;
      }
    } else if (stepIndex === 3) {
      if (!command || command === '' || command.length < 1) {
        this.setState({ errorText: 'Required' });
        return;
      }
    } else if (stepIndex === 4 && configvars && configvars !== '' && configvars.length > 0) {
      // Make sure the JSON is valid
      try {
        const config = JSON.parse(configvars);
        if (typeof config !== 'object' || Array.isArray(config)) {
          throw new Error();
        }
      } catch (err) {
        this.setState({ errorText: 'Must be a valid JSON string' });
        return;
      }
    } else if (stepIndex === 6) {
      // Submit
      this.submitAction();
      return;
    }

    this.setState({
      stepIndex: stepIndex + 1,
      errorText: null,
    });
  }

  handlePrev = () => {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex - 1,
      errorText: null,
    });
  }

  // Handles most changes
  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
  }

  handleSizeChange = (event) => {
    this.setState({ errorText: '', size: event });
  }

  submitAction = async () => {
    const {
      name, description, size, image, configvars, command, events,
    } = this.state;
    const handleError = (error) => {
      if (!this.isCancel(error)) {
        this.setState({
          submitMessage: error.response.data,
          submitFail: true,
          finished: false,
          stepIndex: 0,
          loading: false,
          errorText: null,
          eventsDialogOpen: false,
        });
      }
    };
    try {
      this.setState({
        loading: true,
      }, async () => {
        try {
          await this.api.createAction(
            this.props.app,
            name,
            description.trim() !== '' ? description.trim() : null,
            size.value,
            image.trim() !== '' ? image.trim() : null,
            command.trim(),
            configvars ? JSON.parse(configvars) : null,
            events.join(','),
          );

          ReactGA.event({
            category: 'ACTIONS',
            action: 'Created new action',
          });

          // Add a pleasing amount of loading instead of flashing the indicator
          // for a variable amount of time
          setTimeout(() => this.props.onComplete('New Action Created'), 1000);
        } catch (err) {
          handleError(err);
        }
      });
    } catch (error) {
      handleError(error);
    }
  }

  renderEventsInfoDialog() {
    return (
      <Dialog open={this.state.eventsDialogOpen} className="events-info-dialog">
        <DialogTitle>Description of Events</DialogTitle>
        <DialogContent>
          <div>
            {this.state.availableHooks.map(event => (
              <p key={`${event.type}_description`}><b>{event.type}</b><br />{event.description}</p>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            className="ok"
            color="primary"
            onClick={this.closeEventsInfoDialog}
          >Ok</Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderEventCheckboxes() {
    const { events, availableHooks } = this.state;
    return availableHooks.map(event => (
      <Grid key={`checkbox-${event.type}`} item xs={4}>
        <FormControlLabel
          control={
            <Checkbox
              className={`checkbox-event-${event.type}`}
              key={event.type}
              value={event.type}
              checked={events.includes(event.type)}
              onChange={this.handleCheck}
              style={style.events.checkbox}
            />
          }
          label={event.type}
        />
      </Grid>
    ));
  }

  renderStepContent(stepIndex) {
    const {
      name, description, size, errorText, image, configvars, sizes, command, checkedAll, events,
    } = this.state;

    switch (stepIndex) {
      // Name and Description
      case 0:
        return (
          <div style={style.stepContent.inputStep.root}>
            <div style={{ width: '100%', height: '125px', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
              <TextField
                className="name"
                label="Name"
                value={name}
                onChange={this.handleChange('name')}
                helperText={errorText}
                error={errorText && errorText.length > 0}
                onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
                autoFocus
                fullWidth
              />
              <TextField
                className="description"
                label="Description (optional)"
                value={description}
                onChange={this.handleChange('description')}
                onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              />
            </div>
            <Typography variant="body2" style={style.stepDescription}>
              {'Enter a name, and optionally a short description, for the new action.'}
            </Typography>
          </div>
        );
      // Size
      case 1:
        return (
          <div style={{ maxWidth: '600px' }}>
            <Search
              options={sizes}
              value={size}
              onChange={this.handleSizeChange}
              placeholder="Select a Size"
              label="Size"
              helperText={errorText}
              error={!!errorText}
              style={{ width: '600px' }}
            />
            <Typography variant="body2" style={style.stepDescription}>
              {'Choose a dyno size that the action will use when it runs. Please choose as small of a size as possible.'}
            </Typography>
          </div>
        );
      // Image
      case 2:
        return (
          <div style={style.stepContent.inputStep.root}>
            <TextField
              className="image"
              label="Image"
              value={image}
              onChange={this.handleChange('image')}
              helperText={errorText}
              error={errorText && errorText.length > 0}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              fullWidth
            />
            <Typography variant="body2" style={style.stepDescription}>
              {'The image to use when the action runs.'}
            </Typography>
            <ul>
              <Typography component="li" variant="body2">This is optional. If not provided, the app&#39;s image will be used.</Typography>
              <Typography component="li" variant="body2">Make sure this is a valid Docker image! (e.g. repository.url/organization/image:tag)</Typography>
            </ul>
          </div>
        );
      // Command
      case 3:
        return (
          <div style={style.stepContent.inputStep.root}>
            <TextField
              className="command"
              label="Command"
              value={command}
              onChange={this.handleChange('command')}
              helperText={errorText}
              error={errorText && errorText.length > 0}
              onKeyPress={(e) => { if (e.key === 'Enter') this.handleNext(); }}
              autoFocus
              fullWidth
            />
            <Typography variant="body2" style={style.stepDescription}>
              {'The command to use when the action runs.'}
            </Typography>
          </div>
        );
      // Config Vars
      case 4:
        return (
          <div style={style.stepContent.inputStep.root}>
            <TextField
              className="config-vars"
              label="Config Vars (Optional)"
              value={configvars}
              onChange={this.handleChange('configvars')}
              helperText={errorText}
              error={errorText && errorText.length > 0}
              autoFocus
              fullWidth
              multiline
              rows={5}
              rowsMax={5}
              variant="outlined"
            />
            <Typography variant="body2" style={style.stepDescription}>
              {'Config vars you wish to use to override the app\'s existing config vars'}
            </Typography>
            <ul>
              <Typography component="li" variant="body2">This should be a valid JSON object consisting of &#34;key&#34;: value&#34; pairs.</Typography>
              <Typography component="li" variant="body2">This UX is a work in progress. Stay tuned :)</Typography>
            </ul>
          </div>
        );
      // Events
      case 5:
        return (
          <div>
            <div style={style.events.header}>
              <p style={style.events.label}>Events</p>
              <Tooltip placement="right" title="Click for Descriptions">
                <IconButton
                  className="events-info-button"
                  onClick={this.openEventsInfoDialog}
                  style={style.eventsInfoButton}
                >
                  <HelpIcon style={style.eventsInfoIcon} color="secondary" />
                </IconButton>
              </Tooltip>
            </div>
            {this.renderEventsInfoDialog()}
            <div className="events" style={{ padding: '6px' }}>
              <Grid container spacing={1} style={style.events.gridContainer} className="new-webhook-events-grid">
                {this.renderEventCheckboxes()}
                <Grid item xs={12} style={style.events.checkAllContainer}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value="Check All"
                        key="Check All"
                        className="checkbox-check-all"
                        checked={checkedAll}
                        onChange={this.handleCheckAll}
                        style={style.events.checkbox}
                      />
                    }
                    label="Check All"
                  />
                </Grid>
              </Grid>
            </div>
            {errorText && (
              <div style={style.eventsError} className="events-errorText">
                {errorText}
              </div>
            )}
          </div>
        );
      // Confirm
      case 6:
        return (
          <div className="new-build-summary" style={style.stepContent.summaryStep.root}>
            <div style={style.stepContent.summaryStep.wrapper}>
              <Typography variant="h6" style={style.h6}>Summary</Typography>
              <Typography variant="subtitle1">
                {'A new action, '}
                <span style={style.bold}>{name}</span>
                {', will be created using the '}
                <span style={style.bold}>{image && image !== '' ? `image: ${image}` : 'default app image'}</span>
                {'. It will run using a '}
                <span style={style.bold}>{size.value}</span>
                {' dyno, and the run command will be '}
                <span style={style.bold}>{command}</span>
                {'.'}
                {events.length > 0 && (
                  <React.Fragment>
                    {' The action will be triggered on the following events: '}
                    <span style={style.bold}>{events.join(', ')}</span>
                  </React.Fragment>
                )}
              </Typography>
            </div>
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
            {this.renderStepContent(stepIndex)}
          </div>
        ) : (
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} status="loading" />
          </div>
        )}
        <div style={style.buttons.div}>
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
            disabled={loading}
          >{stepIndex === 6 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      stepIndex, submitFail, submitMessage,
    } = this.state;
    return (
      <div style={style.root}>
        <Stepper style={style.stepper} activeStep={stepIndex}>
          <Step>
            <StepLabel>Name</StepLabel>
          </Step>
          <Step>
            <StepLabel>Size</StepLabel>
          </Step>
          <Step>
            <StepLabel>Image</StepLabel>
          </Step>
          <Step>
            <StepLabel>Command</StepLabel>
          </Step>
          <Step>
            <StepLabel>Config Vars</StepLabel>
          </Step>
          <Step>
            <StepLabel>Events</StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirm</StepLabel>
          </Step>
        </Stepper>
        {this.renderContent()}
        <ConfirmationModal
          open={submitFail}
          onOk={() => this.setState({ submitFail: false })}
          message={submitMessage}
          title="Error"
          className="new-build-error"
        />
      </div>
    );
  }
}

NewBuild.propTypes = {
  app: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};
