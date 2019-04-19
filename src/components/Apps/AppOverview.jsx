import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, List, ListItem, ListItemText,
  GridList, GridListTile, Snackbar,
  Divider,
} from '@material-ui/core';

import api from '../../services/api';
import ConfirmationModal from '../ConfirmationModal';
import Audits from '../Audits';

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
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '10%',
      paddingBottom: '10%',
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
    padding: '12px 0px',
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
};

class AppOverview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      open: false,
      mOpen: false,
      rOpen: false,
      submitFail: false,
      submitMessage: '',
      isMaintenance: false,
      isElevated: false,
      restrictedSpace: false,
      autoBuild: null,
      newAuto: false,
      snackOpen: false,
    };
  }

  async componentDidMount() {
    const { app } = this.props;

    let autoBuild;
    try {
      autoBuild = await api.getAutoBuild(this.props.app.name);
    } catch (err) {
      autoBuild = null;
    }

    this.setState({ // eslint-disable-line react/no-did-mount-set-state
      isMaintenance: app.maintenance,
      autoBuild: autoBuild ? autoBuild.data : null,
      loading: false,
    });
    this._isMounted = true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.app !== this.props.app) {
      this.getRepo();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getRepo = async () => {
    let autoBuild;
    try {
      autoBuild = await api.getAutoBuild(this.props.app.name);
    } catch (err) {
      if (err.response.status === 404) {
        if (this._isMounted) {
          this.setState({
            rOpen: false,
            loading: false,
            autoBuild: null,
          });
        }
      } else if (this._isMounted) {
        this.setState({
          submitMessage: err.response.data,
          submitFail: true,
          rOpen: false,
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
      newAuto: false,
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

    return (
      <div>
        <Divider />
        <GridList style={style.gridList} cellHeight={'auto'}>
          <GridListTile style={{ padding: '0px' }}>
            <List>
              <ListItem style={style.listItem}>
                <ListItemText primary="Organization" secondary={this.props.app.organization.name} />
              </ListItem>
              <ListItem style={style.listItem}>
                <ListItemText primary="ID" secondary={`${this.props.app.id}`} />
              </ListItem>
            </List>
          </GridListTile>
          <GridListTile style={{ padding: '0px' }}>
            <List>
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
            </List>
          </GridListTile>
        </GridList>
        <Divider variant="middle" />
        {this.state.autoBuild ? (
          <GridList style={style.gridList} cellHeight={'auto'}>
            <GridListTile style={{ padding: '0px' }}>
              <List>
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
              <List>
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
          <GridList style={style.gridList} cellHeight={'auto'}>
            <GridListTile style={{ padding: '0px' }}>
              <List>
                <ListItemText primary="Git Repo" secondary={'Not Configured'} />
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
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}>
          <div>
            <div style={style.tableCell.main}>
              {'Last Release and Most Recent Changes'}
            </div>
            <div style={style.tableCell.sub}>
              {new Date(this.props.app.released_at).toString()}
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
