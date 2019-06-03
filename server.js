const path = require('path'); // eslint-disable-line no-unused-vars
const express = require('express');
const session = require('express-session');
const request = require('request');
const proxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const Redis = require('connect-redis')(session);
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack-dev-server.config.js');

const port = process.env.PORT || 3000;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientURI = process.env.CLIENT_URI || 'http://localhost:3000';
const akkerisApi = process.env.AKKERIS_API;
const authEndpoint = process.env.OAUTH_ENDPOINT;
const https = require('https');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new Redis({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  }),
  name: 'akkeris',
}));
app.use(bodyParser.json());

app.get('/log-plex/:id', (req, res) => {
  res.append('content-type', 'application/octet-stream');
  let streamRestarts = 0;
  let proxyRequest;

  // Stop sending logs from logplex to client
  const handleAbort = () => {
    proxyRequest.abort();
    res.end();
  };

  // Stop sending logs from logplex to client and send 504 error
  const handleError = () => {
    proxyRequest.abort(); // Stop receiving logs from logplex
    res.status(504).end(); // Stop sending to client
  };

  // Create logplex proxy
  const setupStream = () => (
    https.request(req.params.id, (proxyRes) => {
      proxyRes.on('data', chunk => res.write(chunk)); // Write incoming data to the client
    })
  );

  // Restart sending of logs from logplex to client
  const handleClose = () => {
    if (proxyRequest.aborted) {
      return; // Don't restart if we've stopped sending
    }
    streamRestarts++;
    if (streamRestarts > 25) {
      handleError();
    } else {
      proxyRequest.abort();
      // Restart stream after waiting for 1 second
      setTimeout(() => {
        proxyRequest = setupStream(req, res);
        proxyRequest.on('close', handleClose);
        proxyRequest.on('error', handleClose);
        proxyRequest.setNoDelay(true);
        proxyRequest.end();
      }, 1000);
    }
  };

  proxyRequest = setupStream(req, res);
  // If client ends the connection, stop sending logs
  req.on('end', handleAbort);
  req.on('close', handleAbort);
  // If logplex ends the connection, restart it
  proxyRequest.on('close', handleClose);
  proxyRequest.on('error', handleClose);
  proxyRequest.setNoDelay(true);
  proxyRequest.end();
});

app.use((req, res, next) => {
  if (req.session.token || req.path === '/oauth/callback' || req.path === '/logout' || req.path === '/main.css') {
    next();
  } else {
    req.session.redirect = req.originalUrl;
    if (process.env.OAUTH_SCOPES) {
      res.redirect(`${authEndpoint}/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(`${clientURI}/oauth/callback`)}&scope=${encodeURIComponent(process.env.OAUTH_SCOPES)}`);
    } else {
      res.redirect(`${authEndpoint}/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(`${clientURI}/oauth/callback`)}`);
    }
  }
});

app.get('/oauth/callback', (req, res) => {
  const reqopts = { url: `${authEndpoint}/access_token`, headers: { 'user-agent': 'akkerisui', accept: 'application/json' } };
  reqopts.form = {
    client_id: clientID,
    client_secret: clientSecret,
    code: req.query.code,
    grant_type: 'authorization_code',
  };
  request.post(reqopts, (err, response, body) => {
    if (err) {
      console.error('Error retrieving access token from auth code:');
      console.error(err);
      return res.send('Uh oh, an error occured.  Please try again later.');
    } else if (response.statusCode < 200 || response.statusCode > 299) {
      console.error('Error retrieving access token from auth code, invalid response:');
      console.error(response.statusCode, response.headers);
      return res.send('Uh oh, an error occured.  Please try again later.');
    }
    req.session.token = JSON.parse(body).access_token;
    res.redirect(req.session.redirect || '/');
  });
});

app.use('/api', proxy(`${akkerisApi}`, {
  proxyReqOptDecorator(reqOpts, srcReq) {
    reqOpts.headers.Authorization = `Bearer ${srcReq.session.token}`;
    return reqOpts;
  },
}));

app.get('/healthcheck', (req, res) => {
  const url = decodeURIComponent(req.query.uri);
  if (url) {
    request({ url }).on('error', e => res.end(e)).pipe(res);
  } else {
    res.sendStatus(400);
  }
});

/* eslint-enable no-param-reassign */

app.get('/logout', (req, res) => {
  const reqopts = {
    url: `${authEndpoint}/authorizations/${req.session.token}`,
    headers: { 'user-agent': 'akkerisui', accept: 'application/json' },
    followRedirect: false,
    maxRedirects: 0,
  };
  req.session.destroy();
  request.delete(reqopts, (error, response, body) => {
    if (error) {
      return console.error('delete failed:', error);
    }
  });
  if (process.env.NODE_ENV === 'dev') {
    res.sendFile(path.resolve('public', 'logout.html'));
  } else {
    res.sendFile(path.resolve('build', 'logout.html'));
  }
});

app.get('/user', (req, res) => {
  res.redirect(process.env.OAUTH_USER_VIEW || `${authEndpoint}/user`);
});

if (process.env.NODE_ENV === 'dev') {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
    },
  });
  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.use(express.static('public'));
  // Required for <BrowserRouter> - fallback to index.html on 404
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve('public', 'index.html'));
  });
} else {
  console.log(`${process.env.NODE_ENV} ENVIRONMENT`);
  // Production needs physical files! (built via separate process)
  app.use(express.static('build'));
  // Required for <BrowserRouter> - fallback to index.html on 404
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve('build', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }
  console.info(`==> 🌎 Listening on port %s. Open up ${clientURI} in your browser.`, port, port);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('Running tests!');

  // Give react some time to spin up
  if (process.env.NODE_ENV === 'dev') {
    console.log('Sleeping for 20 seconds...');
    await sleep(20000);
  }

  const createTestCafe = require('testcafe'); // eslint-disable-line

  const tests = process.env.TESTCAFE_TESTS ? process.env.TESTCAFE_TESTS : 'test/e2e/*';

  try {
    const testcafe = await createTestCafe();
    const testResult = await testcafe
      .createRunner()
      .src(tests)
      .browsers('selenium:chrome')
      .reporter('spec')
      .run();

    if (testResult === 0) {
      console.log('All tests passed!');
    } else {
      console.log(`${testResult} TESTS FAILED`);
    }

    testcafe.close();
    process.exit(testResult);
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
}

if (process.env.RUN_TESTCAFE) {
  if (!process.env.SELENIUM_SERVER) {
    console.error('Selenium server address is required.');
    console.error('Please supply SELENIUM_SERVER environment variable.');
    process.exit(-1);
  }
  runTests();
}
