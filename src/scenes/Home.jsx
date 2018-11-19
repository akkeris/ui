import React from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const muiTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
});

const Home = () => (
  <MuiThemeProvider theme={muiTheme}>
    <div>
      <h1>Home Go Here</h1>
    </div>
  </MuiThemeProvider>
);

export default Home;
