import { Selector } from 'testcafe';

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
      size: 'scout',
      command: null,
      port: 5000,
    },
  },
  addons: {},
  source_blob: {
    checksum: 'sha256:93f16649a03d37aef081dfec3c2fecfa41bb22dd45de2b79f32dcda83bd69bcf',
    url: 'docker://docker.io/akkeris/test-lifecycle:latest',
    version: 'v1.0',
  },
  'pipeline-couplings': [],
};

const url = `${baseUrl}/app-setups?blueprint=${encodeURIComponent(JSON.stringify(blueprint))}`;

fixture('App Setups Page') // eslint-disable-line no-undef
  .page(`${baseUrl}`)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login');
  })
  .afterEach(async (t) => {
    await t
      .navigateTo(`${baseUrl}/#/apps/akkeristest1-testcafe`)
      .expect(Selector('.delete').exists)
      .ok()
      .click('.delete')
      .expect(Selector('.delete-confirm').exists)
      .ok()
      .click('.delete-confirm .ok');
  });

test('ensure the app setup works', async (t) => { // eslint-disable-line no-undef
  await t
    .navigateTo(url)
    .expect(Selector('.name_logo').exists)
    .ok()
    .expect(Selector('.name_subheader').innerText)
    .contains('foo1')
    .expect(Selector('.name_subheadertext').innerText)
    .contains('foo2')

    .click('.application_name')
    .typeText('.application_name', 'akkeristest1')
    .click('div.space-field')
    .click('.testcafe-space')
    .click('.create')

    .expect(Selector('.config-environment').exists)
    .ok()
    .wait(65000)

    .expect(Selector('.config_app').exists)
    .ok();
});

