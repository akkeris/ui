import React from 'react';
import { Paper } from '@material-ui/core';

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
    <Paper style={style.paper}>
      <div className="internal">
        <div className="status" style={style.header}>Uh oh... 404</div>
        <div style={style.subheader}>{'Sorry - We couldn\'t find the page you\'re looking for 🤷'}</div>
      </div>
    </Paper>
  );
}

export default PageNotFound;
