import React from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import { Paper } from '@material-ui/core';

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
});

const style = {
  header: {
    marginTop: '20px',
    marginBottom: '35px',
    fontSize: '2em',
    color: 'rgba(0,0,0,0.8)',
  },
  subheader: {
    fontSize: '1.5em',
    color: 'rgba(0,0,0,0.8)',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '2em',
    marginBottom: '2em',
  },
};

function PageNotFound() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <div>
        <Paper style={style.paper}>
          <div className="internal">
            <div className="status" style={style.header}>Uh oh... 404</div>
            <div style={style.subheader}>{'Sorry - We couldn\'t find the page you\'re looking for 🤷'}</div>
          </div>
        </Paper>
      </div>
    </MuiThemeProvider>
  );
}

export default PageNotFound;
