import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, ListSubheader, Divider } from '@material-ui/core';
import CPUIcon from '@material-ui/icons/Memory';
import { pink } from '@material-ui/core/colors';

import api from '../../services/api';
import recommendations from '../../services/util/recommendations';
import Charts from './Charts';

/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '350px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  header: {
    subsection: {
      paddingLeft: '0px',
      textTransform: 'uppercase',
      marginTop: '0px',
      color: pink[500],
      fontWeight: 400,
      padding: '0.5em 4em',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      background: 'rgba(0,0,0,.02)',
    },
    subsectionIcon: {
      width: '24px',
      height: '24px',
      verticalAlign: 'middle',
    },
    subsectionTitle: { paddingLeft: '2.5px', verticalAlign: 'middle' },
  },
};

function rangeMetrics(dataPoints) {
  const dataPointsOut = [];
  dataPoints.forEach((point) => {
    dataPointsOut.push(point);
    dataPointsOut.push(point);
  });
  return dataPointsOut;
}

function deriveMetricName(metricName) {
  return metricName.replace(/_ms/g, '')
    .replace(/_bytes_total/g, '')
    .replace(/^network_/g, '')
    .replace(/_bytes$/g, '')
    .replace(/_total/g, '')
    .replace(/count_/g, '')
    .replace(/sample_/g, '')
    .replace(/^fs_/g, 'File System ')
    .replace(/_db_/g, ' Database ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(x => (x ? x[0].toUpperCase() + x.substring(1) : metricName.toUpperCase()))
    .join(' ');
}

function deriveUnit(metricName) {
  if (metricName.indexOf('_ms') > -1 || metricName.indexOf('time') > -1) {
    return 'ms';
  } else if (metricName.indexOf('_bytes') > -1 || metricName.indexOf('memory') > -1 || metricName.indexOf('size') > -1 || metricName.indexOf('capacity') > -1) {
    return 'B';
  }
  return '';
}

const metricGroups = [
  ['router_status_200', 'router_status_201', 'router_status_202', 'router_status_203', 'router_status_204', 'router_status_205'],
  ['router_status_300', 'router_status_301', 'router_status_302', 'router_status_303', 'router_status_304'],
  ['router_status_400', 'router_status_401', 'router_status_403', 'router_status_404', 'router_status_409', 'router_status_422'],
  ['router_status_500', 'router_status_501', 'router_status_502', 'router_status_503'],
  ['memory_working_set_bytes', 'memory_rss', 'memory_usage_bytes'],
  ['network_receive_bytes_total', 'network_transmit_bytes_total'],
];

const keyName = ['x', 'y', 'z', 'u', 'v', 'w', 'n', 'm', 'o'];

function groupMetrics(names) {
  return names.filter(name => !metricGroups.some(group => (group.indexOf(name) > -1)))
    .map(name => [name])
    .concat(metricGroups);
}

export default class Metrics extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      reading: false,
      metrics: {},
      formations: {},
      addons: {},
      sizes: {},
    };
    this.loadMetrics();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  loadMetrics = async () => {
    const { data: sizes } = await api.getFormationSizes();
    const { data: formations } = await api.getFormations(this.props.app);
    const { data: metrics } = await api.getMetrics(this.props.app);
    const { data: addons } = await api.getAppAddons(this.props.app);
    if (this._isMounted) {
      this.setState({
        sizes,
        formations,
        metrics,
        addons,
        loading: false,
        reading: true,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    } else if (this.state.reading) {
      const charts = [];
      const date = new Date();
      const { metrics } = this.state;
      Object.keys(metrics).forEach((section, index) => {
        charts.push((
          <div key={section.toString()}>
            <Divider key={`divider${section}${index}`} />
            <ListSubheader key={`subheader${section}${index}`} style={style.header.subsection}>
              <CPUIcon
                color="secondary"
                style={style.header.subsectionIcon}
              />
              <span style={style.header.subsectionTitle}>{`${section} Dyno`}</span>
            </ListSubheader>
          </div>
        ));
        groupMetrics(Object.keys(metrics[section])).forEach((metricNames, metricIndex) => {
          if (metricNames.length === 1 && Object.keys(metrics[section][metricNames[0]]).length === 0
          ) {
            return;
          }
          const data = [];
          const legend = {};
          let found = false;
          let keyIndex = 0;
          metricNames.forEach((metricName) => {
            if (metrics[section][metricName]) {
              Object.keys(metrics[section][metricName]).forEach((time, entryIndex) => {
                found = true;
                date.setTime(time * 1000);
                data[entryIndex] = data[entryIndex] || { time: date.toLocaleString(), epoch: time };
                legend[keyName[keyIndex]] = deriveMetricName(metricName);
                data[entryIndex][keyName[keyIndex]] = parseFloat(metrics[section][metricName][time], 10);
              });
              keyIndex++;
            }
          });
          if (found) {
            let i = 0;
            while (!metrics[section][metricNames[i]] && i < 100) i++;
            if (i < 100) {
              charts.push((
                <Charts
                  key={`${section}_chart_${metricIndex}`}
                  data={rangeMetrics(data)}
                  legend={legend}
                  unit={deriveUnit(metricNames[0])}
                />
              ));
            }
          }
        });
      });
      const notes = recommendations.execute(this.state.metrics, this.state.formations, this.state.addons, this.state.sizes);
      let notesDom = null;
      if (notes.length > 0) {
        notesDom = (
          <div className="recommendations">
            <h3>Recommendations &amp; Warnings</h3>
            <ul>
              {notes}
            </ul>
          </div>
        );
      }
      return (
        <div>
          {notesDom}
          {charts}
        </div>
      );
    }
    return (
      <div />
    );
  }
}

Metrics.propTypes = {
  app: PropTypes.string.isRequired,
};
