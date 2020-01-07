import React from 'react';
import api from './services/api';

/**
 * Base component with important helpers for setting state, making network requests
 *
 * The _isMounted property ensures that state is not set when the component is unmounted
 *
 * The cancelToken will be provided to any Axios request using this.api. The request(s) will be
 * automatically cancelled upon the component unmounting, or upon calling cancelNetworkRequests
 */
class BaseComponent extends React.Component {
  constructor(props, context) {
    super(props, context);
    this._isMounted = false;
    this._cancelSource = api.getCancelSource();
    this.cancelToken = this._cancelSource.token;

    this.api = Object.entries(api).reduce((acc, [k, v]) => {
      if (typeof v === 'function') acc[k] = v.bind(this);
      return acc;
    }, {});
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.cancelNetworkRequests();
  }

  setState(partialState, callback) {
    if (this._isMounted) {
      super.setState(partialState, callback);
    }
  }

  cancelNetworkRequests() {
    this._cancelSource.cancel('Component unmounted.');
  }

  isCancel = api.isCancel;
}

export default BaseComponent;
