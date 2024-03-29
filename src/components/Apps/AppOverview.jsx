import React from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, List, ListItem, ListItemText,
  GridList, GridListTile, Snackbar,
  Divider,
} from '@material-ui/core';

import ConfirmationModal from '../ConfirmationModal';
import Audits from '../Audits';
import BaseComponent from '../../BaseComponent';

const style = {
  link: {
    color: 'rgba(0, 0, 0, 0.54)',
    textDecoration: 'none',
  },
  currentImage: {
    visible: {
      padding: '12px 24px 20px',
    },
    hidden: {
      padding: '12px 24px 20px 24px',
    },
  },
  refresh: {
    div: {
      height: '511px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  button: {
    marginRight: '16px',
  },
  gridList: {
    overflowY: 'auto',
    margin: '0px 24px',
  },
  gridListTile: {
    padding: '0px',
  },
  listItem: {
    padding: '8px 0px',
  },
  tableCell: {
    main: {
      fontSize: '16px',
    },
    header: {
      paddingLeft: '24px',
      marginLeft: '0px',
      paddingRight: '16px',
      borderBottom: 'none',
    },
    sub: {
      fontSize: '14px',
      color: 'rgb(0,0,0,0.54)',
    },
    end: {
      float: 'right',
    },
  },
  deleteButtonLabel: {
    paddingRight: '5px',
  },
  removeIcon: {
    paddingRight: '5px',
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
  header: {
    container: {
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 24px',
    },
    title: {
      flex: 1,
    },
    actions: {
      container: {
        width: '112px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      },
      button: {
        width: '50px',
      },
    },
  },
  appDescription: {
    container: {
      minHeight: '36px', margin: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    missing: {
      fontStyle: 'italic',
    },
  },
};

class AppOverview extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      submitFail: false,
      submitMessage: '',
      autoBuild: null,
      snackOpen: false,
    };
  }

  async componentDidMount() {
    super.componentDidMount();
    let autoBuild;
    try {
      autoBuild = await this.api.getAutoBuild(this.props.app.name);
    } catch (err) {
      if (!this.isCancel(err)) {
        autoBuild = null;
      } else {
        return;
      }
    }

    this.setState({ // eslint-disable-line react/no-did-mount-set-state
      autoBuild: autoBuild ? autoBuild.data : null,
      loading: false,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.app !== this.props.app) {
      this.getRepo();
    }
  }

  getRepo = async () => {
    let autoBuild;
    try {
      autoBuild = await this.api.getAutoBuild(this.props.app.name);
    } catch (err) {
      if (this.isCancel(err)) {
        return;
      }
      if (err.response.status === 404) {
        this.setState({
          loading: false,
          autoBuild: null,
        });
      } else {
        this.setState({
          submitMessage: err.response.data,
          submitFail: true,
          loading: false,
          autoBuild: null,
        });
      }
    }

    this.setState({
      autoBuild: autoBuild ? autoBuild.data : null,
      loading: false,
    });
  }

  handleSnackClose() {
    this.setState({ snackOpen: false });
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  };

  reload = (message) => {
    this.setState({
      loading: false,
      snackOpen: true,
      message,
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    let compliance = this.props.app.space.compliance;
    if (compliance && compliance !== '') {
      compliance = compliance.replace(/compliance=/g, '').split(',').join(', ');
    } else {
      compliance = 'none';
    }
    return (
      <div>
        <div className="app-description" style={style.appDescription.container}>
          {this.props.app.description === '' ? (
            <ListItemText style={style.appDescription.missing} secondary="No description provided" />
          ) : (
            <ListItemText secondary={this.props.app.description} />
          )}
        </div>
        <Divider variant="middle" />
        <GridList style={style.gridList} cellHeight="auto">
          <GridListTile style={{ padding: '0px' }}>
            <List disablePadding>
              <ListItem style={style.listItem}>
                <ListItemText primary="Organization" secondary={this.props.app.organization.name} />
              </ListItem>
              <ListItem style={style.listItem}>
                <ListItemText primary="ID" secondary={`${this.props.app.id}`} />
              </ListItem>
              <ListItem style={style.listItem}>
                <ListItemText primary="Region" secondary={`${this.props.app.region.name}`} />
              </ListItem>
            </List>
          </GridListTile>
          <GridListTile style={{ padding: '0px' }}>
            <List disablePadding>
              <ListItem style={style.listItem}>
                <ListItemText
                  primary="URL"
                  secondary={
                    <a style={style.link} href={this.props.app.web_url}>
                      {this.props.app.web_url}
                    </a>
                  }
                />
              </ListItem>
              <ListItem style={style.listItem}>
                <ListItemText primary="Discovery" secondary={`${this.props.app.simple_name.toUpperCase()}_SERVICE_HOST, ${this.props.app.simple_name.toUpperCase()}_SERVICE_PORT`} />
              </ListItem>
              <ListItem style={style.listItem}>
                <ListItemText primary="Space Compliance" secondary={`${compliance}`} />
              </ListItem>
            </List>
          </GridListTile>
        </GridList>
        <Divider variant="middle" />
        {this.state.autoBuild ? (
          <GridList style={style.gridList} cellHeight="auto">
            <GridListTile style={{ padding: '0px' }}>
              <List disablePadding>
                <ListItem style={style.listItem}>
                  <ListItemText
                    primary="Git Repo"
                    secondary={
                      <a style={style.link} href={this.state.autoBuild.repo}>
                        {this.state.autoBuild.repo}
                      </a>
                    }
                  />
                </ListItem>
                <ListItem style={style.listItem}>
                  <ListItemText
                    primary="Auto Deploy"
                    secondary={this.state.autoBuild.auto_deploy.toString()}
                  />
                </ListItem>
              </List>
            </GridListTile>
            <GridListTile style={{ padding: '0px' }}>
              <List disablePadding>
                <ListItem style={style.listItem}>
                  <ListItemText
                    primary="User"
                    secondary={this.state.autoBuild.username}
                  />
                </ListItem>
                <ListItem style={style.listItem}>
                  <ListItemText
                    primary="Branch"
                    secondary={this.state.autoBuild.branch}
                  />
                </ListItem>
              </List>
            </GridListTile>
          </GridList>
        ) : (
          <GridList style={style.gridList} cellHeight="auto">
            <GridListTile style={{ padding: '0px' }}>
              <List disablePadding>
                <ListItemText primary="Git Repo" secondary="Not Configured" />
              </List>
            </GridListTile>
          </GridList>
        )}
        <Divider variant="middle" />
        <ListItemText
          style={this.props.app.repo ? style.currentImage.visible : style.currentImage.hidden}
          primary="Current Image"
          secondary={this.props.app.image ? this.props.app.image : 'No Releases'}
        />
        <div style={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px',
        }}
        >
          <div>
            <div style={style.tableCell.main}>
              {'Last Release and Most Recent Changes'}
            </div>
            <div style={style.tableCell.sub}>
              {this.props.app.released_at ? new Date(this.props.app.released_at).toString() : 'No Releases'}
            </div>
          </div>
        </div>
        <Audits app={this.props.app} />
        <ConfirmationModal
          className="error"
          open={this.state.loading || this.state.submitFail}
          onOk={this.handleClose}
          message={this.state.submitMessage}
          title="Error"
        />
        <Snackbar
          className="auto-snack"
          open={this.state.snackOpen}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={() => { this.handleSnackClose(); }}
        />
      </div>
    );
  }
}

AppOverview.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default AppOverview;
