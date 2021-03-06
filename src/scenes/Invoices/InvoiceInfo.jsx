import React from 'react';
import { withTheme } from '@material-ui/core/styles';
import {
  List, ListItem, ListItemText, CircularProgress, Button, Paper, ListSubheader, Divider,
  Collapse,
} from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';
import { ResponsiveContainer, Line, LineChart, XAxis, YAxis } from 'recharts';
import LightbulbIcon from '../../components/Icons/LightbulbOutline';
import BaseComponent from '../../BaseComponent';

/* eslint-disable react/no-array-index-key */

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

class InvoiceInfo extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
      open: false,
      currentItem: -1,
      currentOrg: '',
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getInvoice();
  }

  getInvoice = async () => {
    try {
      const { data } = await this.api.getInvoice(this.props.match.params.invoice);
      this.setState({ data, loading: false });
    } catch (error) {
      if (!this.isCancel(error)) {
        console.error(error); // eslint-disable-line no-console
      }
    }
  }

  handleClick = (index, org) => {
    const { open, currentItem, currentOrg } = this.state;
    // All items closed, open current item
    if (!open) {
      this.setState({ open: true, currentItem: index, currentOrg: org });
    } else if (currentItem === index && currentOrg === org) {
      // Current item open, close it
      this.setState({ open: false, currentItem: -1, currentOrg: '' });
    } else {
      // Different item open, close it and open index's item
      this.setState({ currentItem: index, currentOrg: org });
    }
  }

  style = {
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
      container: {
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 6px 12px 24px',
        backgroundColor: '#FFF',
      },
      row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      },
      title: {
        flexGrow: 1,
        fontSize: '1.25em',
        fontWeight: 200,
        textTransform: 'uppercase',
        lineHeight: '1em',
        color: this.props.theme.palette.secondary.main,
      },
      subtitle: {
        fontSize: '1.1em',
        fontWeight: 400,
        textTransform: 'uppercase',
        lineHeight: '1em',
        color: this.props.theme.palette.primary.main,
        paddingBottom: '12px',
      },
    },
  }

  renderItems(month, items, name) {
    const data = getData(month, items, name);
    const references = null; // getDataReferences(month, items, name)
    return [(
      <div key={`barchart_${name}_responsive_outer`} style={{ maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
        <ResponsiveContainer key={`barchart_${name}_responsive`} width="100%" height={200}>
          <LineChart key={`barchart_${name}`} data={data}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={this.props.theme.palette.secondary.main} stopOpacity={0.25} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={this.props.theme.palette.primary.main} stopOpacity={0.25} />
              </linearGradient>
              <linearGradient id="colorRv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={this.props.theme.palette.primary.light} stopOpacity={0.25} />
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
    )].concat(items.filter(x => x.app.name === name && (x.billed_price > 0 || x.type !== 'dyno')).map((item, index) => {
      const primaryText = `${item.description}`;
      const secondaryText = `Amount: ${item.quantity} Price: ${formatMoney(item.price_per_unit)} Total: ${formatMoney(item.billed_price)} Added: ${(new Date(item.created_at)).toLocaleString()} ${item.deleted_at ? `Removed: ${(new Date(item.deleted_at)).toLocaleString()}` : ''}`;
      return (
        <ListItem key={name + index}>
          <ListItemText primary={primaryText} secondary={secondaryText} />
        </ListItem>
      );
    }));
  }

  renderOrgs = (month, items) => (
    group(items, 'organization').map((org, index, arr) => (
      <List
        key={`list_org_${org}`}
        subheader={
          <ListSubheader component="div" disableGutters disableSticky>
            <div style={this.style.header.container}>
              <div style={this.style.header.row}>
                <span style={this.style.header.title}>{org}</span>
                <Button
                  style={{ flexGrow: 0, textAlign: 'right', margin: '0 15px' }}
                  href={`/invoices/${month}/${org}`}
                  target="_blank"
                  color="secondary"
                ><LightbulbIcon />{' Cost Report >'}</Button>
              </div>
              <div style={this.style.header.row}>
                <span style={this.style.header.subtitle}>
                Total: {formatMoney(sumByOrg(items, org))}
                </span>
              </div>
            </div>
            <Divider />
          </ListSubheader>
        }
      >
        {this.renderAppsInOrg(month, items, org)}
        {index !== arr.length - 1 ? <Divider /> : null}
      </List>
    ))
  )

  renderAppsInOrg = (month, items, org) => {
    const { open, currentOrg, currentItem } = this.state;
    return (groupByApp(items, org).map((item, index) => (
      <div key={`${org + index}container`}>
        <ListItem button onClick={() => this.handleClick(index, org)}>
          <ListItemText primary={item} secondary={`Total: ${formatMoney(sumByApp(items, item))}`} style={{ padding: '0px 8px' }} />
          {(open && currentItem === index && currentOrg === org) ?
            <ExpandLessIcon /> : <ExpandMoreIcon />
          }
        </ListItem>
        <Collapse
          in={open && currentItem === index && currentOrg === org}
          unmountOnExit
        >
          <List disablePadding style={{ padding: '0px 16px 10px' }} >
            {this.renderItems(month, items, item)}
          </List>
        </Collapse>
        <Divider key={`${org + index}_divider`} />
      </div>
    )));
  }

  render() {
    const { match } = this.props;
    const { data } = this.state;
    if (this.state.loading) {
      return (
        <div style={this.style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={this.style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div className="invoices">
        <Paper style={this.style.paper}>
          {this.renderOrgs(match.params.invoice, data.items)}
        </Paper>
      </div>
    );
  }
}

InvoiceInfo.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  theme: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default withTheme(InvoiceInfo);
