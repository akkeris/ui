import React from 'react';
import deepmerge from 'deepmerge';
import {
  CircularProgress, Divider, Typography, IconButton, Tooltip,
  List, ListItem, ListItemText, ListItemIcon, DialogTitle,
  LinearProgress, Dialog, DialogActions, DialogContent, Button,
  Table, TableRow, TableCell, TableBody, Tabs, Tab, Collapse, TextField, Grid, TableHead,
  FormControl, InputLabel, Select, MenuItem,
} from '@material-ui/core';
import {
  Add as AddIcon, CheckCircle as SuccessIcon, Lens as UnknownIcon,
  Clear as RemoveIcon, Edit as EditIcon,
  Event as EventIcon, EventAvailable as TimeFinishedSuccess,
  EventBusy as TimeFinishedFailure, DateRange as TimeStarted,
  Refresh as ReloadIcon, PlayArrow as TriggerIcon, Delete as DeleteIcon,
  Stop as StopIcon,
} from '@material-ui/icons';
import { grey, yellow } from '@material-ui/core/colors';
import FailureIcon from '@material-ui/icons/Cancel';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { LazyLog } from 'react-lazylog';
import Ansi from 'ansi-to-react';
import BaseComponent from '../../BaseComponent';
import { getDateDiff } from '../../services/util';
import ConfirmationModal from '../ConfirmationModal';
import NewAction from './NewAction';
import Search from '../Search';

function highlight(data) {
  return <Ansi className="ansi">{data.replace(/^([A-z0-9\:\-\+\.]+Z) ([A-z\-0-9]+) ([A-z\.0-9\/\[\]\-]+)\: /gm, '\u001b[36m$1\u001b[0m $2 \u001b[38;5;104m$3:\u001b[0m ')}</Ansi>; // eslint-disable-line
}

const style = {
  noActions: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%',
  },
  header: {
    container: {
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0px',
    },
    title: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
    details: {
      paddingLeft: '24px',
    },
    right: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: '2 0 0',
    },
    left: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: '1 0 0',
    },
    actions: {
      container: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px',
      },
      button: {
        width: '50px',
      },
    },
  },
  refresh: {
    div: {
      height: '450px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
    column: {
      flex: '1 0 0',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  content: {
    rootContainer: {
      height: '550px',
      position: 'relative',
    },
    subContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    // noActions: {
    //   position: 'absolute',
    //   zIndex: 100,
    //   left: '50%',
    //   top: '50%',
    //   transform: 'translate(-50%,-50%)',
    // },
    // blur: {
    //   filter: 'blur(1.5px)',
    //   pointerEvents: 'none',
    //   userSelect: 'none',
    // },
  },
  columns: {
    leftColumn: {
      flex: '1 0 0',
      borderRight: '3px double rgba(0, 0, 0, 0.12)',
      height: 'inherit',
      display: 'flex',
    },
    rightColumn: {
      flex: '2 0 0',
      height: 'inherit',
      overflow: 'hidden',
    },
  },
  collapse: {
    container: {
      display: 'flex', flexDirection: 'column',
    },
    header: {
      container: {
        display: 'flex', alignItems: 'center', padding: '6px 26px 0px',
      },
      title: {
        flex: 1,
      },
    },
  },
  actions: {
    listContainer: { padding: 0, flexGrow: 1 },
    listItem: { paddingLeft: '24px' },
    listItemActions: { width: '24px', minWidth: 'unset', display: 'block', paddingRight: '21px' },
    listItemTextContainer: { display: 'flex', alignItems: 'center' },
    listItemTextEventIcon: { width: '0.7em', height: '0.7em', paddingRight: '0.3em' },
    runs: {
      listItem: { padding: '8px 24px' },
      statusIcon: { minWidth: '24px' },
      listItemTextContainer: {
        display: 'flex', flexDirection: 'row', justifyContent: 'left', alignItems: 'center', maxWidth: '75%',
      },
      statusContainer: { display: 'flex', alignItems: 'center', flex: '1 0 0' },
      timeIcon: { width: '0.7em', height: '0.7em', paddingRight: '0.3em' },
    },
  },
  actionDetails: {
    list: { overflowY: 'auto', padding: '0' },
    noRuns: { paddingLeft: '8px' },
    container: { display: 'flex', flexDirection: 'column', height: 'inherit' },
    header: {
      container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 24px',
      },
      actions: {
        container: {
          paddingRight: 'unset',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        triggerContainer: { width: '50px' },
      },
      icon: { width: '50px' },
    },
  },
  runDetails: {
    tabs: { backgroundColor: 'unset', color: '#424242', flexGrow: '1' },
  },
  dialogHeight: { minHeight: '430px' },
  dialogWidth: { minWidth: '300px' },
};


function getIconFromStatus(status) {
  let Icon = UnknownIcon;
  let iconColor = grey[500];
  if (!status || typeof status !== 'string') {
    return { Icon, iconColor };
  }
  switch (status.toLowerCase()) {
    case 'success':
      Icon = SuccessIcon;
      iconColor = 'rgb(40, 167, 69)';
      break;
    case 'failure':
      Icon = FailureIcon;
      iconColor = 'rgb(203, 36, 49)';
      break;
    case 'starting':
    case 'started':
    case 'running':
      Icon = LinearProgress;
      iconColor = yellow[800];
      break;
    default:
      break;
  }
  return { Icon, iconColor };
}


export default class Actions extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      collapse: true,
      loading: true,
      loadingConfig: false,
      submitFail: false,
      submitMessage: '',
      actions: [],
      selectedAction: 0,
      runDetailsOpen: false,
      actionConfigOpen: false,
      selectedRun: null,
      runDetailsTab: 0,
      new: false,
      startRunConfirmationOpen: false,
      editActionName: '',
      editActionDescription: '',
      editActionSize: null,
      editActionImage: '',
      editActionCommand: '',
      editActionEnv: '',
      editActionEvents: [],
      confirmActionSave: false,
      sizes: [],
      ungroupedSizes: [],
      editActionEnvError: false,
      editActionEnvErrorText: '',
      availableHooks: [],
      availableHooksSimple: [],
      confirmActionDelete: false,
      confirmActionDeleteMessage: '',
      loadingLogs: true,
      logs: '',
      tailingLogs: true,
    };
  }

  theme = parentTheme => deepmerge(parentTheme, {
    overrides: {
      MuiLinearProgress: {
        barColorPrimary: {
          backgroundColor: yellow[800],
        },
        colorPrimary: {
          backgroundColor: 'rgb(255, 245, 228)',
        },
      },
    },
  });

  componentDidMount() {
    super.componentDidMount();
    this.getActions();
  }

  reload = async () => {
    this.setState({
      loading: true,
      collapse: true,
      startRunConfirmationOpen: false,
      confirmActionDelete: false,
      loadingLogs: true,
      logs: '',
    });
    this.setState({ actions: [] });
    await this.getActions();
  }

  tailLogInterval = null

  fetchLogs = async () => {
    const { runDetailsTab, selectedAction, actions, selectedRun } = this.state;
    if (runDetailsTab !== 1) {
      clearInterval(this.interval);
      return;
    }
    const action = actions[selectedAction];
    const { data: run } = await this.api.getActionRun(
      this.props.app.name, action.action, selectedRun.action_run,
    );
    this.setState({
      logs: (run.logs && run.logs !== '') ? run.logs : '',
      loadingLogs: false,
    });
  }

  tailLogs = async (start) => {
    if (!start) {
      this.tailLogInterval = clearInterval(this.tailLogInterval);
      this.setState({ tailingLogs: false });
      return;
    } else if (this.tailLogInterval) {
      return;
    }
    this.setState({ tailingLogs: true });

    this.fetchLogs();
    this.tailLogInterval = setInterval(this.fetchLogs, 5000);
  }

  handleStartRun = async () => {
    const { app } = this.props;
    const { actions, selectedAction } = this.state;
    const action = actions[selectedAction];
    try {
      await this.api.triggerActionRun(app.name, action.name);
      await this.reload();
    } catch (err) {
      this.setState({
        startRunConfirmationOpen: false,
        submitMessage: err.response.data,
        submitFail: true,
      });
    }
  }

  handleNewAction() {
    this.setState({ collapse: false, new: true });
  }

  handleNewActionCancel() {
    this.setState({ collapse: true });
  }

  handleActionConfigSave = async () => {
    const {
      selectedAction,
      actions,
      editActionName,
      editActionDescription,
      editActionSize,
      editActionImage,
      editActionCommand,
      editActionEvents,
    } = this.state;
    let { editActionEnv } = this.state;
    const action = actions[selectedAction];
    // Make sure that editActionEnv is a valid JSON string
    try {
      if (!editActionEnv || editActionEnv === '') {
        // ignore validation
      } else if (typeof editActionEnv === 'string') {
        editActionEnv = JSON.parse(editActionEnv);
        // Make sure it's formatted the same as the original object
        editActionEnv = JSON.stringify(editActionEnv);
      } else {
        editActionEnv = JSON.stringify(editActionEnv);
      }
    } catch (err) {
      this.setState({ editActionEnvError: true, editActionEnvErrorText: 'Env must be a valid JSON object' });
      return;
    }
    // If nothing changed, close. Otherwise, switch to confirmation message
    if (
      (editActionName !== '' && action.name !== editActionName) ||
      (action.description !== editActionDescription) ||
      (editActionSize !== '' && action.formation.size !== editActionSize.value) ||
      (action.formation.options.image !== editActionImage) ||
      (action.formation.command !== editActionCommand) ||
      (JSON.stringify(action.formation.options.env) !== editActionEnv) ||
      (editActionEvents && action.events !== editActionEvents.join(','))
    ) {
      this.setState({ confirmActionSave: true, editActionEnvError: false, editActionEnvErrorText: '' });
    } else {
      this.setState({ actionConfigOpen: false, editActionEnvError: false, editActionEnvErrorText: '' });
    }
  }

  handleActionConfigSaveConfirm = async () => {
    const {
      selectedAction,
      actions,
      editActionName,
      editActionDescription,
      editActionSize,
      editActionImage,
      editActionCommand,
      editActionEnv,
      editActionEvents,
    } = this.state;
    let env;
    if (editActionEnv) {
      try {
        env = JSON.parse(editActionEnv);
      } catch (err) {
        env = actions[selectedAction].formation.options.env;
      }
    } else {
      env = {};
    }
    const editedAction = {
      name: editActionName,
      description: editActionDescription,
      size: editActionSize.value,
      events: editActionEvents.join(','),
      command: editActionCommand,
      options: {
        image: editActionImage,
        env,
      },
    };
    // Display loading
    this.setState({ confirmActionLoading: true }, async () => {
      try {
        await this.api.patchAction(
          this.props.app.name,
          actions[selectedAction].action,
          editedAction,
        );
        this.setState({
          actionConfigOpen: false,
          confirmActionSave: false,
          confirmActionLoading: false,
        });
        this.reload('Action successfully updated');
      } catch (err) {
        const msg = err.response ? `${err.message}: ${err.response.data}` : err.message;
        this.setState({
          actionConfigOpen: false,
          confirmActionSave: false,
          confirmActionLoading: false,
          submitFail: true,
          submitMessage: msg,
        });
      }
    });
  }

  handleDeleteAction = async () => {
    const { actions, selectedAction } = this.state;
    try {
      this.setState({ confirmActionDelete: false, loading: true });
      await this.api.deleteAction(this.props.app.name, actions[selectedAction].action);
      this.reload('Action successfully deleted');
    } catch (err) {
      const msg = err.response ? `${err.message}: ${err.response.data}` : err.message;
      this.setState({ submitFail: true, submitMessage: msg });
      this.reload();
    }
  }

  getActions = async () => {
    try {
      const { data: actions } = await this.api.getActions(this.props.app.name);
      await Promise.all(actions.map(async (action, idx) => {
        const { data: runs } = await this.api.getActionRuns(this.props.app.name, action.action);
        actions[idx].runs = runs;
      }));
      this.setState({
        actions,
        loading: false,
        selectedAction: this.state.selectedAction < actions.length ? this.state.selectedAction : 0,
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  // Copy of the getSizes function in NewFormation
  // Also gets available hooks
  getSizes = async () => {
    try {
      const { data: formationSizes } = await this.api.getFormationSizes();
      let { data: availableHooks } = (await this.api.getAvailableHooks());
      // Filter out "destroy" hook, which we can't use for actions
      availableHooks = availableHooks.filter(hook => hook.type !== 'destroy');
      const availableHooksSimple = availableHooks.map(h => h.type);

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
        availableHooksSimple,
        ungroupedSizes: sizes,
        sizes: groupedSizes,
        editActionSize: {
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

  renderActions() {
    const { actions, selectedAction } = this.state;
    if (!actions || actions.length <= 0) {
      return (
        <div style={style.noActions}>
          <Typography variant="subtitle1">
            No actions
          </Typography>
        </div>
      );
    }
    return (
      <List style={style.actions.listContainer}>
        {actions.map((action, index) => {
          const selected = (index === selectedAction);
          const latestRun = (
            action.runs &&
            Array.isArray(action.runs) &&
            action.runs.length > 0
          ) ? action.runs[0] : null;
          const {
            Icon: StatusIcon, iconColor,
          } = getIconFromStatus(latestRun ? latestRun.status : null);
          return (
            <React.Fragment key={action.name}>
              <ListItem
                button
                style={{
                  backgroundColor: selected ? '#e8e8e8' : undefined,
                  ...style.actions.listItem,
                }}
                onClick={() => { this.setState({ selectedAction: index }); }}
              >
                <ListItemIcon style={style.actions.listItemActions}>
                  <StatusIcon style={{ fillColor: iconColor, color: iconColor }} />
                </ListItemIcon>
                <ListItemText
                  primary={action.name}
                  secondary={
                    <span style={style.actions.listItemTextContainer}>
                      <EventIcon style={style.actions.listItemTextEventIcon} />
                      <Typography component="span" variant="body2" color="textSecondary">
                        {latestRun ? getDateDiff(latestRun.finished || latestRun.started_at || latestRun.created) : 'Never'}
                      </Typography>
                    </span>
                  }
                />
              </ListItem>
              <Divider key={`${action.name}-divider`} />
            </React.Fragment>
          );
        })}
      </List>
    );
  }

  renderActionRuns = action =>
    action.runs.map((run) => {
      const { Icon: StatusIcon, iconColor } = getIconFromStatus(run.status);
      let FinishedIcon;
      if (run.finished_at && run.status === 'success') FinishedIcon = TimeFinishedSuccess;
      else if (run.finished_at && run.status === 'failure') FinishedIcon = TimeFinishedFailure;
      else FinishedIcon = EventIcon;

      return (
        <React.Fragment key={run.run_number}>
          <ListItem
            button
            onClick={() => { this.setState({ selectedRun: run, runDetailsOpen: true }); }}
            style={style.actions.runs.listItem}
          >
            <ListItemIcon>
              <StatusIcon style={{
                ...style.actions.runs.statusIcon, fillColor: iconColor, color: iconColor,
              }}
              />
            </ListItemIcon>
            <ListItemText
              primary={`#${run.run_number} - created by ${run.created_by} via ${run.source}`}
              secondary={
                <span style={style.actions.runs.listItemTextContainer}>
                  <span style={style.actions.runs.statusContainer}>
                    <TimeStarted style={style.actions.runs.timeIcon} />
                    <Tooltip title={(new Date(run.started_at || run.created)).toLocaleString()}>
                      <Typography component="span" variant="body2" color="textSecondary">
                        {getDateDiff(run.started_at || run.created)}
                      </Typography>
                    </Tooltip>
                  </span>
                  {run.finished_at ? (
                    <span style={style.actions.runs.statusContainer}>
                      <FinishedIcon style={style.actions.runs.timeIcon} />
                      <Tooltip title={(new Date(run.finished_at)).toLocaleString()}>
                        <Typography component="span" variant="body2" color="textSecondary">
                          {getDateDiff(run.finished_at)}
                        </Typography>
                      </Tooltip>
                    </span>
                  ) : (
                    <span style={style.actions.runs.statusContainer}>
                      <FinishedIcon style={style.actions.runs.timeIcon} />
                      <Typography component="span" variant="body2" color="textSecondary">
                        {run.status}
                      </Typography>
                    </span>
                  )}
                </span>
              }
            />
          </ListItem>
          <Divider key={`${run.run_number}-divider`} />
        </React.Fragment>
      );
    });

  renderActionDetails() {
    const { actions, selectedAction } = this.state;
    if (!actions || actions.length <= 0) {
      return null;
    }
    const action = actions[selectedAction];
    return (
      <div style={style.actionDetails.container}>
        <div style={style.actionDetails.header.container}>
          <div>
            <Typography variant="h6">{action.name}</Typography>
            <Typography variant="body2" color="textSecondary">{action.action}</Typography>
          </div>
          <div style={style.actionDetails.header.actions.container}>
            <div style={style.actionDetails.header.actions.triggerContainer}>
              <Tooltip title="Trigger Run">
                <IconButton
                  style={style.actionDetails.header.icon}
                  onClick={() => { this.setState({ startRunConfirmationOpen: true }); }}
                >
                  <TriggerIcon />
                </IconButton>
              </Tooltip>
            </div>
            <div style={style.header.actions.button}>
              <Tooltip title="Configuration">
                <IconButton
                  style={style.actionDetails.header.icon}
                  onClick={() => {
                    this.setState({ loadingConfig: true, actionConfigOpen: true }, async () => {
                      if (!this.state.sizes || this.state.sizes.length === 0) {
                        await this.getSizes();
                      }
                      const size = this.state.ungroupedSizes.find(
                        x => x.name === action.formation.size,
                      );
                      this.setState({
                        editActionSize: {
                          label: `${size.name}: ${size.description}`,
                          value: size.name,
                        },
                        editActionName: action.name,
                        editActionDescription: action.description,
                        editActionImage: action.formation.options.image,
                        editActionCommand: action.formation.command,
                        editActionEnv: JSON.stringify(action.formation.options.env),
                        editActionEvents: action.events.split(','),
                        loadingConfig: false,
                      });
                    });
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
        <Divider />
        <List style={style.actionDetails.list}>
          {action.runs.length > 0 ? (this.renderActionRuns(action)) : (
            <ListItem>
              <ListItemText
                style={style.actionDetails.noRuns}
                primary="No runs"
              />
            </ListItem>
          )}
        </List>
      </div>
    );
  }

  renderRunDetails() {
    /*
      action_run  uuid
      status      'success', 'failure', 'starting', 'running'
      exit_code   0, 1, etc
      source      manual_trigger, ...events
      started_at  timestamptz
      finished_at timestamptz
      created_by  username, unknown, system
      run_number  1, 2, etc
    */
    const { selectedRun: run, runDetailsTab, loadingLogs, logs, tailingLogs } = this.state;
    return (
      <div>
        <div style={{ display: 'flex' }}>
          <Tabs
            value={runDetailsTab}
            onChange={(e, v) => {
              if (v === 1) { this.tailLogs(true); }
              this.setState({ runDetailsTab: v });
            }}
            style={style.runDetails.tabs}
          >
            <Tab label="Info" />
            <Tab label="Logs" />
          </Tabs>
          {runDetailsTab === 1 && (
            <div style={{ width: '50px' }}>
              {!tailingLogs ? (
                <Tooltip title="Start Tailing">
                  <IconButton style={{ width: '50px' }} onClick={() => { this.tailLogs(true); }}>
                    <TriggerIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Stop Tailing">
                  <IconButton style={{ width: '50px' }} onClick={() => { this.tailLogs(false); }}>
                    <StopIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          )}
        </div>
        <div style={style.dialogHeight}>
          {runDetailsTab === 0 && (
            <div>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><Typography variant="overline">ID</Typography></TableCell>
                    <TableCell>{run.action_run}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Typography variant="overline">Status</Typography></TableCell>
                    <TableCell>{run.status}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Typography variant="overline">Exit Code</Typography></TableCell>
                    <TableCell>{run.exit_code === 0 ? 0 : (run.exit_code || '--')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Typography variant="overline">Source</Typography></TableCell>
                    <TableCell>{run.source}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Typography variant="overline">Started At</Typography></TableCell>
                    <TableCell>{run.started_at || '--'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Typography variant="overline">Finished At</Typography></TableCell>
                    <TableCell>{run.finished_at || '--'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Typography variant="overline">Created By</Typography></TableCell>
                    <TableCell>{run.created_by}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          {runDetailsTab === 1 && (
            <div style={{ ...style.dialogHeight, ...style.dialogWidth }}>
              {loadingLogs ? (
                <div style={style.refresh.div}>
                  <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
                </div>
              ) : (
                <LazyLog
                  text={logs || 'No logs received for this run'}
                  formatPart={data => highlight(data)}
                  extraLines={1}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  renderActionConfirm() {
    const {
      actions,
      selectedAction,
      editActionName,
      editActionDescription,
      editActionSize,
      editActionImage,
      editActionCommand,
      editActionEvents,
      confirmActionLoading,
    } = this.state;
    const action = actions[selectedAction];
    // Make sure formatting matches
    let { editActionEnv } = this.state;
    if (editActionEnv && editActionEnv !== '') {
      editActionEnv = JSON.parse(editActionEnv);
      editActionEnv = JSON.stringify(editActionEnv);
    }

    if (confirmActionLoading) {
      return (
        <div style={style.dialogHeight}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </div>
      );
    }
    return (
      <div style={style.dialogHeight}>
        <Table>
          <colgroup>
            <col style={{ width: '80px' }} />
            <col />
            <col />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell>Option</TableCell>
              <TableCell>Old Value</TableCell>
              <TableCell>New Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {editActionName && action.name !== editActionName && (
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>
                  {action.name}
                </TableCell>
                <TableCell>
                  {editActionName}
                </TableCell>
              </TableRow>
            )}
            {editActionDescription && action.description !== editActionDescription && (
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>
                  {action.description}
                </TableCell>
                <TableCell>
                  {editActionDescription}
                </TableCell>
              </TableRow>
            )}
            {editActionSize && action.formation.size !== editActionSize.value && (
              <TableRow>
                <TableCell>Size</TableCell>
                <TableCell>
                  {action.formation.size}
                </TableCell>
                <TableCell>
                  {editActionSize.value}
                </TableCell>
              </TableRow>
            )}
            {editActionImage && action.formation.options.image !== editActionImage && (
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>
                  {action.formation.options.image}
                </TableCell>
                <TableCell>
                  {editActionImage}
                </TableCell>
              </TableRow>
            )}
            {editActionCommand && action.formation.command !== editActionCommand && (
              <TableRow>
                <TableCell>Command</TableCell>
                <TableCell>
                  {action.formation.command}
                </TableCell>
                <TableCell>
                  {editActionCommand}
                </TableCell>
              </TableRow>
            )}
            {JSON.stringify(action.formation.options.env) !== editActionEnv && (
              <TableRow>
                <TableCell>Env Vars</TableCell>
                <TableCell>
                  {JSON.stringify(action.formation.options.env)}
                </TableCell>
                <TableCell>
                  {editActionEnv}
                </TableCell>
              </TableRow>
            )}
            {editActionEvents && action.events !== editActionEvents.join(',') && (
              <TableRow>
                <TableCell>Events</TableCell>
                <TableCell>
                  {action.events}
                </TableCell>
                <TableCell>
                  {editActionEvents.join(',')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  renderActionConfig() {
    const { sizes, editActionSize, availableHooksSimple } = this.state;
    return (
      <div style={style.dialogHeight}>
        <Grid container direction="column" spacing={2}>
          <Grid item xs={12}>
            <TextField
              className="action-config-edit-name"
              value={this.state.editActionName}
              fullWidth
              label="Name"
              onChange={e => this.setState({ editActionName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              className="action-config-edit-description"
              value={this.state.editActionDescription}
              fullWidth
              label="Description"
              onChange={e => this.setState({ editActionDescription: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Search
              options={sizes}
              value={editActionSize}
              onChange={(event) => { this.setState({ editActionSize: event }); }}
              placeholder="Select a Size"
              label="Size"
              style={{ width: '600px' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              className="action-config-edit-image"
              value={this.state.editActionImage}
              fullWidth
              label="Image"
              onChange={e => this.setState({ editActionImage: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              className="action-config-edit-command"
              value={this.state.editActionCommand}
              fullWidth
              label="Command"
              onChange={e => this.setState({ editActionCommand: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              className="action-config-edit-env"
              value={this.state.editActionEnv}
              fullWidth
              label="Environment Variables"
              error={this.state.editActionEnvError}
              helperText={this.state.editActionEnvErrorText}
              onChange={e => this.setState({ editActionEnv: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl style={{ display: 'block' }}>
              <InputLabel htmlFor={'action-config-edit-events-select'}>Events</InputLabel>
              <Select
                className={'action-config-edit-events-dropdown'}
                value={this.state.editActionEvents.filter(e => e)}
                onChange={(e) => {
                  this.setState({ editActionEvents: e.target.value.filter(el => el) });
                }}
                multiple
                fullWidth
                inputProps={{
                  name: 'action-config-edit-events',
                  id: 'action-config-edit-events-select',
                }}
              >
                {availableHooksSimple.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </div>
    );
  }

  renderRunDetailsDialog() {
    const { actions, selectedAction, selectedRun, runDetailsOpen } = this.state;
    return (
      <Dialog
        className="run-details-dialog"
        open={runDetailsOpen}
        onExited={() => { this.setState({ selectedRun: null }); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {actions[selectedAction].name} #{selectedRun && selectedRun.run_number} Details
        </DialogTitle>
        <DialogContent>
          <div>
            {this.renderRunDetails()}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            className="ok"
            color="primary"
            onClick={() => {
              this.tailLogs(false);
              this.setState({ runDetailsOpen: false, runDetailsTab: 0, loadingLogs: true, logs: '' });
            }}
          >Ok</Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderActionConfigDialog() {
    const {
      actions, selectedAction, actionConfigOpen, loadingConfig,
      confirmActionSave, confirmActionDelete,
    } = this.state;
    return (
      <Dialog
        className="action-config-dialog"
        open={actionConfigOpen}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{actions[selectedAction].name} Configuration{confirmActionSave && ' Confirmation'}</DialogTitle>
        <DialogContent style={{ overflowY: 'visible' }}>
          <div>
            {loadingConfig && (
              <div style={style.refresh.div}>
                <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
              </div>
            )}
            {confirmActionSave && this.renderActionConfirm()}
            {
              !loadingConfig &&
            !confirmActionSave &&
            !confirmActionDelete &&
            this.renderActionConfig()
            }
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: 'auto', marginLeft: '1em' }}
            className="delete"
            color="secondary"
            variant="outlined"
            onClick={() => {
              this.setState({
                actionConfigOpen: false,
                confirmActionDelete: true,
                confirmActionDeleteMessage: `Are you sure you want to delete the action ${actions[selectedAction].name}?`,
              });
            }}
          ><DeleteIcon style={{ marginRight: '0.25em' }} />Delete</Button>
          <Button
            className="close"
            color="secondary"
            onClick={() => {
              this.setState({
                actionConfigOpen: false,
                confirmActionSave: false,
                editActionEnvError: false,
                editActionEnvErrorText: '',
              });
            }}
          >Close</Button>
          { confirmActionSave && (
            <Button
              className="back"
              onClick={() => { this.setState({ confirmActionSave: false }); }}
            >Back</Button>
          )}
          { confirmActionSave ? (
            <Button
              className="save"
              color="primary"
              onClick={() => { this.handleActionConfigSaveConfirm(); }}
            >Confirm</Button>
          ) : (
            <Button
              className="confirm"
              color="primary"
              onClick={() => { this.handleActionConfigSave(); }}
            >Save</Button>
          )}

        </DialogActions>
      </Dialog>
    );
  }

  render() {
    const {
      collapse, loading, runDetailsOpen, actionConfigOpen, submitFail, submitMessage,
      startRunConfirmationOpen, confirmActionDeleteMessage, confirmActionDelete,
    } = this.state;
    return (
      <MuiThemeProvider theme={this.theme}>
        <div>
          <Collapse
            unmountOnExit
            mountOnEnter
            onExited={() => this.setState({ new: false })}
            in={!collapse}
          >
            <div style={style.collapse.container}>
              <div style={style.collapse.header.container}>
                <Typography style={style.collapse.header.title} variant="overline">{this.state.new && 'New Build'}</Typography>
                <div >
                  {this.state.new && (
                    <IconButton style={style.iconButton} className="build-cancel" onClick={() => { this.handleNewActionCancel(); }}><RemoveIcon /></IconButton>
                  )}
                </div>
              </div>
              <div>
                {this.state.new && (
                  <NewAction
                    app={this.props.app.name}
                    onComplete={message => this.reload(message)}
                  />
                )}
              </div>
            </div>
          </Collapse>
          <div style={style.header.container}>
            <div style={style.header.left}>
              <Typography component="div" style={style.header.title} variant="overline">Actions</Typography>
            </div>
            <div style={style.header.right}>
              <Typography component="div" style={style.header.details} variant="overline">Details</Typography>
              {collapse && (
                <div style={style.header.actions.container}>
                  <div style={{ width: '50px' }}>
                    <Tooltip title="Refresh" placement="bottom-end">
                      <IconButton style={style.iconButton} className="reload-actions" onClick={() => this.reload()}><ReloadIcon /></IconButton>
                    </Tooltip>
                  </div>
                  <div style={style.header.actions.button}>
                    <Tooltip title="New Action" placement="bottom-end">
                      <IconButton style={style.iconButton} className="new-action" onClick={() => { this.handleNewAction(); }}><AddIcon /></IconButton>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Divider />
          {loading ? (
            <div style={style.refresh.div}>
              <div style={{ ...style.columns.leftColumn, ...style.refresh.column }}>
                <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
              </div>
              <div style={style.columns.rightColumn} />
            </div>
          ) : (
            <div style={style.content.rootContainer}>
              <div style={style.content.subContainer}>
                <div style={style.columns.leftColumn}>
                  {this.renderActions()}
                </div>
                <div style={style.columns.rightColumn}>
                  {this.renderActionDetails()}
                </div>
              </div>
            </div>
          )}
        </div>
        {runDetailsOpen && this.renderRunDetailsDialog()}
        {actionConfigOpen && this.renderActionConfigDialog()}
        <ConfirmationModal
          className="trigger-run"
          open={startRunConfirmationOpen}
          onOk={this.handleStartRun}
          onCancel={() => this.setState({ startRunConfirmationOpen: false })}
          title="Confirm Trigger"
          message="Are you sure you want to start a new run?"
        />
        <ConfirmationModal
          open={submitFail}
          onOk={() => this.setState({ submitFail: false })}
          message={submitMessage}
          title="Error"
          className="submit-action-error"
        />
        <ConfirmationModal
          open={confirmActionDelete}
          onOk={this.handleDeleteAction}
          onCancel={() => this.setState({ confirmActionDelete: false })}
          message={confirmActionDeleteMessage}
          title="Confirm Deletion"
          className="delete-action-confirm"
        />
      </MuiThemeProvider>
    );
  }
}
