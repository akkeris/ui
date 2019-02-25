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
const jsonminify = require('jsonminify');

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
  const proxyRequest = https.request(req.params.id, (proxyRes) => {
    proxyRes.on('data', (chunk) => {
      res.write(chunk);
    });
    req.on('close', () => {
      proxyRes.destroy();
    });
  });
  proxyRequest.on('error', (err) => {
    console.log('log proxy oops: ', err);
    res.status(504).end();
  });
  proxyRequest.setNoDelay(true);
  proxyRequest.end();
});

app.use((req, res, next) => {
  if (req.session.token || req.path === '/oauth/callback') {
    next();
  } else {
    req.session.redirect = req.originalUrl;
    res.redirect(`${authEndpoint}/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(`${clientURI}/oauth/callback`)}`);
  }
});

app.get('/oauth/callback', (req, res) => {
  request.post(`${authEndpoint}/access_token`, {
    form: {
      client_id: clientID,
      client_secret: clientSecret,
      code: req.query.code,
      grant_type: 'authorization_code',
    },
  }, (err, response, body) => {
    req.session.token = JSON.parse(body).access_token;
    res.redirect(req.session.redirect || '/');
  });
});

/* eslint-disable no-param-reassign */
app.use('/account', proxy(`${authEndpoint}/user`, {
  proxyReqOptDecorator(reqOpts, srcReq) {
    reqOpts.headers.Authorization = `Bearer ${srcReq.session.token}`;
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.headers['content-type'] = 'application/json';
    reqOpts.headers.Accept = 'application/json';
    reqOpts.headers.Cookie = null;
    return reqOpts;
  },
  userResDecorator(proxyRes, proxyResData, userReq, userRes) {
    userRes.set('Set-Cookie', '');
    userRes.set('set-cookie', '');
    return proxyResData;
  },
}));

app.use('/api', proxy(`${akkerisApi}`, {
  proxyReqOptDecorator(reqOpts, srcReq) {
    reqOpts.headers.Authorization = `Bearer ${srcReq.session.token}`;
    return reqOpts;
  },
}));
/* eslint-enable no-param-reassign */

app.get('/logout', (req, res) => {
  req.session.token = null;
  res.redirect(`${authEndpoint}/logout`);
});

app.get('/user', (req, res) => {
  res.redirect(`${authEndpoint}/user`);
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
