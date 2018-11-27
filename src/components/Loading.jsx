import React from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  CircularProgress,
} from '@material-ui/core';

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
};

function Loading() {
  return (
    <div>
      <MuiThemeProvider theme={muiTheme}>
        <div className="loading" style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      </MuiThemeProvider>);
    </div>
  );
}

export default Loading;
