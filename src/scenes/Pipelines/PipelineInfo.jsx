import React, { Component } from 'react';
import {
  Button, IconButton, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions,
  Tab, Tabs, CircularProgress, Snackbar, Card, CardHeader,
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import PropTypes from 'prop-types';

import LaptopIcon from '@material-ui/icons/Computer';
import GlobeIcon from '@material-ui/icons/Public';
import Forward from '@material-ui/icons/ArrowForward';
import RemoveIcon from '@material-ui/icons/Clear';

import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Stage } from '../../components/Pipelines';

const muiTheme = createMuiTheme({
  palette: {
    primary: {       main: '#0097a7',     },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiTabs: {
      root: {
        backgroundColor: '#3c4146',
        color: 'white',
        maxWidth: '1024px',
      },
    },
    MuiTab: {
      root: {
        minWidth: '120px !important',
      },
    },
    MuiCardContent: {
      root: {
        display: 'flex',
        flexFlow: 'row-reverse',
        padding: '0px 16px 0px 0px !important',
      },
    },
    MuiCard: {
      root: {
        maxWidth: '1024px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '12px',
      },
    },
    MuiCardHeader: {
      title: {
        fontSize: '15px',
        fontWeight: '500',
      },
      subheader: {
        fontSize: '14px',
        fontWeight: '500',
      },
    },
  },
});

const style = {
  iconButton: {
    color: 'black',
    float: 'right',
  },
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
  card: {
    overflow: 'visible',
    marginBottom: '20px',
  },
};

const tabs = ['review', 'development', 'staging', 'production'];

export default class PipelineInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      submitMessage: '',
      submitFail: false,
      open: false,
      confirmOpen: false,
      message: '',
      pipeline: null,
      currentTab: 'review',
      baseHash: `#/pipelines/${this.props.match.params.pipeline}/`,
      basePath: `/pipelines/${this.props.match.params.pipeline}`,
    };
  }

  componentDidMount() {
    api.getPipeline(this.props.match.params.pipeline).then((response) => {
      const hashPath = window.location.hash;
      let currentTab = hashPath.replace(this.state.baseHash, '');
      if (!tabs.includes(currentTab)) {
        currentTab = 'review';
        window.location.hash = `${this.state.baseHash}review`;
      }
      this.setState({ currentTab });
      this.setState({
        pipeline: response.data,
        loading: false,
      });
    }).catch((error) => {
      this.setState({
        submitFail: true,
        submitMessage: error.response.data,
      });
    });
  }

  componentDidUpdate(prevProps) {
    // If we changed locations AND it was a 'pop' history event (back or forward button)
    const routeHasChanged = prevProps.location.pathname !== this.props.location.pathname;
    if (routeHasChanged && this.props.history.action === 'POP') {
      // If hitting back took us to the base path without a tab, hit back again
      // TODO: what if we hit forward to the base path?
      //    detect forward click and do window.history.forward()
      if (this.props.location.pathname === `${this.state.basePath}` ||
          this.props.location.pathname === `${this.state.basePath}/`) {
        window.history.back();
        return;
      }
      const hashPath = window.location.hash;
      if (hashPath.includes(this.state.baseHash)) {
        let currentTab = hashPath.replace(this.state.baseHash, '');
        if (!tabs.includes(currentTab)) {
          currentTab = 'review';
          window.location = `${this.state.baseHash}review`;
        }
        // Since we check conditions before setState we avoid infinite loops
        this.setState({ currentTab }); // eslint-disable-line react/no-did-update-set-state
      }
    }
  }

  handleRemovePipeline = () => {
    api.deletePipeline(this.props.match.params.pipeline).then(() => {
      window.location = '#/pipelines';
    }).catch((error) => {
      this.handleError(error.response.data);
    });
  }

  handleClose = () => {
    this.setState({
      submitFail: false,
    });
  }

  handleNotFoundClose = () => {
    window.location = '/#/pipelines';
  }

  handleConfirmation = () => {
    this.setState({ confirmOpen: true });
  }

  handleCancelConfirmation = () => {
    this.setState({ confirmOpen: false });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  handleError = (message) => {
    this.setState({
      submitMessage: message,
      submitFail: true,
      loading: false,
      open: false,
      message: '',
      confirmOpen: false,
    });
  }

  handleAlert = (message) => {
    this.setState({
      open: true,
      message,
    });
  }

  changeActiveTab = (event, newTab) => {
    if (this.state.currentTab !== newTab) {
      this.setState({
        currentTab: newTab,
      });
      this.props.history.push(`${newTab}`);
    }
  }

  renderTabContent = () => {
    const { currentTab } = this.state;
    return (
      <React.Fragment>
        {currentTab === 'review' && (
          <Stage
            stage="review"
            pipeline={this.state.pipeline}
            onError={this.handleError}
            onAlert={this.handleAlert}
            active={this.state.currentTab === 'review'}
          />
        )}
        {currentTab === 'development' && (
          <Stage
            stage="development"
            pipeline={this.state.pipeline}
            onError={this.handleError}
            onAlert={this.handleAlert}
            active={this.state.currentTab === 'development'}
          />
        )}
        {currentTab === 'staging' && (
          <Stage
            stage="staging"
            pipeline={this.state.pipeline}
            onError={this.handleError}
            onAlert={this.handleAlert}
            active={this.state.currentTab === 'staging'}
          />
        )}
        {currentTab === 'production' && (
          <Stage
            stage="production"
            pipeline={this.state.pipeline}
            onError={this.handleError}
            onAlert={this.handleAlert}
            active={this.state.currentTab === 'production'}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
            <Dialog
              className="not-found-error"
              open={this.state.submitFail}
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>
                <DialogContentText>{this.state.submitMessage}</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handleNotFoundClose}
                  color="primary"
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <Card className="card" style={style.card}>
            <CardHeader
              className="header"
              title={this.state.pipeline.name}
              subheader={this.state.pipeline.id}
              action={
                <IconButton className="delete-pipeline" style={style.iconButton} onClick={this.handleConfirmation}>
                  <RemoveIcon />
                </IconButton>
              }
            />
            <Tabs
              fullWidth
              value={this.state.currentTab}
              onChange={this.changeActiveTab}
              scrollButtons="off"
            >
              <Tab
                disableRipple
                className="review-tab"
                icon={<LaptopIcon />}
                label="Review"
                value="review"
              />
              <Tab
                disableRipple
                className="dev-tab"
                icon={<Forward />}
                label="Development"
                value="development"
              />
              <Tab
                disableRipple
                className="staging-tab"
                icon={<Forward />}
                label="Staging"
                value="staging"
              />
              <Tab
                disableRipple
                className="prod-tab"
                icon={<GlobeIcon />}
                label="Production"
                value="production"
              />
            </Tabs>
            {this.renderTabContent()}
          </Card>
          <ConfirmationModal
            open={this.state.confirmOpen}
            onOk={this.handleRemovePipeline}
            onCancel={this.handleCancelConfirmation}
            message="Are you sure you want to delete this pipeline?"
          />
          <Dialog
            className="error"
            open={this.state.submitFail}
          >
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
              <DialogContentText>{this.state.submitMessage}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                onClick={this.handleClose}
                className="ok"
              >
              Ok
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            className="pipeline-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onClose={this.handleRequestClose}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

PipelineInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
