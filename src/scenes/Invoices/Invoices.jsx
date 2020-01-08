import React from 'react';
import { CircularProgress, Paper } from '@material-ui/core';
import InvoiceList from '../../components/Invoices/InvoiceList';
import BaseComponent from '../../BaseComponent';

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
  toolbar: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  link: {
    textDecoration: 'none',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    marginBottom: '12px',
  },
  menu: {
    height: '48px',
    lineHeight: '48px',
  },
  icon: {
    top: '0px',
  },
};

export default class Invoices extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      invoices: [],
      loading: true,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getInvoices();
  }

  getInvoices = async () => {
    try {
      const invoices = await this.api.getInvoices(true);
      this.setState({ invoices, loading: false });
    } catch (error) {
      if (!this.isCancel(error)) {
        console.error(error); // eslint-disable-line no-console
      }
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="invoices" style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div className="invoices">
        <Paper style={style.paper}>
          <InvoiceList invoices={this.state.invoices} />
        </Paper>
      </div>
    );
  }
}
