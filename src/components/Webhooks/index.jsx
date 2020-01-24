import React from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgress, IconButton, Snackbar, Typography, Collapse,
  Tooltip,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';

import NewWebhook from './NewWebhook';
import Webhook from './Webhook';
import ConfirmationModal from '../ConfirmationModal';
import BaseComponent from '../../BaseComponent';

const style = {
  refresh: {
    div: {
      height: '450px',
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
  table: {
    overflow: 'auto',
  },
  collapse: {
    container: {
      display: 'flex', flexDirection: 'column',
    },
    header: {
      container: {
        display: 'flex', alignItems: 'center', padding: '6px 24px 0px',
      },
      title: {
        flex: 1,
      },
    },
  },
  header: {
    container: {
      display: 'flex', alignItems: 'center',
    },
  },
  noResults: {
    padding: '18px 24px',
  },
};

export default class Webhooks extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      webhooks: [],
      loading: true,
      open: false,
      confirmWebhookOpen: false,
      message: '',
      new: false,
      submitFail: false,
      submitMessage: '',
      events: [],
      collapse: true,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getWebhooks();
  }

  getWebhooks = async () => {
    try {
      const { data: availableHooks } = await this.api.getAvailableHooks();
      const { data: webhooks } = await this.api.getAppWebhooks(this.props.app);
      this.setState({ webhooks, availableHooks, loading: false });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
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

  handleNewWebhook = () => {
    this.setState({ new: true, collapse: false });
  }

  handleNewWebhookCancel = () => {
    this.setState({ collapse: true });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  handleDialogClose= () => {
    this.setState({ submitFail: false });
  }

  reload = async (message, noLoading) => {
    try {
      if (!noLoading) {
        this.setState({ loading: true });
      }
      const { data: webhooks } = await this.api.getAppWebhooks(this.props.app);
      this.setState({
        webhooks,
        loading: false,
        new: false,
        message,
        open: true,
        confirmWebhookOpen: false,
        collapse: true,
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  renderWebhooks() {
    return this.state.webhooks
      .sort((a, b) => b.active - a.active)
      .map((webhook, rowindex) => (
        <div style={{ borderBottom: '1px solid rgba(224,224,224,1)' }} key={webhook.id}>
          <Webhook
            webhook={webhook}
            rowindex={rowindex}
            app={this.props.app}
            onComplete={this.reload}
            onError={this.handleError}
            key={webhook.id}
            availableHooks={this.state.availableHooks}
          />
        </div>
      ));
  }

  render() {
    return (
      <div>
        <Collapse
          unmountOnExit
          mountOnEnter
          onExited={() => this.setState({ new: false })}
          in={!this.state.collapse}
        >
          <div style={style.collapse.container}>
            <div style={style.collapse.header.container}>
              <Typography style={style.collapse.header.title} variant="overline">{this.state.new && 'New Webhook'}</Typography>
              {this.state.new && <IconButton className="webhook-cancel" onClick={this.handleNewWebhookCancel}><RemoveIcon /></IconButton>}
            </div>
            {this.state.new && (
              <NewWebhook
                app={this.props.app}
                onComplete={this.reload}
                availableHooks={this.state.availableHooks}
              />
            )}
          </div>
        </Collapse>
        <div style={{ height: '52px', display: 'flex', padding: '4px 24px', borderBottom: '1px solid rgba(224, 224, 224, 1)', alignItems: 'center', color: 'rgba(0, 0, 0, 0.87)' }}>
          <div style={{ display: 'flex', flexGrow: '1' }}>
            <div style={{ flex: 17 }}>
              <Typography variant="overline">Webhook</Typography>
            </div>
            <div style={{ flex: 19 }}>
              <Typography variant="overline">Events</Typography>
            </div>
          </div>
          <div style={{ width: '50px' }}>
            {this.state.collapse && (
              <Tooltip placement="bottom-end" title="New Webhook">
                <IconButton className="new-webhook" onClick={this.handleNewWebhook}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
        {this.state.loading ? (
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        ) : (
          <div>
            {(this.state.webhooks && this.state.webhooks.length) > 0 ? (
              <div className="webhook-list">{this.renderWebhooks()}</div>
            ) : (
              <Typography variant="body2" className="no-results" style={style.noResults}>No Webhooks</Typography>
            )}
          </div>
        )}
        <ConfirmationModal
          open={this.state.submitFail}
          onOk={this.handleDialogClose}
          message={this.state.submitMessage}
          title="Error"
          className="webhook-error"
        />
        <Snackbar
          className="webhook-snack"
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={3000}
          onClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

Webhooks.propTypes = {
  app: PropTypes.string.isRequired,
};
