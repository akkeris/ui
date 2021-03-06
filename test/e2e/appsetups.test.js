import { Selector } from 'testcafe';

const utils = require('../utils');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;
const blueprint = {
  name: 'foo1',
  description: 'foo2',
  success_url: '/hello',
  logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
  app: {
    locked: false,
    name: 'appname',
    organization: 'akkeris',
    region: 'us-seattle',
    personal: false,
    space: 'default',
    stack: 'ds1',
  },
  env: {
    FEEBAR: {
      description: '',
      required: true,
      value: 'FOOBAR',
    },
    FUGAZI: {
      description: '',
      required: false,
      value: 'FUGAZI!!!',
    },
  },
  formation: {
    web: {
      quantity: 1,
      size: 'gp1',
      command: null,
      port: 5000,
    },
  },
  addons: {},
  source_blob: {
    url: 'docker://docker.io/nginx:alpine',
    version: 'v1.0',
  },
  'pipeline-couplings': [],
};

if (!global.createdApps) {
  global.createdApps = [];
}

const url = `${baseUrl}/app-setups?blueprint=${encodeURIComponent(JSON.stringify(blueprint))}`;

fixture('App Setups Page') // eslint-disable-line no-undef
  .page(`${baseUrl}`)
  .beforeEach(async (t) => {
    const appName = utils.randomString();
    t.ctx.appName = appName; // eslint-disable-line no-param-reassign
    global.createdApps.push(appName);

    await t
      .expect(Selector('button.login').innerText).eql('Login')
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login');
  })
  .afterEach(async (t) => {
    const appName = t.ctx.appName;
    await t
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .wait(10000)
      .click('button.app-menu-button')
      .expect(Selector('.delete-app').exists)
      .ok()
      .click('.delete-app')
      .expect(Selector('.delete-confirm').exists)
      .ok()
      .click('.delete-confirm .ok');
  });

test('ensure the app setup works', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  await t
    .navigateTo(url)
    .expect(Selector('.name_logo').exists)
    .ok()
    .expect(Selector('.name_subheader').innerText)
    .contains('foo1')
    .expect(Selector('.name_subheadertext').innerText)
    .contains('foo2')

    .click('.application_name')
    .typeText('.application_name', appName)
    .click('div.space-field')
    .click('.testcafe-space')
    .click('.create')

    .expect(Selector('.config-environment').exists)
    .ok()

    .expect(Selector('.config_app').exists)
    .ok('Error waiting for app to be configured', { timeout: 30000 });
});

