import React from 'react';
import { render } from 'react-dom';
import Router from './config/Router'; // Our custom react component
import { Http, Https } from '@material-ui/icons';


// Render the main app react component into the app div.
// For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
if (sessionStorage.getItem('ga_token')) {
  render(
    <Router />
    , document.getElementById('app'),
  );
} else {
  var ga_token
  fetch('/analytics').then(async (res) => {
    if (res.status === 404) {
      ga_token = '';
    } else {
      ga_token = await res.json();
    }
    sessionStorage.setItem('ga_token', ga_token.ga_token);
    render(
      <Router />
      , document.getElementById('app'),
    );
  });
}

