import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import LinearProgress from 'material-ui/LinearProgress';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import DoneBox from 'material-ui/svg-icons/action/done';
import OpenInNewBox from 'material-ui/svg-icons/action/open-in-new';
import ConfigVar from '../../components/ConfigVar';
import api from '../../services/api';

/* eslint-disable react/jsx-no-bind */

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  fullWidth: {
    width: '100%',
  },
  textfield: {
    width: '100%',
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
    marginTop: '32px',
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
      blueprint = JSON.parse(params.get('blueprint'));
      blueprint.app.name = '';
    } catch (error) {
      this.state = { panel: 'error', error: 'Blueprint Parsing Error - Check your JSON syntax!' };
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
      <MenuItem className={`${space.name}-space`} key={space.id} value={space.name} label={space.name} primaryText={space.name} />
    ));
  }

  getOrgs() {
    return this.state.orgs.map(org => (
      <MenuItem key={org.id} value={org.name} label={org.name} primaryText={org.name} />
    ));
  }

  handleOrgChange = (event, index, value) => {
    const { blueprint } = this.state;
    blueprint.app.organization = value;
    this.setState({ blueprint });
  }

  handleSpaceChange = (event, index, value) => {
    const { blueprint } = this.state;
    blueprint.app.space = value;
    this.setState({ blueprint });
  }

  handleNameChange = (event, value) => {
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
    window.location = `/#/apps/${this.state.blueprint.app.name}-${this.state.blueprint.app.space}`;
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

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div className="apps" style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    } else if (this.state.panel === 'form' && this.state.loading === false) {
      const configVars = [];
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
        // }
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
          <div key="name_subheadertext" className="name_subheadertext" style={style.subheadertext}>{this.state.blueprint.description}</div>
        ));
      }

      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            <Paper style={style.paper}>
              <div className="internal">
                {headers}
                <TextField
                  className="application_name"
                  floatingLabelText="Application Name"
                  style={style.textfield}
                  errorText={this.state.app_name_error}
                  onChange={this.handleNameChange}
                />
                <br />
                <SelectField className="space_field" floatingLabelText="Space" style={style.fullWidth} value={this.state.blueprint.app.space} onChange={this.handleSpaceChange}>
                  {this.getSpaces()}
                </SelectField>
                <br />
                <SelectField floatingLabelText="Organization" style={style.fullWidth} value={this.state.blueprint.app.organization} onChange={this.handleOrgChange}>
                  {this.getOrgs()}
                </SelectField>
                <br />
                {configVars}
                <RaisedButton className="create" disabled={this.state.create_disabled} label="Create" primary fullWidth onClick={this.handleOnClick} />
              </div>
            </Paper>
          </div>
        </MuiThemeProvider>
      );
    } else if ((this.state.panel === 'running' || this.state.panel === 'ready' || this.state.panel === 'done') && this.state.loading === false) {
      const buttons = [];
      if (this.state.blueprint.success_url) {
        buttons.push(<RaisedButton key="view_app" label="View" icon={<OpenInNewBox />} primary onClick={this.handleDoneSuccessUrl} />);
      }
      buttons.push(<RaisedButton className="config_app" key="config_app" secondary label="Manage App" style={{ marginLeft: '0.5em' }} onClick={this.handleDone} />);

      const isConfiguring = this.state.progress !== 100;
      const isBuilding = this.state.progress === 100;

      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            <h3>Testing</h3>
            <Paper style={style.paper}>
              <List style={{ padding: '5em' }}>
                <ListItem
                  className="config-environment"
                  disabled
                  primaryText="Configuring environment"
                  rightIcon={(!isConfiguring) ? <DoneBox /> : null}
                />
                {
                  isConfiguring ?
                    (
                      <ListItem
                        disabled
                        innerDivStyle={{ paddingTop: '0px' }}
                      >
                        <LinearProgress mode="determinate" value={this.state.progress} />
                      </ListItem>
                    ) : null
                }
                <Divider inset style={style.divider} />
                <ListItem
                  disabled
                  primaryText="Building app"
                  rightIcon={(isBuilding && (this.state.panel === 'ready' || this.state.panel === 'done')) ? <DoneBox /> : null}
                />
                {
                  isBuilding ?
                    (
                      <ListItem
                        disabled
                        innerDivStyle={{ paddingTop: '0px' }}
                      >
                        <pre style={style.logs}><code>{this.state.logs}</code></pre>
                      </ListItem>
                    ) : null
                }
                <Divider inset style={style.divider} />
                <ListItem
                  disabled
                  primaryText="Provisioning"
                  rightIcon={(this.state.panel === 'ready' || this.state.panel === 'done') ? <DoneBox /> : null}
                />
                <Divider inset style={style.divider} />
                <ListItem
                  disabled
                  primaryText="Deploying"
                  rightIcon={(this.state.panel === 'ready' || this.state.panel === 'done') ? <DoneBox /> : null}
                />
                {
                  (this.state.panel === 'ready' || this.state.panel === 'done') ?
                    ([<Divider key="done1" inset style={style.divider} />,
                      <ListItem
                        key="done2"
                        disabled
                        primaryText="Your app was successfully deployed."
                        innerDivStyle={{
                          textAlign: 'center', paddingTop: '2em', fontWeight: '500', color: '#666',
                        }}
                      />,
                      <ListItem
                        key="done3"
                        disabled
                        innerDivStyle={{ textAlign: 'center' }}
                      >
                        {buttons}
                      </ListItem>]
                    ) : null }
              </List>
            </Paper>
          </div>
        </MuiThemeProvider>
      );
    } else if (this.state.panel === 'error' && this.state.loading === false) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            <Paper style={style.paper}>
              <div className="internal">
                <div className="status" style={style.header}>Uh oh...</div>
                <span>{this.state.error}</span>
              </div>
            </Paper>
          </div>
        </MuiThemeProvider>
      );
    }
    return null;
  }
}
