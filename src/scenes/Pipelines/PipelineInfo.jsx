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
      marginTop: '20%',
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
      reviewActive: true,
      devActive: false,
      stagingActive: false,
      prodActive: false,
    };
  }

  componentDidMount() {
    api.getPipeline(this.props.match.params.pipeline).then((response) => {
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

  reviewTabActive = () => {
    this.setState({
      reviewActive: true,
      devActive: false,
      stagingActive: false,
      prodActive: false,
    });
  }
  devTabActive = () => {
    this.setState({
      reviewActive: false,
      devActive: true,
      stagingActive: false,
      prodActive: false,
    });
  }
  stagingTabActive = () => {
    this.setState({
      reviewActive: false,
      devActive: false,
      stagingActive: true,
      prodActive: false,
    });
  }
  prodTabActive = () => {
    this.setState({
      reviewActive: false,
      devActive: false,
      stagingActive: false,
      prodActive: true,
    });
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
                  onTouchTap={this.handleNotFoundClose}
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
              <IconButton className="delete-pipeline" style={style.iconButton} onTouchTap={this.handleConfirmation}><RemoveIcon /></IconButton>
              <ConfirmationModal open={this.state.confirmOpen} onOk={this.handleRemovePipeline} onCancel={this.handleCancelConfirmation} message="Are you sure you want to delete this pipeline?" />
            </CardHeader>
            <Tabs >
              <Tab
                className="review-tab"
                icon={<LaptopIcon />}
                label="Review"
                onActive={this.reviewTabActive}
              >
                <Stage stage="review" pipeline={this.state.pipeline} onError={this.handleError} onAlert={this.handleAlert} active={this.state.reviewActive} />
              </Tab>
              <Tab
                className="dev-tab"
                icon={<Forward />}
                label="Development"
                onActive={this.devTabActive}
              >
                <Stage stage="development" pipeline={this.state.pipeline} onError={this.handleError} onAlert={this.handleAlert} active={this.state.devActive} />
              </Tab>
              <Tab
                className="staging-tab"
                icon={<Forward />}
                label="Staging"
                onActive={this.stagingTabActive}
              >
                <Stage stage="staging" pipeline={this.state.pipeline} onError={this.handleError} onAlert={this.handleAlert} active={this.state.stagingActive} />
              </Tab>
              <Tab
                className="prod-tab"
                icon={<GlobeIcon />}
                label="Production"
                onActive={this.prodTabActive}
              >
                <Stage stage="production" pipeline={this.state.pipeline} onError={this.handleError} onAlert={this.handleAlert} active={this.state.prodActive} />
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
                onTouchTap={this.handleClose}
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
};
