import { Selector } from 'testcafe';

const utils = require('../utils');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

if (!global.createdApps) {
  global.createdApps = [];
}

fixture('Dashboard Page') // eslint-disable-line no-undef
  .page(`${baseUrl}/dashboard`)
  .beforeEach(async (t) => {
    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login');
  });

test('Should show tabs', async (t) => { // eslint-disable-line no-undef
  await t
    .click('.favorites-tab')
    .expect(Selector('.favorites-list tbody').exists)
    .ok()
    .click('.recents-tab')
    .expect(Selector('.recents-list tbody').exists)
    .ok();
});

fixture('Favorites Tab') // eslint-disable-line no-undef
  .page(`${baseUrl}/dashboard`)
  .beforeEach(async (t) => {
    const appName = utils.randomString();
    t.ctx.appName = appName; // eslint-disable-line no-param-reassign
    global.createdApps.push(appName);
    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

      // navigate to new app page
      .navigateTo(`${baseUrl}/apps`)
      .click('.new-app')

      // create app
      .typeText('.app-name input', appName)
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .click('button.next')
      .navigateTo(`${baseUrl}/apps`)
      .click('button.addFilter')
      .typeText(Selector('.filter-select-input input'), 'testcafe')
      .click('.filter-select-results .testcafe')
      .expect(Selector(`.app-list .${appName}-testcafe`).exists)
      .ok()
      .navigateTo(`${baseUrl}/dashboard`);
  })
  .afterEach(async (t) => {
    const appName = t.ctx.appName;
    await t
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('button.app-menu-button')
      .click('.delete-app')

    // confirm delete and make sure app no longer exists
      .click('.delete-confirm button.ok')
      .expect(Selector(`.app-list .${appName}-testcafe`).exists)
      .notOk();
  });

test('Should allow favorite of app and addition or removal to dashboard', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  await t
    .expect(Selector('.favorites-list tbody').childElementCount)
    .gt(0)
    .expect(Selector(`.favorites-list .${appName}-testcafe`).innerText)
    .contains(`${appName}-testcafe`, 'App was not automatically added as favorite on creation')

    .click(`.favorites-list .${appName}-testcafe`)
    .click('button.favorite-app')

    .navigateTo(`${baseUrl}/dashboard`)
    .expect(Selector(`.favorites-list .${appName}-testcafe`).exists)
    .notOk('App was not successfully removed as a favorite');
});

fixture('Recents Tab') // eslint-disable-line no-undef
  .page(`${baseUrl}/dashboard`)
  .beforeEach(async (t) => {
    const appName = utils.randomString();
    t.ctx.appName = appName; // eslint-disable-line no-param-reassign
    global.createdApps.push(appName);
    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

      // navigate to new app page
      .navigateTo(`${baseUrl}/apps`)
      .click('.new-app')

      // create app
      .typeText('.app-name input', appName)
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .click('button.next')
      .navigateTo(`${baseUrl}/apps`)
      .click('button.addFilter')
      .typeText(Selector('.filter-select-input input'), 'testcafe')
      .click('.filter-select-results .testcafe')
      .expect(Selector(`.app-list .${appName}-testcafe`).exists)
      .ok()
      .navigateTo(`${baseUrl}/dashboard`)
      .click('.recents-tab');
  })
  .afterEach(async (t) => {
    const appName = t.ctx.appName;
    await t
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('button.app-menu-button')
      .click('.delete-app')

    // confirm delete and make sure app no longer exists
      .click('.delete-confirm button.ok')
      .expect(Selector(`.app-list .${appName}-testcafe`).exists)
      .notOk();
  });

test('Should allow view of recent activity and quick access to those items', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  await t
    .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
    .click('.info-tab')
    .click('.dynos-tab')
    .click('.releases-tab')
    .click('.addons-tab')
    .click('.webhooks-tab')
    .click('.config-tab')
    .click('.metrics-tab')
    .click('.logs-tab')

    .navigateTo(`${baseUrl}/dashboard`)
    .click('.recents-tab')
    .expect(Selector('.recents-list tbody').childElementCount)
    .gt(0)

    .expect(Selector(`.recents-list .${appName}-testcafe`).innerText)
    .contains(`${appName}-testcafe`)

    .click(`.recents-list .${appName}-testcafe`)
    .click('.info-tab')
    .click('.dynos-tab')
    .click('.releases-tab')
    .click('.addons-tab')
    .click('.webhooks-tab')
    .click('.config-tab')
    .click('.metrics-tab')
    .click('.logs-tab');
});
