import React, { Component } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  Paper, CircularProgress, LinearProgress, TextField, Select, MenuItem, Button, Divider,
  List, ListItem, ListItemIcon, ListItemText, FormControl, InputLabel,
} from '@material-ui/core';
import DoneBox from '@material-ui/icons/Done';
import OpenInNewBox from '@material-ui/icons/OpenInNew';
import ConfigVar from '../../components/ConfigVar';
import api from '../../services/api';

/* eslint-disable react/jsx-no-bind */

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
});

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '15%',
      marginBottom: '5%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
      color: 'white',
    },
  },
  linearProgressContainer: {
    width: '100%',
    height: '20px',
  },
  fullWidth: {
    width: '100%',
    paddingBottom: '20px',
  },
  textfield: {
    width: '100%',
    paddingBottom: '20px',
  },
  toolbar: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  link: {
    textDecoration: 'none',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '2em',
    marginBottom: '2em',
  },
  icon: {
    top: '0px',
  },
  label: {
    color: 'rgba(0,0,0,0.8)',
  },
  menu: {
  },
  logo: {
    maxWidth: '40px',
    maxHeight: '40px',
    paddingTop: '10px',
    float: 'right',
  },
  header: {
    marginTop: '20px',
    marginBottom: '25px',
    fontSize: '1.75em',
    color: 'rgba(0,0,0,0.8)',
  },
  subheader: {
    marginTop: '10px',
    fontSize: '1.25em',
    color: 'rgba(0,0,0,0.7)',
  },
  subheadertext: {
    marginTop: '0.25em',
    color: 'rgba(0,0,0,0.6)',
  },
  logs: {
    overflow: 'scroll',
    backgroundColor: 'rgba(0,0,0,0.025)',
    color: '#666',
    padding: '15px',
    marginTop: '0px',
    borderRadius: '3px',
    height: '150px',
    fontSize: '12px',
    borderTop: '1px solid #ddd',
    borderLeft: '1px solid #eee',
    borderRight: '1px solid #eee',
    borderBottom: '1px solid #eee',
  },
  divider: {
    marginTop: 0, marginLeft: 0, marginBottom: 0, marginRight: 0,
  },
};

// https://stackoverflow.com/a/8486188
// Parses query parameters from a URL (including hashes)
function getJsonFromUrl(hashBased) {
  let query;
  if (hashBased) {
    const pos = location.href.indexOf('?');
    if (pos === -1) return [];
    query = location.href.substr(pos + 1);
  } else {
    query = location.search.substr(1);
  }
  const result = {};
  query.split('&').forEach((part) => {
    if (!part) return;
    // replace every + with space, regexp-free version
    part = part.split('+').join(' '); // eslint-disable-line
    const eq = part.indexOf('=');
    let key = eq > -1 ? part.substr(0, eq) : part;
    const val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : '';
    const from = key.indexOf('[');
    if (from === -1) result[decodeURIComponent(key)] = val;
    else {
      const to = key.indexOf(']', from);
      const index = decodeURIComponent(key.substring(from + 1, to));
      key = decodeURIComponent(key.substring(0, from));
      if (!result[key]) result[key] = [];
      if (!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}

export default class AppSetups extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      appInfo: null,
      loading: true,
      progress: 0,
      blueprint: null,
      panel: 'form',
      orgs: null,
      spaces: null,
      app_name_error: null,
      create_disabled: true,
      logs: '',
      error: null,
    };
  }

  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    let blueprint = '';
    try {
      if (!params.get('blueprint')) {
        // Parse the blueprint JSON from the hash portion of the current location
        const newParams = getJsonFromUrl(window.location.hash);
        blueprint = JSON.parse(newParams.blueprint);
      } else {
        blueprint = JSON.parse(params.get('blueprint'));
      }
      blueprint.app.name = '';
    } catch (error) {
      this.setState({ // eslint-disable-line react/no-did-mount-set-state
        panel: 'error',
        error: 'Blueprint Parsing Error - Check your JSON syntax!',
        loading: false,
      });
      return;
    }
    this.setState({ blueprint }); // eslint-disable-line react/no-did-mount-set-state

    api.getOrgs().then((orgResp) => {
      api.getSpaces().then((spaceResp) => {
        this.setState({
          spaces: spaceResp.data,
          orgs: orgResp.data,
          loading: false,
        });
      });
    });
  }

  onConfigVarChange = (originKey, event, key, value) => {
    const bp = this.state.blueprint;
    bp.env[originKey].value = value;
    this.setState({ blueprint: bp });
  }

  getSpaces() {
    return this.state.spaces.map(space => (
      <MenuItem
        className={`${space.name}-space`}
        key={space.id}
        value={space.name}
      >
        {space.name}
      </MenuItem>
    ));
  }

  getOrgs() {
    return this.state.orgs.map(org => (
      <MenuItem
        className={`${org.name}-org`}
        key={org.id}
        value={org.name}
      >
        {org.name}
      </MenuItem>
    ));
  }

  handleOrgChange = (event) => {
    const { blueprint } = this.state;
    blueprint.app.organization = event.target.value;
    this.setState({ blueprint });
  }

  handleSpaceChange = (event) => {
    const { blueprint } = this.state;
    blueprint.app.space = event.target.value;
    this.setState({ blueprint });
  }

  handleNameChange = (event) => {
    const { value } = event.target;
    if (value === '') {
      this.setState({ app_name_error: 'This field is required.', create_disabled: true });
    } else {
      const { blueprint } = this.state;
      blueprint.app.name = value;
      this.setState({ app_name_error: null, blueprint, create_disabled: false });
    }
  }

  handleDoneSuccessUrl = () => {
    let destUrl = this.state.appInfo.data.web_url;
    if (destUrl[destUrl.length - 1] === '/') {
      destUrl = destUrl.substring(0, destUrl.length - 1);
    }
    window.location = `${destUrl}${this.state.blueprint.success_url}`;
  }

  handleDone = () => {
    window.location = `/#/apps/${this.state.blueprint.app.name}-${this.state.blueprint.app.space}/info`;
  }

  scrollBuildDown = () => {
    const objDiv = document.querySelector('pre');
    if (objDiv) {
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }

  handleOnClick = () => {
    let previousMessage = '';
    api.appSetup(this.state.blueprint).then((response) => {
      this.setState({ status: response.data, panel: 'running', progress: 0 });
      const intv = setInterval(() => {
        api.getAppSetup(this.state.status.id).then((statusResp) => {
          if (statusResp.data.progress === 1) {
            if (statusResp.data.build && (statusResp.data.build.status === 'pending' || statusResp.data.build.status === 'queued')) {
              this.setState({ progress: statusResp.data.progress * 100, logs: statusResp.data.build.lines.join('\n') });
              this.scrollBuildDown();
            } else {
              clearInterval(intv);
              api.getApp(`${this.state.blueprint.app.name}-${this.state.blueprint.app.space}`).then((appInfo) => {
                this.setState({ panel: 'ready', progress: statusResp.data.progress * 100, appInfo });
                setTimeout(() => {
                  this.setState({ panel: 'done', progress: statusResp.data.progress * 100, appInfo });
                }, 5000);
                this.scrollBuildDown();
              }).catch((e) => {
                this.setState({ panel: 'error', error: (e.response ? (`${e.response.status} ${e.response.data}`) : e.message) });
                this.scrollBuildDown();
              });
            }
          } else {
            let { logs } = this.state;
            if (statusResp.data.status_message !== previousMessage) {
              logs += `${statusResp.data.status_message}\n`;
              previousMessage = statusResp.data.status_message;
            }
            this.setState({ progress: statusResp.data.progress * 100, logs });
            this.scrollBuildDown();
          }
        }).catch((e) => {
          clearInterval(intv);
          this.setState({ panel: 'error', error: (e.response ? (`${e.response.status} ${e.response.data}`) : e.message) });
        });
      }, 500);
    }).catch((e) => {
      this.setState({ panel: 'error', error: (e.response ? (`${e.response.status} ${e.response.data}`) : e.message) });
    });
  }

  renderErrorMessage = msg => (
    <MuiThemeProvider theme={muiTheme}>
      <div>
        <Paper style={style.paper}>
          <div className="internal">
            <div className="status" style={style.header}>Uh oh...</div>
            <span>{msg}</span>
          </div>
        </Paper>
      </div>
    </MuiThemeProvider>
  )

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div className="apps" style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>
      );
    } else if (this.state.panel === 'form' && this.state.loading === false) {
      const configVars = [];
      try {
        Object.keys(this.state.blueprint.env).forEach((key) => {
          if (configVars.length === 0) {
            configVars.push((
              <div key="configuration_subheader" style={style.subheader}>Config Vars</div>
            ));
            configVars.push((
              <div key="configuration_subheadertext" style={style.subheadertext}>These configuration values need to be provided for this application to work.</div>
            ));
          }
          configVars.push((
            <ConfigVar
              key={`config_var${key}`}
              name={key}
              value={this.state.blueprint.env[key].value ? this.state.blueprint.env[key].value : ''}
              editable
              editing
              editbutton={false}
              keyedit
              description={this.state.blueprint.env[key].description}
              onChange={this.onConfigVarChange.bind(this, key)}
            />
          ));
        });
        const headers = [];

        if (this.state.blueprint.logo) {
          headers.push((
            <img key="name_logo" className="name_logo" src={this.state.blueprint.logo} style={style.logo} alt="" />
          ));
        }
        if (this.state.blueprint.name) {
          headers.push((
            <div key="name_subheader" className="name_subheader" style={style.header}>{this.state.blueprint.name}</div>
          ));
        }
        if (this.state.blueprint.description) {
          headers.push((
            <div key="name_subheadertext" className="name_subheadertext" style={{ ...style.subheadertext, marginBottom: '10px' }}>
              {this.state.blueprint.description}
            </div>
          ));
        }

        return (
          <MuiThemeProvider theme={muiTheme}>
            <div>
              <Paper style={style.paper}>
                <div className="internal">
                  {headers}
                  <TextField
                    className="application_name"
                    label="Application Name"
                    style={style.textfield}
                    error={!!this.state.app_name_error}
                    helperText={this.state.app_name_error ? this.state.app_name_error : undefined}
                    onChange={this.handleNameChange}
                  />
                  <FormControl style={style.fullWidth}>
                    <InputLabel htmlFor="space-field">Space</InputLabel>
                    <Select
                      className="space-field"
                      value={this.state.blueprint.app.space}
                      onChange={this.handleSpaceChange}
                      inputProps={{
                        name: 'space',
                        id: 'space-field',
                      }}
                    >
                      {this.getSpaces()}
                    </Select>
                  </FormControl>
                  <br />
                  <FormControl style={style.fullWidth}>
                    <InputLabel htmlFor="org-field">Organization</InputLabel>
                    <Select
                      className="org-field"
                      value={this.state.blueprint.app.organization}
                      onChange={this.handleOrgChange}
                      inputProps={{
                        name: 'org',
                        id: 'org-field',
                      }}
                    >
                      {this.getOrgs()}
                    </Select>
                  </FormControl>
                  <br />
                  {configVars}
                  <Button
                    variant="contained"
                    className="create"
                    disabled={this.state.create_disabled}
                    color="primary"
                    fullWidth
                    onClick={this.handleOnClick}
                  >Create</Button>
                </div>
              </Paper>
            </div>
          </MuiThemeProvider>
        );
      } catch (error) {
        return (this.renderErrorMessage('Blueprint Parsing Error - Check your JSON syntax!'));
      }
    } else if ((this.state.panel === 'running' || this.state.panel === 'ready' || this.state.panel === 'done') && this.state.loading === false) {
      const buttons = [];
      if (this.state.blueprint.success_url) {
        buttons.push(
          <Button
            variant="contained"
            key="view_app"
            color="primary"
            onClick={this.handleDoneSuccessUrl}
          >
            <OpenInNewBox style={{ paddingRight: '10px' }} />View
          </Button>,
        );
      }
      buttons.push(
        <Button
          variant="contained"
          className="config_app"
          key="config_app"
          color="secondary"
          style={{ marginLeft: '1em' }}
          onClick={this.handleDone}
        >
          Manage App
        </Button>,
      );

      const isConfiguring = this.state.progress !== 100;
      const isBuilding = this.state.progress === 100;

      return (
        <MuiThemeProvider theme={muiTheme}>
          <div>
            <Paper style={style.paper}>
              <List style={{ padding: '5em' }}>
                <ListItem className="config-environment" >
                  <ListItemText primary="Configuring environment" />
                  {(!isConfiguring) ? <ListItemIcon><DoneBox /></ListItemIcon> : null}
                </ListItem>
                {
                  isConfiguring ?
                    (
                      <ListItem>
                        <div style={style.linearProgressContainer}>
                          <LinearProgress variant="determinate" value={this.state.progress} />
                        </div>
                      </ListItem>
                    ) : null
                }
                <Divider inset style={style.divider} />
                <ListItem >
                  <ListItemText primary="Building app" />
                  {(isBuilding && (this.state.panel === 'ready' || this.state.panel === 'done')) ? (
                    <ListItemIcon><DoneBox /></ListItemIcon>
                  ) : null}
                </ListItem>
                {
                  isBuilding ?
                    (
                      <ListItem >
                        <pre style={style.logs}><code>{this.state.logs}</code></pre>
                      </ListItem>
                    ) : null
                }
                <Divider inset style={style.divider} />
                <ListItem>
                  <ListItemText primary="Provisioning" />
                  {(this.state.panel === 'ready' || this.state.panel === 'done') ? <ListItemIcon><DoneBox /></ListItemIcon> : null}
                </ListItem>
                <Divider inset style={style.divider} />
                <ListItem>
                  <ListItemText primary="Deploying" />
                  {(this.state.panel === 'ready' || this.state.panel === 'done') ? <ListItemIcon><DoneBox /></ListItemIcon> : null}
                </ListItem>
                <Divider inset style={style.divider} />
                {
                  (this.state.panel === 'ready' || this.state.panel === 'done') ?
                    ([<Divider key="done1" inset style={style.divider} />,
                      <ListItem key="done2">
                        <ListItemText
                          style={{
                            textAlign: 'center', paddingTop: '2em', fontWeight: '500', color: '#666',
                          }}
                          primary="Your app was successfully deployed."
                        />
                      </ListItem>,
                      <ListItem key="done3" style={{ alignItems: 'inherit', justifyContent: 'center' }}>
                        {buttons}
                      </ListItem>]
                    ) : null }
              </List>
            </Paper>
          </div>
        </MuiThemeProvider>
      );
    } else if (this.state.panel === 'error' && this.state.loading === false) {
      this.renderErrorMessage(this.state.error);
    }
    return null;
  }
}
