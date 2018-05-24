import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const Home = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div>
      <h1>Home Go Here</h1>
    </div>
  </MuiThemeProvider>
);

export default Home;
