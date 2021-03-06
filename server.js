const path = require('path'); // eslint-disable-line no-unused-vars
const express = require('express');
const session = require('express-session');
const request = require('request');
const proxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const redisClient = redis.createClient({url:process.env.REDIS_URL || 'redis://localhost:6379'})

const port = process.env.PORT || 3000;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientURI = process.env.CLIENT_URI || 'http://localhost:3000';
const akkerisApi = process.env.AKKERIS_API;
const authEndpoint = process.env.OAUTH_ENDPOINT;
const https = require('https');

const httpsAgent = new https.Agent({ keepAlive: true, keepAliveMsecs: 360000 }); // 6 minutes

const allowed = ['/oauth/callback', '/logout', '.css', '.js', '.map', '.png', '.ico', '.svg'];
function isUnprotected(requestPath) {
  return allowed.some(resource => requestPath.endsWith(resource));
}

function redirectOAuth(req, res) {
  req.session.redirect = req.originalUrl;
  if (process.env.OAUTH_SCOPES) {
    res.redirect(`${authEndpoint}/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(`${clientURI}/oauth/callback`)}&scope=${encodeURIComponent(process.env.OAUTH_SCOPES)}`);
  } else {
    res.redirect(`${authEndpoint}/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(`${clientURI}/oauth/callback`)}`);
  }
}

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),
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
  if (req.session.token || isUnprotected(req.path)) {
    next();
  } else {
    redirectOAuth(req, res);
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
  request.post(reqopts, (err, response, body) => { // eslint-disable-line
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
    reqOpts.headers.Authorization = `Bearer ${srcReq.session.token}`; // eslint-disable-line no-param-reassign
    reqOpts.agent = httpsAgent;
    reqOpts.headers.connection = 'keep-alive';
    return reqOpts;
  },
}));

app.get('/analytics', (req, res) => {
  if (process.env.GA_TOKEN) {
    res.status(200).send({ ga_token: process.env.GA_TOKEN });
  } else {
    res.sendStatus(404);
  }
});

app.get('/healthcheck', (req, res) => {
  const url = decodeURIComponent(req.query.uri);
  if (url) {
    request({ url }).on('error', (e) => {
      res.status(400).send(e.message || JSON.stringify(e));
    }).pipe(res);
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
  request.delete(reqopts, (error, response, body) => { // eslint-disable-line
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
  const webpack = require('webpack');
  const config = require('./webpack-dev-server.config.js');
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
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
} else {
  console.log(`${process.env.NODE_ENV} ENVIRONMENT`);
  // Production needs physical files! (built via separate process)
  app.use(express.static('build'));
}

// Required for <BrowserRouter> - fallback to index.html on 404
app.get('/*', (req, res) => {
  if (!req.session.token) {
    redirectOAuth(req, res);
  } else {
    res.sendFile(path.resolve(process.env.NODE_ENV === 'dev' ? 'public' : 'build', 'index.html'));
  }
});

const server = app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }
  console.info(`==> 🌎 Listening on port %s. Open up ${clientURI} in your browser.`, port, port);
});

server.keepAliveTimeout = 1000 * (60 * 6); // 6 minutes
