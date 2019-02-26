import createBrowserHistory from 'history/createBrowserHistory';

// Export History as a singleton that restricts access to the Browser History

const browserHistory = createBrowserHistory();

const History = {
  get: () => browserHistory,
};

Object.freeze(History);

export default History;
