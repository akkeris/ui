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
const gitClientID = process.env.GIT_CLIENT_ID;
const gitClientSecret = process.env.GIT_CLIENT_SECRET;
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
    res.end();
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

app.get('/github/callback', (req, res) => {
  request.post({
    url: 'https://github.com/login/oauth/access_token',
    form: {
      client_id: gitClientID,
      client_secret: gitClientSecret,
      code: req.query.code,
    },
    headers: {
      Accept: 'application/json',
    },
  }, (err, response, body) => {
    req.session.git_token = JSON.parse(body).access_token;
    res.redirect(req.session.redirect || '/');
  });
});


app.use('/github/oauth', (req, res) => {
  req.session.redirect = req.query.url;
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${gitClientID}&scope=admin:repo_hook repo&redirect_uri=${encodeURIComponent(`${clientURI}/github/callback`)}`);
});

app.use('/github/gimme', (req, res) => {
  if (req.session.git_token) {
    res.send({
      token: req.session.git_token,
    });
  } else {
    res.status(404).send();
  }
});

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

app.use('/app-setups', (req, res) => {
  res.redirect(`/?blueprint=${encodeURIComponent(req.query.blueprint)}#/app-setups`);
});

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
} else {
  console.log(`${process.env.NODE_ENV} ENVIRONMENT`);
  // Production needs physical files! (built via separate process)
  app.use(express.static('build'));
}

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }
  console.info(`==> 🌎 Listening on port %s. Open up ${clientURI} in your browser.`, port, port);
});
