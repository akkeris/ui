import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Button from '@material-ui/core/Button';
import { grey, yellow } from '@material-ui/core/colors';
import SuccessIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Cancel';
import PendingIcon from '@material-ui/icons/Lens';
import HelpIcon from '@material-ui/icons/Help';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core/styles';
import api from '../../services/api';

const textColor = 'rgb(36, 41, 46)';
const softTextColor = 'rgb(88, 96, 105)';
const linkColor = 'rgb(3, 102, 214)';
const style = {
  status: {
    maxHeight: '0.8rem',
    maxWidth: '0.8rem',
    border: '0px',
    borderRadius: '12px',
    margin: '0px',
  },
  statusButton: {
    padding: '0px 0px',
    minWidth: 'inherit',
  },
  loadingCircle: {
    padding: '15px',
    'width:': '20px',
    height: '20px',
  },
  statusHeader: {
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '22px',
    padding: '15px',
    margin: '0',
  },
  stateItemFirst: {
    borderTopColor: 'rgb(225, 228, 232)',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
  },
  stateItem: {
    borderTopColor: 'rgb(225, 228, 232)',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    backgroundColor: 'rgb(250, 251, 252)',
    padding: '12px 12px 12px 15px',
    display: 'flex',
    justifyItems: 'start',
  },
  stateItemIcon: {
    margin: '1px 12px 0 0',
    flexGrow: '0',
  },
  stateImage: {
    maxHeight: '0.9rem',
    maxWidth: '0.9rem',
    margin: '0 9px 0 0',
    verticalAlign: 'middle',
    flexGrow: '0',
  },
  stateContextLabel: {
    color: textColor,
    whiteSpace: 'nowrap',
    fontWeight: '600',
    flexGrow: '0',
  },
  stateDescription: {
    color: softTextColor,
    margin: '0px 9px 0 4.5px',
    overflowY: 'hidden',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    flexGrow: '1',
  },
  stateLink: {
    color: linkColor,
    margin: '0px 9px 0px 0px',
    flexGrow: '0',
  },
  subHeader: {
    color: softTextColor,
    fontSize: '13px',
    display: 'block',
    fontWeight: 'normal',
  },
};

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: '450px',
    padding: 0,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    boxShadow: 'rgba(27, 31, 35, 0.14902) 0px 1px 15px 0px;',
    borderRadius: '5px',
    overflow: 'hidden',
  },
}))(Tooltip);

function statusIconColor(state) {
  let releaseColor = grey[500];
  switch (state) {
    case 'success':
    case 'succeeded':
      releaseColor = 'rgb(40, 167, 69)';
      break;
    case 'failure':
    case 'failed':
    case 'error':
      releaseColor = 'rgb(203, 36, 49)';
      break;
    case 'pending':
      releaseColor = yellow[800]; // eslint-disable-line
      break;
    case 'unknown':
      releaseColor = grey[500]; // eslint-disable-line
      break;
    default:
      releaseColor = 'rgb(203, 36, 49)';
      break;
  }
  return releaseColor;
}

function statusIcon(state) {
  let StatusIcon = PendingIcon;
  switch (state) {
    case 'success':
    case 'succeeded':
      StatusIcon = SuccessIcon;
      break;
    case 'failure':
    case 'failed':
    case 'error':
      StatusIcon = ErrorIcon;
      break;
    case 'unknown':
      StatusIcon = HelpIcon;
      break;
    default:
      StatusIcon = PendingIcon;
  }
  return StatusIcon;
}

function releaseHeader(state) {
  switch (state) {
    case 'succeeded':
      return 'Release successfully deployed.';
    case 'pending':
      return 'Release is still pending deployment.';
    case 'queue':
      return 'Release is waiting to be deployed.';
    case 'failed':
      return 'The release failed to deploy.';
    case 'error':
      return 'The release encountered an error deploying.';
    default:
      return 'There is no known information on this release.';
  }
}

function buildHeader(state) {
  switch (state) {
    case 'succeeded':
      return 'Build succeeded, but has not released.';
    case 'pending':
      return 'Build is pending, see logs for more info.';
    case 'queue':
      return 'Build is queued.';
    case 'failed':
      return 'Build failed, see logs for more info.';
    case 'error':
      return 'Build errored out';
    default:
      return 'There is no known information on this build.';
  }
}

export default class ReleaseStatus extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      open: false,
      statuses: null,
    };
  }

  handleTooltipClose = async () => {
    this.setState({ open: false });
  };

  handleTooltipOpen = async () => {
    this.setState({ open: true });
    if (this.state.statuses === null) {
      try {
        this.setState({
          statuses: await api.getReleaseStatuses(this.props.release.app.id, this.props.release.id),
        });
      } catch (e) {
        this.setState({ statuses: { data: { statuses: [] } } });
      }
    }
  };

  renderSubHeader() { // eslint-disable-line consistent-return
    if (!(this.state.statuses === null || this.state.statuses.data.statuses.length === 0)) {
      return (
        <sub style={style.subHeader}>{this.state.statuses.data.statuses.length} status checks</sub>
      );
    }
  }

  renderHeader(statusHeaderStyle) {
    const text = this.props.release ?
      releaseHeader(this.props.release.status) :
      buildHeader(this.props.release.status);
    return (
      <h3 style={statusHeaderStyle}>
        {text}
        {this.renderSubHeader()}
      </h3>
    );
  }

  renderStatuses() {
    if (this.state.statuses === null) {
      return (
        <LinearProgress />
      );
    } else if (this.state.statuses.data.statuses.length === 0) {
      return (
        <div key="key-no-statuses" style={{ ...style.stateItem, ...style.stateItemFirst }}>
          <span style={style.stateDescription}>No status checks have been reported</span>
        </div>
      );
    }
    // Don't render more than 10.
    return this.state.statuses.data.statuses.slice(0, 10).map((x, i) => {
      const releaseColor = statusIconColor(x.state);
      const StatusIcon = statusIcon(x.state);
      const stateItemStyle = i === 0 ?
        { ...style.stateItem, ...style.stateItemFirst } :
        style.stateItem;
      const stateIconStyle = {
        fillColor: releaseColor, color: releaseColor, ...style.status, ...style.stateItemIcon,
      };
      return (
        <div key={`key${i.toString()}`} style={stateItemStyle}>
          <StatusIcon style={stateIconStyle} />
          {x.image_url ? (<img alt={x.context} style={style.stateImage} src={x.image_url} />) : ''}
          <strong style={style.stateContextLabel}>{x.context}</strong>
          {x.description ? (<span style={style.stateDescription}> — {x.description}</span>) : ''}
          {x.target_url ? (<a style={style.stateLink} href={x.target_url}>Details</a>) : ''}
        </div>
      );
    });
  }

  render() {
    const stateReleaseColor = statusIconColor((!this.props.release.release || this.props.release.status === 'successful') ? this.props.release.state : this.props.release.status);
    const StateIcon = this.props.release.release ?
      statusIcon(this.props.release.status === 'successful' ? this.props.release.state : this.props.release.status) :
      statusIcon(this.props.release.status);
    const stateStyle = { fillColor: stateReleaseColor, color: stateReleaseColor, ...style.status };

    const statusReleaseColor = statusIconColor(this.props.release.status);
    const statusHeaderStyle = { color: statusReleaseColor, ...style.statusHeader };
    const statusStyle = this.props.release.release ?
      stateStyle :
      { fillColor: statusReleaseColor, color: statusReleaseColor, ...style.status };

    return (
      <ClickAwayListener onClickAway={this.handleTooltipClose}>
        <span>
          <HtmlTooltip
            PopperProps={{
              disablePortal: true,
            }}
            onClose={this.handleTooltipClose}
            open={this.state.open}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            interactive
            title={
              <React.Fragment>
                {this.renderHeader(statusHeaderStyle)}
                {this.renderStatuses()}
              </React.Fragment>
            }
          >
            <Button style={style.statusButton} onClick={this.handleTooltipOpen}>
              <StateIcon style={statusStyle} />
            </Button>
          </HtmlTooltip>
        </span>
      </ClickAwayListener>
    );
  }
}


ReleaseStatus.propTypes = {
  release: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
