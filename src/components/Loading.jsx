import React from 'react';
import {
  CircularProgress,
} from '@material-ui/core';


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
    <div className="loading" style={style.refresh.div}>
      <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
    </div>
  );
}

export default Loading;
