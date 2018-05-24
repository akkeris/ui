import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import { ResponsiveContainer, Line, LineChart, XAxis, YAxis } from 'recharts';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import LightBulbIcon from 'material-ui/svg-icons/action/lightbulb-outline';

import api from '../../services/api';

/* eslint-disable react/no-array-index-key */

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
  tabs: {
    backgroundColor: '#3c4146',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    marginBottom: '12px',
  },
  card: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
  rightIcon: {
    float: 'right',
    cursor: 'pointer',
  },
  header: {
    main: {
      display: 'flex',
      color: muiTheme.palette.accent1Color,
      paddingTop: '2em',
      fontSize: '1.25em',
      fontWeight: 200,
      textTransform: 'uppercase',
      paddingBottom: '1em',
      lineHeight: '1em',
    },
  },
  footer: {
    main: {
      color: muiTheme.palette.primary1Color,
      fontWeight: 400,
      textTransform: 'uppercase',
      marginLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: '1em',
      lineHeight: '1em',
    },
  },
};

function formatMoney(amount) {
  return `$${amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
}

function group(items, property) {
  const groups = {};
  items.forEach((x) => { groups[x[property]] = 1; });
  return Object.keys(groups);
}

function groupByApp(items, org) {
  const apps = {};
  items.filter(x => x.organization === org).forEach((x) => { apps[x.app.name] = 1; });
  return Object.keys(apps);
}

function sumByAppAndDay(items, day, app, days) {
  return items.filter(x => x.app.name === app).filter((x) => {
    const start = new Date(x.created_at);
    const end = new Date(x.deleted_at || day);
    return start.getTime() <= day.getTime() && day.getTime() <= end.getTime();
  }).reduce((x, y) => x + y.billed_price, 0) / days;
}

function sumByApp(items, app) {
  return items.filter(x => x.app.name === app).reduce((x, y) => x + y.billed_price, 0);
}

function sumByOrg(items, org) {
  return items.filter(x => x.organization === org).reduce((x, y) => x + y.billed_price, 0);
}

function getData(month, items, app) {
  const comps = month.split('-').map(x => parseInt(x, 10));
  const beginDate = new Date(Date.UTC(comps[0], comps[1] - 1, 1));
  const endDate = new Date(beginDate.toUTCString());
  endDate.setUTCMonth(endDate.getUTCMonth() + 1);
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  const data = [];
  for (let i = 1; i <= endDate.getDate(); i++) {
    const day = new Date(beginDate.toUTCString());
    day.setUTCDate(day.getUTCDate() + (i - 1));
    data.push({
      day: day.getUTCDate(),
      amount: sumByAppAndDay(items, day, app, endDate.getDate()),
    });
  }
  return data;
}

function getItems(month, items, name) {
  const data = getData(month, items, name);
  const references = null; // getDataReferences(month, items, name)
  return [
    (
      <div key={`barchart_${name}_responsive_outer`} style={{ maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
        <ResponsiveContainer key={`barchart_${name}_responsive`} width="100%" height={200}>
          <LineChart key={`barchart_${name}`} data={data}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={muiTheme.palette.accent1Color} stopOpacity={0.25} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={muiTheme.palette.primary1Color} stopOpacity={0.25} />
              </linearGradient>
              <linearGradient id="colorRv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={muiTheme.palette.primary2Color} stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <XAxis
              name="days"
              dataKey="day"
              tickSize={0}
              axisLine={false}
              padding={{ left: 8, right: 8 }}
              tick={{ fill: 'rgb(173,183,198)', fontSize: 11, strokeWidth: 0 }}
            />
            <YAxis
              tick={{ fill: 'rgb(173,183,198)', fontSize: 11, strokeWidth: 0 }}
              tickLine={false}
              tickSize={0}
              axisLine={false}
              tickFormatter={x => `$${x.toFixed(2)}`}
              padding={{ top: 8, bottom: 8 }}
            />
            {references}
            <Line
              type="step"
              dot
              dataKey="amount"
              stroke="rgb(174,58,152)"
              fill="rgb(174,58,152)"
              fillOpacity={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ),
  ].concat(items.filter(x => x.app.name === name && (x.billed_price > 0 || x.type !== 'dyno')).map((item, index) => {
    const primaryText = `${item.description}`;
    const secondaryText = `Amount: ${item.quantity} Price: ${formatMoney(item.price_per_unit)} Total: ${formatMoney(item.billed_price)} Added: ${(new Date(item.created_at)).toLocaleString()} ${item.deleted_at ? `Removed: ${(new Date(item.deleted_at)).toLocaleString()}` : ''}`;
    return (
      <ListItem
        key={name + index}
        secondaryText={secondaryText}
        primaryText={primaryText}
      />
    );
  }));
}

function getAppsInOrg(month, items, org) {
  return (groupByApp(items, org).map((item, index) => (
    <div key={`${org + index}container`}>
      <Divider key={`${org + index}_divider`} />
      <ListItem
        key={org + index}
        primaryTogglesNestedList
        style={{ margin: 0, padding: 0 }}
        hoverColor="transparent"
        nestedItems={getItems(month, items, item)}
        primaryText={item}
        secondaryText={`Total: ${formatMoney(sumByApp(items, item))}`}
      />
    </div>

  )));
}

function getOrgs(month, items) {
  return group(items, 'organization').map(org => (
    <List key={`list_org_${org}`}>
      <Subheader style={style.header.main}>
        <span style={{ flexGrow: 1, padding: '12px 5px' }}>{org}</span>

        <FlatButton
          style={{ flexGrow: 0, textAlign: 'right', margin: '0 15px' }}
          href={`/#/invoices/${month}/${org}`}
          target="_blank"
          label="Cost Report >"
          secondary
          icon={<LightBulbIcon />}
        />
      </Subheader>
      {getAppsInOrg(month, items, org)}
      <Subheader style={style.footer.main}>
        {org} Total: {formatMoney(sumByOrg(items, org))}
      </Subheader>
    </List>
  ));
}

export default class InvoiceInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
    };
  }

  componentDidMount() {
    api.getInvoice(this.props.match.params.invoice).then((response) => {
      this.setState({
        data: response.data,
        loading: false,
      });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="invoices">
          <Paper style={style.paper}>
            {getOrgs(this.props.match.params.invoice, this.state.data.items)}
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}

InvoiceInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
