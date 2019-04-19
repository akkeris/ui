import React, { Component } from 'react';
import {
  Tab, Tabs, CircularProgress, Snackbar, Card, CardHeader,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import MapIcon from '@material-ui/icons/Map';
import PropTypes from 'prop-types';

import SiteOverView from '../../components/Sites/SiteOverview';
import RouteList from '../../components/Sites/RouteList';
import api from '../../services/api';
import util from '../../services/util';
import History from '../../config/History';
import ConfirmationModal from '../../components/ConfirmationModal';

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
  card: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    overflow: 'visible',
    marginBottom: '12px',
  },
  rightIcon: {
    float: 'right',
    cursor: 'pointer',
  },
};

const tabs = ['info', 'routes'];

export default class SiteInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      site: null,
      loading: true,
      submitMessage: '',
      submitFail: false,
      message: '',
      currentTab: 'info',
      basePath: `/sites/${this.props.match.params.site}`,
    };
  }

  componentDidMount() {
    this.getSite();
  }

  componentDidUpdate(prevProps) {
    // If we changed tabs through the back or forward button, update currentTab
    if (prevProps.match.params.tab !== this.props.match.params.tab && this.props.history.action === 'POP') {
      let currentTab = this.props.match.params.tab;
      if (!tabs.includes(currentTab)) {
        currentTab = 'info';
        history.replaceState(null, '', `${this.state.basePath}/info`);
      }
      this.setState({ currentTab }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  getSite = async () => {
    try {
      const { data: site } = await api.getSite(this.props.match.params.site);
      // If current tab not provided or invalid, rewrite it to be /info
      let currentTab = this.props.match.params.tab;
      if (!currentTab || !tabs.includes(currentTab)) {
        currentTab = 'info';
        history.replaceState(null, '', `${this.state.basePath}/info`);
      }
      this.setState({ currentTab, site, loading: false });
      util.updateHistory('sites', site.id, site.domain);
    } catch (error) {
      this.setState({
        submitFail: true,
        submitMessage: error.response.data,
      });
    }
  }

  handleError = (message) => {
    this.setState({
      submitMessage: message,
      submitFail: true,
      loading: false,
      open: false,
      message: '',
    });
  }

  handleClose = () => {
    this.setState({ submitFail: false });
  }

  handleNotFoundClose = () => {
    History.get().push('/sites');
  }

  reload = (message) => {
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
      history.pushState(null, '', `${this.state.basePath}/${newTab}`);
    }
  }

  render() {
    const { currentTab } = this.state;
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          <ConfirmationModal
            open={this.state.submitFail}
            onOk={this.handleNotFoundClose}
            message={this.state.submitMessage}
            title="Error"
            className="not-found-error"
          />
        </div>
      );
    }
    return (
      <div>
        <Card className="card" style={style.card}>
          <CardHeader
            className="header"
            title={this.state.site.domain}
            subheader={this.state.site.region.name}
          />
          <Tabs
            fullWidth
            value={this.state.currentTab}
            onChange={this.changeActiveTab}
            scrollButtons="off"
            indicatorColor="primary"
          >
            <Tab
              className="info-tab"
              icon={<InfoIcon />}
              label="Info"
              value="info"
            />
            <Tab
              className="routes-tab"
              icon={<MapIcon />}
              label="Routes"
              value="routes"
            />
          </Tabs>
          {currentTab === 'info' && <SiteOverView site={this.state.site} />}
          {currentTab === 'routes' && <RouteList site={this.state.site.domain} onError={this.handleError} />}
        </Card>
        <ConfirmationModal
          open={this.state.submitFail}
          onOk={this.handleClose}
          message={this.state.submitMessage}
          title="Error"
          className="error"
        />
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

SiteInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
