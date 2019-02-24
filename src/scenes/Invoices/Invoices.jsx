import React, { Component } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { CircularProgress, Paper } from '@material-ui/core';

import api from '../../services/api';
import InvoiceList from '../../components/Invoices/InvoiceList';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
});

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
  }

  getInvoices = async () => {
    const invoices = await api.getInvoices(true);
    this.setState({ invoices, loading: false });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={muiTheme}>
          <div className="invoices" style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div className="invoices">
          <Paper style={style.paper}>
            <InvoiceList invoices={this.state.invoices} />
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}
