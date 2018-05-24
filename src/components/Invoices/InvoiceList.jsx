import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardHeader } from 'material-ui/Card';
import { BarChart, Bar, XAxis } from 'recharts';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  tableRow: {
    height: '58px',
    cursor: 'pointer',
  },
  tableRowColumn: {
    main: {
      fontSize: '16px',
      textDecoration: 'underline',
      color: 'rgb(174,58,152)',
    },
    mainRight: {
      fontSize: '16px',
      textAlign: 'right',
      textDecoration: 'underline',
      color: 'rgb(174,58,152)',
    },
    mainCenter: {
      fontSize: '16px',
      textAlign: 'center',
      textDecoration: 'underline',
      color: 'rgb(174,58,152)',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
  },
};

function formatMoney(amount) {
  return `$${amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
}

function getNamedMonth(date) {
  switch (date.getUTCMonth()) {
    case 0: return 'January';
    case 1: return 'February';
    case 2: return 'March';
    case 3: return 'April';
    case 4: return 'May';
    case 5: return 'June';
    case 6: return 'July';
    case 7: return 'August';
    case 8: return 'September';
    case 9: return 'October';
    case 10: return 'November';
    case 11: return 'December';
    default: return 'Apocolypse';
  }
}

function getNamedShortMonth(date) {
  switch (date.getUTCMonth()) {
    case 0: return 'Jan';
    case 1: return 'Feb';
    case 2: return 'Mar';
    case 3: return 'Apr';
    case 4: return 'May';
    case 5: return 'June';
    case 6: return 'July';
    case 7: return 'Aug';
    case 8: return 'Sept';
    case 9: return 'Oct';
    case 10: return 'Nov';
    case 11: return 'Dec';
    default: return 'Merp';
  }
}

export default class InvoiceList extends Component {
  getInvoiceHistory() {
    // only show the last 20 entries.
    const data = this.props.invoices.map((invoice) => {
      const time = new Date(invoice.period_start);
      return { time: getNamedShortMonth(time), x: invoice.charges_total };
    });
    return data.slice(data.length > 20 ? (data.length - 20) : 0, data.length);
  }

  getInvoiceTotal() {
    return this.props.invoices.filter(invoice => invoice.state === 2)
      .reduce((y, x) => y + x.charges_total, 0);
  }

  getInvoices() {
    return this.props.invoices.map((invoice) => {
      const periodStart = new Date(invoice.period_start);
      const month = getNamedMonth(periodStart);
      return (
        <TableRow key={invoice.id} style={style.tableRow}>
          <TableRowColumn style={style.tableRowColumn.main}>
            {month} {periodStart.getUTCFullYear()}
          </TableRowColumn>
          <TableRowColumn style={style.tableRowColumn.mainCenter}>
            {formatMoney(invoice.charges_total)}
          </TableRowColumn>
          <TableRowColumn style={style.tableRowColumn.mainRight}>
            {invoice.state === 1 ? 'Paid' : 'Pending'}
          </TableRowColumn>
        </TableRow>
      );
    });
  }

  handleRowSelection = (selectedRows) => {
    window.location = `#/invoices/${this.props.invoices[selectedRows].id}`;
  }

  render() {
    return (
      <div>
        <Card>
          <CardHeader title="Billing Information" subtitle={`Current Usage: ${formatMoney(this.getInvoiceTotal())}`} />
        </Card>
        <BarChart
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
          margin={{
 top: 15, bottom: 15, left: 15, right: 15,
}}
          width={600}
          height={200}
          data={this.getInvoiceHistory()}
        >
          <XAxis axisLine={false} dataKey="time" tickLine={false} />
          <Bar type="monotone" dataKey="x" fill={muiTheme.palette.primary1Color} />
        </BarChart>
        <Table onRowSelection={this.handleRowSelection}>
          <TableBody displayRowCheckbox={false} showRowHover>
            {this.getInvoices()}
          </TableBody>
        </Table>
      </div>
    );
  }
}

InvoiceList.propTypes = {
  invoices: PropTypes.arrayOf(PropTypes.object).isRequired,
};
