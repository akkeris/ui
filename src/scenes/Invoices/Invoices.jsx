import React, { Component } from 'react';
import { CircularProgress, Paper } from '@material-ui/core';
import axios from 'axios';
import api from '../../services/api';
import InvoiceList from '../../components/Invoices/InvoiceList';

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

export default class Invoices extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      invoices: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getInvoices();
    this._isMounted = true;
  }

  componentWillUnmount() {
    if (this.cancelSource.token) {
      this.cancelSource.cancel();
    }
    this._isMounted = false;
  }

  getInvoices = async () => {
    this.cancelSource = axios.CancelToken.source();
    try {
      const invoices = await api.getInvoices(true, this.cancelSource.token);
      if (this._isMounted) {
        this.setState({ invoices, loading: false });
      }
    } catch (err) {
      if (!axios.isCancel(err)) { console.err(err); }
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
