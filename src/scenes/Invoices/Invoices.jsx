import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Paper from 'material-ui/Paper';

import api from '../../services/api';
import InvoiceList from '../../components/Invoices/InvoiceList';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
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
    api.getInvoices(true).then((response) => {
      this.setState({
        invoices: response,
        loading: false,
      });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div className="invoices" style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="invoices">
          <Paper style={style.paper}>
            <InvoiceList invoices={this.state.invoices} />
          </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}
