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

/**
 * Returns an Axios CancelToken source for cancelling one or more Axios requests.
 */
function getCancelSource() {
  return axios.CancelToken.source();
}

/**
 * Returns whether or not error indicates a cancelled Axios request
 * @param {*} error The error object to check
 */
function isCancel(error) {
  return axios.isCancel(error);
}

// Note: for all functions below, this.cancelToken will be undefined (and ignored)
// unless the function is bound to an object that has this.cancelToken set
// before it is invoked.

function getApps(paramstring) {
  return axios.get(paramstring ? `/api/apps${paramstring}` : '/api/apps', { cancelToken: this.cancelToken });
}

function getApp(app) {
  return axios.get(`/api/apps/${app}`, { cancelToken: this.cancelToken });
}

function deleteApp(app) {
  notify.send('app delete');
  return axios.delete(`/api/apps/${app}`, { cancelToken: this.cancelToken });
}

function createApp(name, org, space, description) {
  notify.send('app create');
  return axios.post('/api/apps', { org, name, space, description }, { cancelToken: this.cancelToken });
}

function appSetup(blueprint) {
  return axios.post('/api/app-setups', blueprint, { cancelToken: this.cancelToken });
}

function getAppSetup(id) {
  return axios.get(`/api/app-setups/${id}`, { cancelToken: this.cancelToken });
}

function patchApp(app, isMaintenance) {
  return axios.patch(`/api/apps/${app}`, {
    maintenance: isMaintenance,
  }, { cancelToken: this.cancelToken });
}

function patchAppDescription(app, description) {
  return axios.patch(`/api/apps/${app}`, {
    description: !description || description === '' ? '' : description,
  }, { cancelToken: this.cancelToken });
}

function getAudits(app, space, size, user) {
  return axios.get(
    `/api/audits?app=${app}&space=${space}${user ? `&user=${user}` : ''}${size ? `&size=${size}` : ''}`,
    { cancelToken: this.cancelToken },
  );
}

function getFormations(app) {
  return axios.get(`/api/apps/${app}/formation`, { cancelToken: this.cancelToken });
}

function createFormation(app, size, quantity, type, port, command) {
  return axios.post(`/api/apps/${app}/formation`, {
    size,
    quantity,
    type,
    port,
    command,
  }, { cancelToken: this.cancelToken });
}

function createWebHook(app, url, events, secret) {
  return axios.post(`/api/apps/${app}/hooks`, {
    url,
    events,
    active: true,
    secret,
  }, { cancelToken: this.cancelToken });
}

function deleteFormation(app, formation) {
  return axios.delete(`/api/apps/${app}/formation/${formation}`, { cancelToken: this.cancelToken });
}

function patchFormation(
  app,
  type,
  size,
  quantity,
  command,
  port,
  healthcheck,
  removeHealthcheck,
  removeCommand) {
  return axios.patch(`/api/apps/${app}/formation`, [{
    type,
    size,
    quantity,
    command,
    port,
    healthcheck,
    removeHealthcheck,
    'remove-command': removeCommand,
  }], { cancelToken: this.cancelToken });
}

function patchWebhook(app, id, url, events, secret, active) {
  return axios.patch(`/api/apps/${app}/hooks/${id}`, {
    url,
    events,
    secret,
    active,
  }, { cancelToken: this.cancelToken });
}
function getWebhookResults(app, id) {
  return axios.get(`/api/apps/${app}/hooks/${id}/results`, { cancelToken: this.cancelToken });
}

function restartFormation(app, type) {
  return axios.delete(`/api/apps/${app}/dynos/${type}`, { cancelToken: this.cancelToken });
}

function getFormationSizes() {
  return axios.get('/api/sizes', { cancelToken: this.cancelToken });
}

function getDynos(app) {
  return axios.get(`/api/apps/${app}/dynos`, { cancelToken: this.cancelToken });
}

function getSpaces() {
  return axios.get('/api/spaces', { cancelToken: this.cancelToken });
}

function createSpace(space, description, compliance, stack) {
  return axios.post('/api/spaces', {
    name: space,
    description,
    compliance,
    stack,
  }, { cancelToken: this.cancelToken });
}

function getAppAddons(app) {
  return axios.get(`/api/apps/${app}/addons`, { cancelToken: this.cancelToken });
}

function getAppsAttachedToAddon(app, addon) {
  return axios.get(`/api/apps/${app}/addons/${addon}`, { cancelToken: this.cancelToken });
}

function getAppWebhooks(app) {
  return axios.get(`/api/apps/${app}/hooks`, { cancelToken: this.cancelToken });
}

function getAddon(app, addon) {
  return axios.get(`/api/apps/${app}/addons/${addon}`, { cancelToken: this.cancelToken });
}

function getAddonServices() {
  return axios.get('/api/addon-services', { cancelToken: this.cancelToken });
}

function getAddonServicePlans(addon) {
  return axios.get(`/api/addon-services/${addon}/plans`, { cancelToken: this.cancelToken });
}

function createAddon(app, plan) {
  return axios.post(`/api/apps/${app}/addons`, { plan }, { cancelToken: this.cancelToken });
}

function attachAddon(app, addon) {
  return axios.post(`/api/apps/${app}/addon-attachments`, {
    app,
    addon,
  }, { cancelToken: this.cancelToken });
}

function getAddonAttachments(app) {
  return axios.get(`/api/apps/${app}/addon-attachments`, { cancelToken: this.cancelToken });
}

function deleteAddonAttachment(app, attachment) {
  return axios.delete(`/api/apps/${app}/addon-attachments/${attachment}`, { cancelToken: this.cancelToken });
}

function deleteAddon(app, addon) {
  return axios.delete(`/api/apps/${app}/addons/${addon}`, { cancelToken: this.cancelToken });
}

function deleteWebhook(app, webhookId) {
  return axios.delete(`/api/apps/${app}/hooks/${webhookId}`, { cancelToken: this.cancelToken });
}

function getBuilds(app) {
  return axios.get(`/api/apps/${app}/builds`, { cancelToken: this.cancelToken });
}

function getBuildResult(app, build) {
  return axios.get(`/api/apps/${app}/builds/${build}/result`, { cancelToken: this.cancelToken });
}

function createBuild(app, org, checksum, url, repo, sha, branch, version) {
  return axios.post(`/api/apps/${app}/builds`, {
    checksum,
    url,
    repo,
    sha,
    branch,
    version,
  }, { cancelToken: this.cancelToken });
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
  }, { cancelToken: this.cancelToken });
}

function getAutoBuild(app) {
  return axios.get(`/api/apps/${app}/builds/auto/github`, { cancelToken: this.cancelToken });
}

function deleteAutoBuild(app) {
  return axios.delete(`/api/apps/${app}/builds/auto/github`, { cancelToken: this.cancelToken });
}

function redoBuild(app, build) {
  return axios.put(`/api/apps/${app}/builds/${build}`, { cancelToken: this.cancelToken });
}

async function getReleases(app) {
  return axios.get(`/api/apps/${app}/releases`, { cancelToken: this.cancelToken });
}

async function getSlug(slug) {
  return axios.get(`/api/slugs/${slug}`, { cancelToken: this.cancelToken });
}

async function getRelease(app, release) {
  return axios.get(`/api/apps/${app}/releases/${release}`, { cancelToken: this.cancelToken });
}

async function getReleaseStatuses(app, release) {
  return axios.get(`/api/apps/${app}/releases/${release}/statuses`, { cancelToken: this.cancelToken });
}

function createRelease(app, slug, release, description) {
  return axios.post(`/api/apps/${app}/releases`, {
    slug,
    release,
    description,
  }, { cancelToken: this.cancelToken });
}

async function rebuild(app, release) {
  return axios.put(`/api/apps/${app}/builds/${release.slug.id}`, { cancelToken: this.cancelToken });
}

function getOrgs() {
  return axios.get('/api/organizations', { cancelToken: this.cancelToken });
}

function createOrg(org, description) {
  return axios.post('/api/organizations', {
    name: org,
    description,
  }, { cancelToken: this.cancelToken });
}

function getConfig(app) {
  return axios.get(`/api/apps/${app}/config-vars`, { cancelToken: this.cancelToken });
}

function getConfigNotes(app) {
  return axios.get(`/api/apps/${app}/config-vars/notes`, { cancelToken: this.cancelToken });
}

function patchConfig(app, values) {
  return axios.patch(`/api/apps/${app}/config-vars`, values, { cancelToken: this.cancelToken });
}

function patchConfigNotes(app, values) {
  return axios.patch(`/api/apps/${app}/config-vars/notes`, values, { cancelToken: this.cancelToken });
}

function getLogs(app) {
  return axios.post(`/api/apps/${app}/log-sessions`, {
    lines: 10,
    tail: true,
  }, { cancelToken: this.cancelToken }); // then follow log session route
}

function getMetrics(app) {
  return axios.get(`/api/apps/${app}/metrics?resolution=10m`, { cancelToken: this.cancelToken });
}

function getPipelines() {
  return axios.get('/api/pipelines', { cancelToken: this.cancelToken });
}

function getPipelineStages() {
  return axios.get('/api/pipeline-stages', { cancelToken: this.cancelToken });
}

function getPipeline(pipeline) {
  return axios.get(`/api/pipelines/${pipeline}`, { cancelToken: this.cancelToken });
}

function getPipelineCouplings(pipeline) {
  return axios.get(`/api/pipelines/${pipeline}/pipeline-couplings`, { cancelToken: this.cancelToken });
}

function getAvailablePipelineStatuses(pipeline) {
  return axios.get(`/api/pipelines/${pipeline}/statuses`, { cancelToken: this.cancelToken });
}

function createPipeline(pipeline) {
  notify.send('pipe create');
  return axios.post('/api/pipelines', {
    name: pipeline,
  }, { cancelToken: this.cancelToken });
}

function createPipelineCoupling(pipeline, app, stage, statuses) {
  return axios.post('/api/pipeline-couplings', {
    pipeline,
    app,
    stage,
    required_status_checks: {
      contexts: statuses,
    },
  }, { cancelToken: this.cancelToken });
}

function updatePipelineCoupling(pipeline, coupling, statuses) {
  return axios.patch(`/api/pipeline-couplings/${coupling}`, {
    required_status_checks: {
      contexts: statuses,
    },
  }, { cancelToken: this.cancelToken });
}

// targets must be array with objects with targets[i].app.id
function promotePipeline(pipeline, source, targets, safe, release) {
  return axios.post('/api/pipeline-promotions', {
    pipeline: {
      id: pipeline,
    },
    source: {
      app: {
        id: source,
        release: {
          id: release,
        },
      },
    },
    targets,
    safe,
  }, { cancelToken: this.cancelToken });
}

function deletePipelineCoupling(coupling) {
  return axios.delete(`/api/pipeline-couplings/${coupling}`, { cancelToken: this.cancelToken });
}

function deletePipeline(pipeline) {
  notify.send('pipe delete');
  return axios.delete(`/api/pipelines/${pipeline}`, { cancelToken: this.cancelToken });
}

function getUser() {
  return axios.get('/api/account', { cancelToken: this.cancelToken });
}

function getAccount() {
  return axios.get('/api/account', { cancelToken: this.cancelToken });
}

function getLogSession(app) {
  return axios.post(
    `/api/apps/${app}/log-sessions`,
    { lines: 10, tail: true },
    { cancelToken: this.cancelToken },
  );
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
    cancelToken: this.cancelToken,
  });
}

function getInvoices(past12) {
  return new Promise((resolve, reject) => {
    axios.get('/api/account/invoices', { cancelToken: this.cancelToken }).then((response) => {
      if (past12) {
        response.data = response.data.slice(-12);
      }
      Promise.all(response.data.map(x => axios.get(
        `/api${x['$ref']}`, // eslint-disable-line dot-notation
        { cancelToken: this.cancelToken },
      )))
        .then(res => resolve(res.map(x => x.data)))
        .catch(e => reject(e));
    }).catch(e => reject(e));
  });
}

function getInvoice(invoice) {
  return axios.get(`/api/account/invoices/${invoice}`, { cancelToken: this.cancelToken });
}

function getSites() {
  return axios.get('/api/sites', { cancelToken: this.cancelToken });
}

function getSite(site) {
  return axios.get(`/api/sites/${site}`, { cancelToken: this.cancelToken });
}

function deleteSite(site) {
  notify.send('site delete');
  return axios.delete(`/api/sites/${site}`, { cancelToken: this.cancelToken });
}

function createSite(domain, region, isInternal) {
  notify.send('site create');
  return axios.post('/api/sites', {
    domain,
    region,
    internal: isInternal,
  }, { cancelToken: this.cancelToken });
}

function getRoutes(site) {
  return axios.get(`/api/sites/${site}/routes`, { cancelToken: this.cancelToken });
}

function getStacks() {
  return axios.get('/api/stacks', { cancelToken: this.cancelToken });
}

function getRegions() {
  return axios.get('/api/regions', { cancelToken: this.cancelToken });
}

function deleteRoute(route) {
  return axios.delete(`/api/routes/${route}`, { cancelToken: this.cancelToken });
}

function createRoute(site, app, source, target) {
  return axios.post('/api/routes', {
    site,
    source_path: source,
    target_path: target,
    app,
  }, { cancelToken: this.cancelToken });
}

function getFavorites() {
  return axios.get('/api/favorites', { cancelToken: this.cancelToken });
}

function deleteFavorite(favorite) {
  return axios.delete(`/api/favorites/${favorite}`, { cancelToken: this.cancelToken });
}

function createFavorite(app) {
  return axios.post('/api/favorites', { app }, { cancelToken: this.cancelToken });
}

function getHealthcheck(uri) {
  return axios.get(`/healthcheck?uri=${encodeURIComponent(uri)}`, { cancelToken: this.cancelToken });
}

function getGAToken() {
  return axios.get('/analytics', { cancelToken: this.cancelToken });
}

function getAvailableHooks() {
  return axios.get('/api/docs/hooks', { cancelToken: this.cancelToken });
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
  getConfigNotes,
  patchConfigNotes,
  getLogs,
  getMetrics,
  getBuildResult,
  getReleases,
  getRelease,
  getReleaseStatuses,
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
  getPipelineStages,
  getPipelineCouplings,
  getPipeline,
  createPipeline,
  getAvailablePipelineStatuses,
  deletePipeline,
  createPipelineCoupling,
  updatePipelineCoupling,
  deletePipelineCoupling,
  promotePipeline,
  getLogSession,
  getLogPlex,
  getSites,
  getSite,
  getSlug,
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
  rebuild,
  patchAppDescription,
  getCancelSource,
  isCancel,
  getAvailableHooks,
};
