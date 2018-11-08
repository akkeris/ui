import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import { Card, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import LaptopIcon from 'material-ui/svg-icons/hardware/computer';
import GlobeIcon from 'material-ui/svg-icons/social/public';
import Forward from 'material-ui/svg-icons/navigation/arrow-forward';
import RemoveIcon from 'material-ui/svg-icons/content/clear';
import IconButton from 'material-ui/IconButton';

import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Stage } from '../../components/Pipelines';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  tabs: {
    backgroundColor: '#3c4146',
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
    },
  },
  card: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
  iconButton: {
    float: 'right',
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
      // TODO: what if we hit forward to the base path? detect forward click and do window.history.forward()
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

  changeActiveTab = (newTab) => {
    this.setState({
      currentTab: newTab.props.value,
    });
    this.props.history.push(`${newTab.props.value}`);
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
            <Dialog
              className="not-found-error"
              open={this.state.submitFail}
              modal
              actions={
                <FlatButton
                  className="ok"
                  label="Ok"
                  primary
                  onClick={this.handleNotFoundClose}
                />}
            >
              {this.state.submitMessage}
            </Dialog>
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Card className="card" style={style.card}>
            <CardHeader
              className="header"
              title={this.state.pipeline.name}
              subtitle={this.state.pipeline.id}
            >
              <IconButton className="delete-pipeline" style={style.iconButton} onClick={this.handleConfirmation}><RemoveIcon /></IconButton>
              <ConfirmationModal open={this.state.confirmOpen} onOk={this.handleRemovePipeline} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this pipeline?" />
            </CardHeader>
            <Tabs value={this.state.currentTab}>
              <Tab
                className="review-tab"
                icon={<LaptopIcon />}
                label="Review"
                onActive={this.changeActiveTab}
                value="review"
              >
                <Stage stage="review" pipeline={this.state.pipeline} onError={this.handleError} onAlert={this.handleAlert} active={this.state.currentTab === 'review'} />
              </Tab>
              <Tab
                className="dev-tab"
                icon={<Forward />}
                label="Development"
                onActive={this.changeActiveTab}
                value="development"
              >
                <Stage stage="development" pipeline={this.state.pipeline} onError={this.handleError} onAlert={this.handleAlert} active={this.state.currentTab === 'development'} />
              </Tab>
              <Tab
                className="staging-tab"
                icon={<Forward />}
                label="Staging"
                onActive={this.changeActiveTab}
                value="staging"
              >
                <Stage stage="staging" pipeline={this.state.pipeline} onError={this.handleError} onAlert={this.handleAlert} active={this.state.currentTab === 'staging'} />
              </Tab>
              <Tab
                className="prod-tab"
                icon={<GlobeIcon />}
                label="Production"
                onActive={this.changeActiveTab}
                value="production"
              >
                <Stage stage="production" pipeline={this.state.pipeline} onError={this.handleError} onAlert={this.handleAlert} active={this.state.currentTab === 'production'} />
              </Tab>
            </Tabs>
          </Card>
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
          <Snackbar
            className="pipeline-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onRequestClose={this.handleRequestClose}
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
