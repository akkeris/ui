import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableRow, TableCell, Card, CardHeader } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import { BarChart, Bar, XAxis } from 'recharts';
import History from '../../config/History';

const style = {
  card: {
    marginTop: '0px',
  },
  tableRow: {
    height: '58px',
    cursor: 'pointer',
  },
  tableCell: {
    main: {
      width: '33%',
      fontSize: '16px',
      textDecoration: 'underline',
      color: 'rgb(174,58,152)',
    },
    mainRight: {
      width: '33%',
      fontSize: '16px',
      textAlign: 'right',
      textDecoration: 'underline',
      color: 'rgb(174,58,152)',
    },
    mainCenter: {
      width: '33%',
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

class InvoiceList extends Component {
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
        <TableRow
          key={invoice.id}
          style={style.tableRow}
          hover
          onClick={() => this.handleRowSelection(invoice.id)}
        >
          <TableCell style={style.tableCell.main}>
            {month} {periodStart.getUTCFullYear()}
          </TableCell>
          <TableCell style={style.tableCell.mainCenter}>
            {formatMoney(invoice.charges_total)}
          </TableCell>
          <TableCell style={style.tableCell.mainRight}>
            {invoice.state === 1 ? 'Paid' : 'Pending'}
          </TableCell>
        </TableRow>
      );
    });
  }

  handleRowSelection = (id) => {
    History.get().push(`/invoices/${id}`);
  }

  render() {
    const { theme } = this.props;
    return (
      <div style={{ overflow: 'auto' }}>
        <Card style={style.card}>
          <CardHeader title="Billing Information" subheader={`Current Usage: ${formatMoney(this.getInvoiceTotal())}`} />
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
          <Bar type="monotone" dataKey="x" fill={theme.palette.primary.main} />
        </BarChart>
        <Table>
          <TableBody>
            {this.getInvoices()}
          </TableBody>
        </Table>
      </div>
    );
  }
}

InvoiceList.propTypes = {
  invoices: PropTypes.arrayOf(PropTypes.object).isRequired,
  theme: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default withTheme(InvoiceList);
