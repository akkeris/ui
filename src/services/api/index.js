const axios = require('axios');

const notify = new class Notify {
  constructor() {
    this.listeners = {};
  }
  add(listener) {
    if (this.listeners[listener.name]) return;
    this.listeners[listener.name] = listener.cb;
  }
  remove(listenerName) {
    delete this.listeners[listenerName];
  }
  send = msg => Object.values(this.listeners).forEach(l => l(msg));
}();

function getApps() {
  return axios.get('/api/apps');
}

function getApp(app) {
  return axios.get(`/api/apps/${app}`);
}

function deleteApp(app) {
  notify.send('app delete');
  return axios.delete(`/api/apps/${app}`);
}

function createApp(name, org, space) {
  notify.send('app create');
  return axios.post('/api/apps', { org, name, space });
}

function appSetup(blueprint) {
  return axios.post('/api/app-setups', blueprint);
}

function getAppSetup(id) {
  return axios.get(`/api/app-setups/${id}`);
}

function patchApp(app, isMaintenance) {
  return axios.patch(`/api/apps/${app}`, {
    maintenance: isMaintenance,
  });
}

function getAudits(app, space, size, user) {
  return axios.get(`/api/audits?app=${app}&space=${space}${user ? `&user=${user}` : ''}${size ? `&size=${size}` : ''}`);
}

function getFormations(app) {
  return axios.get(`/api/apps/${app}/formation`);
}

function createFormation(app, size, quantity, type, port, command) {
  return axios.post(`/api/apps/${app}/formation`, {
    size,
    quantity,
    type,
    port,
    command,
  });
}

function createWebHook(app, url, events, secret) {
  return axios.post(`/api/apps/${app}/hooks`, {
    url,
    events,
    active: true,
    secret,
  });
}

function deleteFormation(app, formation) {
  return axios.delete(`/api/apps/${app}/formation/${formation}`);
}

function patchFormation(app, type, size, quantity, command, port, healthcheck, removeHealthcheck) {
  return axios.patch(`/api/apps/${app}/formation`, [{
    type,
    size,
    quantity,
    command,
    port,
    healthcheck,
    removeHealthcheck,
  }]);
}

function patchWebhook(app, id, url, events, secret, active) {
  return axios.patch(`/api/apps/${app}/hooks/${id}`, {
    url,
    events,
    secret,
    active,
  });
}
function getWebhookResults(app, id) {
  return axios.get(`/api/apps/${app}/hooks/${id}/results`);
}

function restartFormation(app, type) {
  return axios.delete(`/api/apps/${app}/dynos/${type}`);
}

function getFormationSizes() {
  return axios.get('/api/sizes');
}

function getDynos(app) {
  return axios.get(`/api/apps/${app}/dynos`);
}

function getSpaces() {
  return axios.get('/api/spaces');
}

function createSpace(space, description, compliance, stack) {
  return axios.post('/api/spaces', {
    name: space,
    description,
    compliance,
    stack,
  });
}

function getAppAddons(app) {
  return axios.get(`/api/apps/${app}/addons`);
}

function getAppsAttachedToAddon(app, addon) {
  return axios.get(`/api/apps/${app}/addons/${addon}`);
}

function getAppWebhooks(app) {
  return axios.get(`/api/apps/${app}/hooks`);
}

function getAddon(app, addon) {
  return axios.get(`/api/apps/${app}/addons/${addon}`);
}

function getAddonServices() {
  return axios.get('/api/addon-services');
}

function getAddonServicePlans(addon) {
  return axios.get(`/api/addon-services/${addon}/plans`);
}

function createAddon(app, plan) {
  return axios.post(`/api/apps/${app}/addons`, {
    plan,
  });
}

function attachAddon(app, addon) {
  return axios.post(`/api/apps/${app}/addon-attachments`, {
    app,
    addon,
  });
}

function getAddonAttachments(app) {
  return axios.get(`/api/apps/${app}/addon-attachments`);
}

function deleteAddonAttachment(app, attachment) {
  return axios.delete(`/api/apps/${app}/addon-attachments/${attachment}`);
}
function deleteAddon(app, addon) {
  return axios.delete(`/api/apps/${app}/addons/${addon}`);
}

function deleteWebhook(app, webhookId) {
  return axios.delete(`/api/apps/${app}/hooks/${webhookId}`);
}

function getBuilds(app) {
  return axios.get(`/api/apps/${app}/builds`);
}

function getBuildResult(app, build) {
  return axios.get(`/api/apps/${app}/builds/${build}/result`);
}

function createBuild(app, org, checksum, url, repo, sha, branch, version) {
  return axios.post(`/api/apps/${app}/builds`, {
    checksum,
    url,
    repo,
    sha,
    branch,
    version,
  });
}

function createAutoBuild(app, repo, branch, statusCheck, autoDeploy, username, token) {
  return axios.post(`/api/apps/${app}/builds/auto`, {
    app,
    repo,
    branch,
    statusCheck,
    autoDeploy,
    username,
    token,
  });
}

function getAutoBuild(app) {
  return axios.get(`/api/apps/${app}/builds/auto/github`);
}

function deleteAutoBuild(app) {
  return axios.delete(`/api/apps/${app}/builds/auto/github`);
}

function redoBuild(app, build) {
  return axios.put(`/api/apps/${app}/builds/${build}`);
}

async function getReleases(app) {
  return Promise.all((await axios.get(`/api/apps/${app}/releases`))
    .data
    .slice(-10)
    .map(async release => Object.assign(release, { slug: (await axios.get(`/api/slugs/${release.slug.id}`)).data })));
}

function createRelease(app, slug, release, description) {
  return axios.post(`/api/apps/${app}/releases`, {
    slug,
    release,
    description,
  });
}

function getOrgs() {
  return axios.get('/api/organizations');
}

function createOrg(org, description) {
  return axios.post('/api/organizations', {
    name: org,
    description,
  });
}

function getConfig(app) {
  return axios.get(`/api/apps/${app}/config-vars`);
}

function patchConfig(app, values) {
  return axios.patch(`/api/apps/${app}/config-vars`, values);
}

function getLogs(app) {
  return axios.post(`/api/apps/${app}/log-sessions`, {
    lines: 10,
    tail: true,
  }); // then follow log session route
}

function getMetrics(app) {
  return axios.get(`/api/apps/${app}/metrics?resolution=10m`);
}

function getPipelines() {
  return axios.get('/api/pipelines');
}

function getPipeline(pipeline) {
  return axios.get(`/api/pipelines/${pipeline}`);
}

function getPipelineCouplings(pipeline) {
  return axios.get(`/api/pipelines/${pipeline}/pipeline-couplings`);
}

function createPipeline(pipeline) {
  notify.send('pipe create');
  return axios.post('/api/pipelines', {
    name: pipeline,
  });
}

function createPipelineCoupling(pipeline, app, stage) {
  return axios.post('/api/pipeline-couplings', {
    pipeline,
    app,
    stage,
  });
}

// targets must be array with objects with targets[i].app.id
function promotePipeline(pipeline, source, targets, safe) {
  return axios.post('/api/pipeline-promotions', {
    pipeline: {
      id: pipeline,
    },
    source: {
      app: {
        id: source,
      },
    },
    targets,
    safe,
  });
}

function deletePipelineCoupling(coupling) {
  return axios.delete(`/api/pipeline-couplings/${coupling}`);
}

function deletePipeline(pipeline) {
  notify.send('pipe delete');
  return axios.delete(`/api/pipelines/${pipeline}`);
}

function getUser() {
  return axios.get('/api/account');
}

function getAccount() {
  return axios.get('/api/account');
}

function getLogSession(app) {
  return axios.post(`/api/apps/${app}/log-sessions`, { lines: 10, tail: true });
}
function getLogPlex(url, cb) {
  return axios({
    method: 'post',
    url: '/log-plex',
    responseType: 'stream',
    data: { url },
    onDownloadProgress(e) {
      cb(null, e.currentTarget.responseText);
    },
  });
}

function getInvoices(past12, token) {
  return new Promise((resolve, reject) => {
    axios.get('/api/account/invoices', { cancelToken: token }).then((response) => {
      if (past12) {
        response.data = response.data.slice(-12);
      }
      Promise.all(response.data.map(x => axios.get(`/api${x['$ref']}`, { cancelToken: token }))).then((res) => { // eslint-disable-line dot-notation
        resolve(res.map(x => x.data));
      }).catch((e) => { reject(e); });
    }).catch((e) => { reject(e); });
  });
}

function getInvoice(invoice) {
  return axios.get(`/api/account/invoices/${invoice}`);
}

function getSites() {
  return axios.get('/api/sites');
}

function getSite(site) {
  return axios.get(`/api/sites/${site}`);
}

function deleteSite(site) {
  notify.send('site delete');
  return axios.delete(`/api/sites/${site}`);
}

function createSite(domain, region, isInternal) {
  notify.send('site create');
  return axios.post('/api/sites', {
    domain,
    region,
    internal: isInternal,
  });
}

function getRoutes(site) {
  return axios.get(`/api/sites/${site}/routes`);
}

function getStacks() {
  return axios.get('/api/stacks');
}

function getRegions() {
  return axios.get('/api/regions');
}

function deleteRoute(route) {
  return axios.delete(`/api/routes/${route}`);
}

function createRoute(site, app, source, target) {
  return axios.post('/api/routes', {
    site,
    source_path: source,
    target_path: target,
    app,
  });
}

function getFavorites() {
  return axios.get('/api/favorites');
}

function deleteFavorite(favorite) {
  return axios.delete(`/api/favorites/${favorite}`);
}

function createFavorite(app) {
  return axios.post('/api/favorites', {
    app,
  });
}

function getHealthcheck(uri) {
  return axios.get(`/healthcheck?uri=${encodeURIComponent(uri)}`);
}

function getGAToken() {
  return axios.get('/analytics');
}

export default {
  getGAToken,
  appSetup,
  getAppSetup,
  getApps,
  getSpaces,
  getApp,
  getInvoices,
  getInvoice,
  getUser,
  getFormations,
  patchFormation,
  getFormationSizes,
  getDynos,
  getAppAddons,
  getAppWebhooks,
  patchWebhook,
  deleteAddon,
  deleteWebhook,
  getBuilds,
  getConfig,
  getLogs,
  getMetrics,
  getBuildResult,
  getReleases,
  getOrgs,
  createOrg,
  createApp,
  deleteApp,
  createSpace,
  getAddonServices,
  getAddonServicePlans,
  createAddon,
  attachAddon,
  getAddonAttachments,
  deleteAddonAttachment,
  createFormation,
  deleteFormation,
  createBuild,
  createRelease,
  patchConfig,
  createAutoBuild,
  getAutoBuild,
  deleteAutoBuild,
  redoBuild,
  patchApp,
  restartFormation,
  getPipelines,
  getPipelineCouplings,
  getPipeline,
  createPipeline,
  deletePipeline,
  createPipelineCoupling,
  deletePipelineCoupling,
  promotePipeline,
  getLogSession,
  getLogPlex,
  getSites,
  getSite,
  getRoutes,
  deleteSite,
  deleteRoute,
  createSite,
  createRoute,
  getStacks,
  getRegions,
  getAudits,
  createWebHook,
  getWebhookResults,
  getAppsAttachedToAddon,
  getAddon,
  getAccount,
  getFavorites,
  deleteFavorite,
  createFavorite,
  getHealthcheck,
  notify,
};
