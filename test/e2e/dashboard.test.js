import { Selector } from 'testcafe';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

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
    .expect(Selector('.favorites-list tbody').childElementCount)
    .eql(0)
    .click('.recents-tab')
    .expect(Selector('.recents-list tbody').childElementCount)
    .eql(0);
});

fixture('Favorites Tab') // eslint-disable-line no-undef
  .page(`${baseUrl}/dashboard`)
  .beforeEach(async (t) => {
    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

      // navigate to new app page
      .navigateTo(`${baseUrl}/apps`)
      .click('.new-app')

      // create app
      .typeText('.app-name input', 'testcafe')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .ok()
      .navigateTo(`${baseUrl}/dashboard`);
  })
  .afterEach(async (t) => {
    await t
      .navigateTo(`${baseUrl}/apps/testcafe-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('button.delete')

    // confirm delete and make sure app no longer exists
      .click('.delete-confirm button.ok')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .notOk();
  });

test('Should allow favorite of app and addition or removal to dashboard', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.favorites-list tbody').childElementCount)
    .eql(0)

    .navigateTo(`${baseUrl}/apps/testcafe-testcafe`)
    .click('button.favorite-app')
    
    .navigateTo(`${baseUrl}/dashboard`)
    .expect(Selector('.favorites-list tbody').childElementCount)
    .gt(0)

    .expect(Selector('.favorites-list .testcafe-testcafe').innerText)
    .contains('testcafe-testcafe')

    .click('.favorites-list .testcafe-testcafe')
    .click('button.favorite-app')
    
    .navigateTo(`${baseUrl}/dashboard`)
    .expect(Selector('.favorites-list tbody').childElementCount)
    .eql(0);
});

fixture('Recents Tab') // eslint-disable-line no-undef
  .page(`${baseUrl}/dashboard`)
  .beforeEach(async (t) => {
    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

      // navigate to new app page
      .navigateTo(`${baseUrl}/apps`)
      .click('.new-app')

      // create app
      .typeText('.app-name input', 'testcafe')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .ok()
      .navigateTo(`${baseUrl}/dashboard`)
      .click('.recents-tab');
  })
  .afterEach(async (t) => {
    await t
      .navigateTo(`${baseUrl}/apps/testcafe-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('button.delete')

    // confirm delete and make sure app no longer exists
      .click('.delete-confirm button.ok')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .notOk();
  });

test('Should allow view of recent activity and quick access to those items', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.recents-list tbody').childElementCount)
    .eql(0)

    .navigateTo(`${baseUrl}/apps/testcafe-testcafe`)
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

    .expect(Selector('.recents-list .testcafe-testcafe').innerText)
    .contains('testcafe-testcafe')

    .click('.recents-list .testcafe-testcafe')
    .click('.info-tab')
    .click('.dynos-tab')
    .click('.releases-tab')
    .click('.addons-tab')
    .click('.webhooks-tab')
    .click('.config-tab')
    .click('.metrics-tab')
    .click('.logs-tab');
});