import { Selector } from 'testcafe';

const utils = require('../utils');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

if (!global.createdApps) {
  global.createdApps = [];
}

fixture('Apps Page') // eslint-disable-line no-undef
  .page(`${baseUrl}/apps`)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')
      .navigateTo(`${baseUrl}/apps`);
  });

test('Should be able to create and delete an app', async (t) => { // eslint-disable-line no-undef
  const appName = utils.randomString();
  global.createdApps.push(appName);

  await t
    // navigate to new app page
    .click('.new-app')
    .click('button.next')
    .expect(Selector('.app-name').innerText)
    .contains('App required')

    // create app
    .typeText('.app-name input', appName)
    .click('button.next')

  // Check step 1 caption
    .expect(Selector('.step-0-label .step-label-caption').innerText)
    .contains(appName)

    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')

  // Check step 2 caption
    .expect(Selector('.step-1-label .step-label-caption').innerText)
    .contains('testcafe')

    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')

  // Description will be tested later
    .click('button.next')

  // Check step 3 caption, stepper summary
    .expect(Selector('.step-2-label .step-label-caption').innerText)
    .contains('testcafe')
    .expect(Selector('.new-app-summary').innerText)
    .contains(`The app ${appName}-testcafe will be created in the testcafe org.`)
    .click('button.next')

  // Verify that app exists
    .navigateTo(`${baseUrl}/apps`)
    .click('button.addFilter')
    .typeText(Selector('.filter-select-input input'), 'testcafe')
    .click('.filter-select-results .testcafe')
    .expect(Selector(`.app-list .${appName}-testcafe`).exists)
    .ok()

    // navigate to new app page
    .click('.new-app')
    .click('button.next')
    .expect(Selector('.app-name').innerText)
    .contains('App required')

    // test duplicate
    .typeText('.app-name input', appName)
    .click('button.next')
    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')
    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')
    .click('button.next')
    .click('button.next')
    .expect(Selector('.new-app-error').innerText)
    .contains('The requested application already exists.')
    .click('.ok')
    .navigateTo(`${baseUrl}/apps`)
    .click('button.addFilter')
    .click('.filter-select-clear')

    // check if app was created
    .typeText(Selector('.filter-select-input input'), 'testcafe')
    .click('.filter-select-results .testcafe')
    .click(`.app-list .${appName}-testcafe`)
    .expect(Selector('.card .header').innerText)
    .contains(`${appName}-testcafe`)

  // delete the app
    .click('button.app-menu-button')
    .click('.delete-app')
    .expect(Selector('.delete-confirm').innerText)
    .contains('Are you sure you want to delete this app?')

  // confirm delete and make sure app no longer exists
    .click('.delete-confirm .ok')
    .expect(Selector(`.app-list .${appName}-testcafe`).exists)
    .notOk();
});

test // eslint-disable-line
  .before(async (t) => {
    const appName = utils.randomString();
    t.ctx.appName = appName; // eslint-disable-line no-param-reassign
    global.createdApps.push(appName);
    await utils.createApp(appName);
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')
      .navigateTo(`${baseUrl}/apps`);
  })('Should show list of apps based on filter', async (t) => { // eslint-disable-line no-undef
    const appName = t.ctx.appName;

    await t
      .expect(Selector('.app-list .MuiTableBody-root').childElementCount)
      .gt(0)

      .click('button.addFilter')
      .click('.filter-select-input')
      .expect(Selector('.filter-select-results .us-seattle').exists)
      .ok()
      .click('.filter-select-results .us-seattle')

      .click('.filter-select-input')
      .typeText(Selector('.filter-select-input input'), 'testcafe')
      .expect(Selector('.filter-select-results .testcafe').exists)
      .ok()
      .click('.filter-select-results .testcafe')

      .expect(Selector(`.app-list .${appName}-testcafe`).innerText)
      .contains(`${appName}-testcafe`);
  })
  .after(async (t) => {
    const appName = t.ctx.appName;
    await utils.deleteApp(`${appName}-testcafe`);
  });

test('Should throw error on non-existent app', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', '____')
    .wait(2000)
    .expect(Selector('.global-search-results').innerText)
    .contains('No results', 'Search results found when none expected')
    .navigateTo(`${baseUrl}/apps/merp/info`)
    .expect(Selector('.not-found-error').innerText)
    .contains('The specified application merp does not exist');
});

test('Should show apps as first group in global search', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', 't')
    .wait(2000)
    .expect(Selector('.global-search-results .group-heading').nth(0).innerText)
    .contains('Apps', 'List of apps not first in search results');
});

test('Should be able to create and edit app description', async (t) => { // eslint-disable-line no-undef
  const appName = utils.randomString();
  global.createdApps.push(appName);
  t.ctx.appName = appName; // eslint-disable-line no-param-reassign

  await t
    // Get to description creation
    .click('.new-app')
    .typeText('.app-name input', appName)
    .click('button.next')
    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')
    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')

    // Description should be optional
    .click('button.next')
    .expect(Selector('.new-app-summary').innerText)
    .contains(`The app ${appName}-testcafe will be created in the testcafe org.`, 'Summary did not show which indicates description was required')
    .click('button.back-button')

    // Test simple description
    .typeText('.app-description input', 'My Description')
    .click('button.next')
    .expect(Selector('.new-app-summary').innerText)
    .contains(`The app ${appName}-testcafe will be created in the testcafe org with the description "My Description".`, 'Summary did not match expected for description')
    .expect(Selector('.step-3-label .step-label-caption').innerText)
    .contains('My Description', 'Stepper caption for description did not match expected value')

    // Test description longer than 20 characters
    .click('button.back-button')
    .typeText('.app-description input', 'My slightly longer description', { replace: true })
    .click('button.next')
    .expect(Selector('.new-app-summary').innerText)
    .contains(`The app ${appName}-testcafe will be created in the testcafe org with the description "My slightly longer description".`, 'Summary did not match expected for longer description')
    .expect(Selector('.step-3-label .step-label-caption').innerText)
    .contains('My slightly longer d...', 'Stepper caption for longer description did not match expected value')

    // Create app, wait for the app page to load
    .click('button.next')
    .wait(2000)

    // Make sure the description is there
    .expect(Selector('.card .app-description').innerText)
    .contains('My slightly longer description', 'App description did not match expected value')

    // Make sure we can edit the description
    .click('button.app-menu-button')
    .click('.edit-description')

    .expect(Selector('.edit-description-dialog').exists)
    .ok('Edit description dialog did not appear')

    .expect(Selector('.edit-description-dialog #edit-description-textfield').withAttribute('value', 'My slightly longer description').exists)
    .ok('Edit description dialog did not contain current description')

    // Test cancelling edits
    .typeText('.edit-description-dialog #edit-description-textfield', 'I started to type a descri', { replace: true })
    .click('button.cancel')
    .click('button.app-menu-button')
    .click('.edit-description')
    .expect(Selector('.edit-description-dialog #edit-description-textfield').withAttribute('value', 'My slightly longer description').exists)
    .ok('Edit description dialog did not contain current description after cancelling dialog')

    .typeText('.edit-description-dialog #edit-description-textfield', 'My new description', { replace: true })
    .click('button.save')

    // Check for popup
    .expect(Selector('.app-snack').innerText)
    .contains('Description updated!', 'Description updated snackbar did not appear')

    // Make sure the new description is there
    .expect(Selector('.card .app-description').innerText)
    .contains('My new description', 'Updated app description did not match expected value')
    .click('button.app-menu-button')
    .click('.edit-description')
    .expect(Selector('.edit-description-dialog #edit-description-textfield').withAttribute('value', 'My new description').exists)
    .ok('Edit description dialog did not contain new description after successful edit')

    .click('.edit-description-dialog #edit-description-textfield')
    .selectText('.edit-description-dialog #edit-description-textfield')
    .pressKey('delete')
    .click('button.save')

  // Check for popup
    .expect(Selector('.app-snack').innerText)
    .contains('Description updated!', 'Description updated snackbar did not appear')

  // Make sure the description was deleted
    .expect(Selector('.card .app-description').innerText)
    .contains('No description provided', 'Description still present on AppInfo page after it was removed')
    .click('button.app-menu-button')
    .click('.edit-description')
    .expect(Selector('.edit-description-dialog #edit-description-textfield').withAttribute('value', '').exists)
    .ok('Edit description dialog was not empty after description was removed')

    .click('button.cancel');
}).after(async (t) => {
  const appName = t.ctx.appName;
  try {
    await utils.deleteApp(`${appName}-testcafe`);
  } catch (err) {
    if (err.response.status !== 404) {
      throw new Error(`Error deleting ${appName}: ${err.response.data}`);
    }
  }
});

fixture('AppInfo Page') // eslint-disable-line no-undef
  .page(`${baseUrl}/apps`)
  .beforeEach(async (t) => {
    const appName = utils.randomString();
    t.ctx.appName = appName; // eslint-disable-line no-param-reassign
    global.createdApps.push(appName);
    await utils.createApp(appName);
    // login
    await t
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')
      .navigateTo(`${baseUrl}/apps`);
  })
  .afterEach(async (t) => {
    const appName = t.ctx.appName;
    await utils.deleteApp(`${appName}-testcafe`);
  });

test('Should follow search to app and see all info', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  await t
    .typeText('.global-search input', `${appName}-testcafe`)
    .wait(2000).pressKey('enter')
    .expect(Selector('.card .header').innerText)
    .contains(`${appName}-testcafe`)
    .click('.info-tab')
    .click('.dynos-tab')
    .click('.releases-tab')
    .click('.addons-tab')
    .click('.webhooks-tab')
    .click('.config-tab')
    .click('.metrics-tab')
    .click('.logs-tab');
});

test('Should be able to toggle into maintenance mode', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  await t
    .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)

    // In order to put an app in maintenance mode, you have to have a dyno running something

    // Create dyno
    .click('.dynos-tab')
    .click('button.new-formation')
    .typeText('.new-type input', 'web')
    .click('button.next')
    .click('button.next') // quantity (1)
    .typeText(Selector('.select-textfield'), 'gp1')
    .pressKey('enter')
    .click('button.next')
    .typeText('.new-port input', '8000', { replace: true })
    .click('button.next')
    .click('button.next') // summary
    .expect(Selector('.formation-snack').innerText)
    .contains('New Formation Added')

    // Create a new build
    .click('.releases-tab')
    .click('button.new-build')
    .typeText('.url input', 'docker://registry.hub.docker.com/crccheck/hello-world:latest') // 1.2MB web server test image
    .click('button.next')
    .click('button.next') // branch
    .click('button.next') // version
    .click('button.next') // summary

    .expect(Selector('.release-snack').innerText)
    .contains('New Deployment Requested')
    .expect(Selector('.release-list tbody').childElementCount)
    .gt(0)

    .wait(60000) // Wait 1 minute

    .click('button.app-menu-button')
    .click('.toggle')
    .expect(Selector('.maintenance-confirm').innerText)
    .contains('Are you sure you want to put this app in maintenance?')
    .click('.maintenance-confirm .ok')

    .expect(Selector('.app-snack').innerText)
    .contains('Maintenance Mode Updated');
});

test('Should be able to create edit and delete formations', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  await t
    .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
    .click('.dynos-tab')

    // Check new component shows
    .click('button.new-formation')
    .expect(Selector('.new-type label').innerText)
    .contains('Type')

    // Make sure we can cancel
    .wait(2000)
    .click('button.cancel')
    .wait(2000)
    .expect(Selector('.new-type').exists)
    .notOk()

    // Create the new formation
    .click('button.new-formation')
    .click('button.next')
    .expect(Selector('.new-type').innerText)
    .contains('Field required')
    .typeText('.new-type input', '!')
    .click('button.next')
    .expect(Selector('.new-type').innerText)
    .contains('Alphanumeric characters only')
    .click('.new-type input')
    .pressKey('backspace')
    .typeText('.new-type input', 'web')
    .click('button.next')
    .click('button.back')
    .expect(Selector('.new-type').innerText)
    .notContains('Alphanumeric characters only')
    .expect(Selector('.new-type input').value)
    .contains('web')
    .click('button.next')

    // Check step 1 caption
    .expect(Selector('.step-0-label .step-label-caption').innerText)
    .contains('web')

    .click('div.new-dropdown')
    .click('.q2')
    .click('button.next')

    // Check step 2 caption
    .expect(Selector('.step-1-label .step-label-caption').innerText)
    .contains('2')
    .typeText(Selector('.select-textfield'), 'gp2')
    .pressKey('enter')
    .click('button.next')

    // Check step 3 caption
    .expect(Selector('.step-2-label .step-label-caption').innerText)
    .contains('gp2')
    .click('button.next')

    // Check stepper summary
    .expect(Selector('.new-formation-summary').innerText)
    .contains('[2] web dyno(s) will be created with size gp2, and will use the default port.')
    .click('button.next')

    .expect(Selector('.formation-snack').innerText)
    .contains('New Formation Added')

    // Confirm creation
    .expect(Selector('.formation-list .web').innerText)
    .contains('web')

    // Check duplicate error
    .click('button.new-formation')
    .typeText('.new-type input', 'web')
    .click('button.next')
    .click('button.next')
    .typeText(Selector('.select-textfield'), 'gp1')
    .pressKey('enter')
    .click('button.next')
    .click('button.next')
    .click('button.next')
    .expect(Selector('.new-error').innerText)
    .contains('The process of type web already exists.')
    .click('.new-error button.ok')

    // Check dyno info
    .click('.formation-list .web')
    .expect(Selector('.formation-list .web .web-info').exists)
    .ok()
    .expect(Selector('.formation-list .web .web-dynos').exists)
    .ok()
    .click('.formation-list .web')

    // Check edit
    .click('.formation-list .web')
    .click('.formation-list .web .web-info button.edit')
    .click('.formation-list .web .web-info button.back')

    // Size
    .click('.formation-list .web .web-info button.edit')
    .click('.formation-list .web .web-info .size-select')
    .click('.gp1')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web')
    .expect(Selector('.formation-list .web .web-info .size-select').innerText)
    .contains('gp1')

    // Quantity
    .click('.formation-list .web .web-info button.edit')
    .click('.formation-list .web .web-info .quantity-select')
    .click('.q1')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web')
    .expect(Selector('.formation-list .web .quantity-select').innerText)
    .contains('1')

    // Port
    .click('.formation-list .web .web-info button.edit')
    .typeText('.formation-list .web .web-info .port input', '8080')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web')
    .expect(Selector('.formation-list .web .port input').value)
    .contains('8080')

    // Command
    .click('.formation-list .web .web-info button.edit')
    .typeText('.formation-list .web .web-info .command input', 'npm start')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web')
    .expect(Selector('.formation-list .web .command input').value)
    .contains('npm start')
    .click('.formation-list .web .web-info button.edit')
    .click('.formation-list .web .web-info .command input')
    .pressKey('ctrl+a delete')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web')
    .expect(Selector('.formation-list .web .command input').value)
    .contains('');
});

test('Should be able to create view and release builds', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;

  await t
    .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
    .click('.releases-tab')
    .expect(Selector('.release-list tbody').innerText)
    .contains('No Releases')

    // Check new component shows
    .click('button.new-build')
    .expect(Selector('.url input').exists)
    .ok()

    // Make sure we can cancel
    .click('button.build-cancel')
    .expect(Selector('.url input').exists)
    .notOk()

    // Create the new build
    .click('button.new-build')
    .typeText('.url input', 'docker://registry.hub.docker.com/library/httpd:alpine')
    .click('button.next')
    .click('button.next') // branch
    .click('button.next') // version

    // Check stepper summary
    .expect(Selector('.new-build-summary').innerText)
    .contains('A new build will be created from docker://registry.hub.docker.com/library/httpd:alpine.')
    .click('button.next')

    .expect(Selector('.release-snack').innerText)
    .contains('New Deployment Requested')
    .expect(Selector('.release-list tbody').childElementCount)
    .gt(0)

    .wait(5000)
    .click('.release-list .r0 button.logs')
    .wait(5000)
    .expect(Selector('.logs-dialog .logs-dialog-title').innerText)
    .contains('Logs for')
    .click('.logs-dialog .logs-dialog-close');
});

test('Should be able to rebuild a release', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;

  await t
    .navigateTo(`${baseUrl}/apps/${appName}-testcafe/releases`)
    .click('.releases-tab')
    .expect(Selector('.release-list tbody').innerText)
    .contains('No Releases')

    // Create the new build
    .click('button.new-build')
    .typeText('.url input', 'docker://registry.hub.docker.com/library/alpine:non-existant') // purposely use a nonexistant image to force a rebuild icon.
    .click('button.next')
    .click('button.next') // branch
    .click('button.next') // version
    .click('button.next') // summary

    .expect(Selector('.release-snack').innerText)
    .contains('New Deployment Requested')
    .expect(Selector('.release-list tbody').childElementCount)
    .gt(0)
    .wait(20000);

  await t
    .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
    .click('.releases-tab')
    .expect(Selector('button.rebuild').exists)
    .ok('Rebuild button did not appear')
    .click('button.rebuild')
    .expect(Selector('.rebuild-confirm').exists)
    .ok('Rebuild confirmation did not appear')
    .expect(Selector('.rebuild-confirm').innerText)
    .contains('Are you sure you want to rebuild this', 'Rebuild confirmation did not have the correct message')
    .click('.rebuild-confirm button.ok')
    .expect(Selector('.release-snack').exists)
    .ok('Rebuild message did not appear')
    .expect(Selector('.release-snack').innerText)
    .contains('Rebuilding image...', 'Rebuild message did not have the correct text')
    .wait(5000)
    .click('.release-list .r0 button.logs')
    .wait(5000)
    .expect(Selector('.logs-dialog .logs-dialog-title').innerText)
    .contains('Logs for', 'Did not show logs for the release rebuild')
    .click('.logs-dialog .logs-dialog-close');
});

test // eslint-disable-line no-undef
  .before(async (t) => {
    const appName = utils.randomString();
    const appName2 = utils.randomString();
    t.ctx.appName = appName; // eslint-disable-line no-param-reassign
    t.ctx.appName2 = appName2; // eslint-disable-line no-param-reassign
    global.createdApps.push(appName, appName2);
    await utils.createApp(appName);
    await utils.createApp(appName2);
    // login
    await t
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login');
  })('Should be able to create and remove addons', async (t) => { // eslint-disable-line no-undef
    const appName = t.ctx.appName;
    const appName2 = t.ctx.appName2;

    await t
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .click('.addons-tab')

    // Check new component shows
      .click('button.new-addon')
      .expect(Selector('.select-textfield').exists)
      .ok()

    // Make sure we can cancel
      .click('button.addon-cancel')
      .expect(Selector('.select-textfield').exists)
      .notOk()

    // Test compliance
      .click('button.new-addon')
      .typeText(Selector('.select-textfield'), 'Lids Db Credentials')
      .pressKey('enter')
      .click('button.next')

      // Check step 1 caption
      .expect(Selector('.step-0-label .step-label-caption').innerText)
      .contains('Lids Db Credentials')

      .typeText(Selector('.select-textfield'), 'lids-db:prod')
      .pressKey('enter')
      .click('button.next')

      // Check step 2 caption, stepper summary
      .expect(Selector('.step-1-label .step-label-caption').innerText)
      .contains('Lids Prod Credentials')
      .expect(Selector('.new-addon-summary').innerText)
      .contains('The addon Lids Db Credentials with plan Lids Prod Credentials ($0.00) will be created and attached to this app.')
      .click('button.next')

      .expect(Selector('.new-addon-error').innerText)
      .contains('The specified addon may not be attached to this app. It requires these necessary compliances in the space')
      .click('.ok')

    // create addon
      .typeText(Selector('.select-textfield'), 'Lids Db Credentials')
      .pressKey('enter')
      .click('button.next')
      .typeText(Selector('.select-textfield'), 'lids-db:dev')
      .pressKey('enter')

      // Test addon plan description
      .expect(Selector('.plan-price').innerText)
      .contains('/mo')
      .expect(Selector('.plan-description').innerText)
      .contains('credentials')
      .click('button.back')
      .click('button.next')
      .typeText(Selector('.select-textfield'), 'lids-db:dev')
      .pressKey('enter')
      .expect(Selector('.plan-price').exists)
      .ok()
      .expect(Selector('.plan-description').exists)
      .ok()
      .click('button.next')
      .click('button.next')
      .expect(Selector('.addon-snack').innerText)
      .contains('Addon Created')
      .expect(Selector('.addon-list .lids-db').exists)
      .ok()

    // Test duplicate
      .click('button.new-addon')
      .typeText(Selector('.select-textfield'), 'Lids Db Credentials')
      .pressKey('enter')
      .click('button.next')
      .typeText(Selector('.select-textfield'), 'lids-db:dev')
      .pressKey('enter')
      .click('button.next')
      .click('button.next')
      .expect(Selector('.new-addon-error').innerText)
      .contains('This addon is already created and attached to this application and cannot be used twice.')
      .click('.ok')
      .click('.addon-cancel')

    // Check Config Vars
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .click('.config-tab')
      .expect(Selector('.config-list .OCT_VAULT_DB_LIDS_HOSTNAME').exists)
      .ok()

    // Create and Attach addon
      .navigateTo(`${baseUrl}/apps/${appName2}-testcafe`)
      .click('.addons-tab')
      .click('button.new-addon')
      .typeText(Selector('.select-textfield'), 'Akkeris PostgreSQL')
      .pressKey('enter')
      .click('button.next')
      .typeText(Selector('.select-textfield'), 'akkeris-postgresql:standard-0')
      .pressKey('enter')
      .expect(Selector('.plan-price').exists)
      .ok()
      .expect(Selector('.plan-description').exists)
      .ok()
      .click('button.next')
      .click('button.next')
      .expect(Selector('.addon-snack').innerText)
      .contains('Addon Created')
      .expect(Selector('.addon-list .akkeris-postgresql').exists)
      .ok()

      .click('.akkeris-postgresql')
      .expect(Selector('.attached-apps-dialog').exists)
      .ok()
      .expect(Selector('.addon-name').innerText)
      .contains('akkeris-postgresql')
      .expect(Selector('.attachment-0').exists)
      .ok()
      .expect(Selector('.attachment-0 .attachment-owner').innerText)
      .contains('Owner')
      .click('.ok')

    // Attach Addon from app 2
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .click('.addons-tab')
      .click('button.attach-addon')
      .typeText('.app-search input', `${appName2}-testcafe`)
      .pressKey('enter')
      .click('button.next')
      .expect(Selector('.step-0-label .step-label-caption').exists)
      .ok()
      .click('.addon-menu')
      .click('.akkeris-postgresql')
      .click('button.next')
      .expect(Selector('.step-1-label .step-label-caption').exists)
      .ok()
      .expect(Selector('.attach-addon-summary').exists)
      .ok()
      .click('button.next')
      .expect(Selector('.addon-snack').innerText)
      .contains('Addon Attached')
      .expect(Selector('.addon-list').childElementCount)
      .gt(0)

      .click('.addon-attachment-0')
      .expect(Selector('.attached-apps-dialog').exists)
      .ok()
      .expect(Selector('.attachment-0').exists)
      .ok()
      .expect(Selector('.attachment-1').exists)
      .ok()
      .click('.ok')

    // Test Dupes
      .click('button.attach-addon')
      .typeText('.app-search input', `${appName2}-testcafe`)
      .pressKey('enter')
      .click('button.next')
      .click('.addon-menu')
      .click('.akkeris-postgresql')
      .click('button.next')
      .click('button.next')
      .expect(Selector('.attach-addon-error').innerText)
      .contains('This addon is already provisioned or attached on this app.')
      .click('.ok')

    // Remove
      .click('.addons-tab')
      .click('.addon-list .lids-db button.addon-remove')
      .click('.remove-addon-confirm .ok')
      .expect(Selector('.addon-list .lids-db').exists)
      .notOk()

      .click('.addon-list .addon-attachment-0 button.attachment-remove')
      .click('.remove-attachment-confirm .ok')
      .expect(Selector('.addon-list tbody').innerText)
      .contains('No Addons');
  })
  .after(async (t) => {
    const appName = t.ctx.appName;
    const appName2 = t.ctx.appName2;
    await utils.deleteApp(`${appName}-testcafe`);
    try {
      await utils.deleteApp(`${appName2}-testcafe`);
    } catch (err) {
      if (err.response.status !== 404) {
        throw new Error(`Error deleting ${appName2}: ${err.response.data}`);
      }
    }
  });

test('Should be able to create edit and remove webhooks', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  await t
    .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
    .click('.webhooks-tab')

    // Check new component shows
    .click('button.new-webhook')
    .expect(Selector('.webhook-url').exists)
    .ok()

    // Make sure we can cancel
    .click('button.webhook-cancel')
    .expect(Selector('.webhook-url').exists)
    .notOk()

    // Create webhook

    // URL validation tests
    .click('button.new-webhook')
    .click('button.next')
    .expect(Selector('.webhook-url').innerText)
    .contains('Invalid URL')
    .typeText('.webhook-url input', '!')
    .click('button.next')
    .expect(Selector('.webhook-url').innerText)
    .contains('Invalid URL')
    .click('.webhook-url input')
    .pressKey('backspace')
    .typeText('.webhook-url input', 'example.com/hook')
    .click('button.next')
    .click('button.back')
    .expect(Selector('.webhook-url').innerText)
    .notContains('Invalid URL')
    .expect(Selector('.webhook-url input').value)
    .contains('http://example.com/hook')
    .click('button.next')

    // Events validation tests

    // Try moving on without selecting an event
    .click('button.next')
    .expect(Selector('.events-errorText').innerText)
    .contains('Must select at least one event')
    .click(Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input').nth(0))
    .click('button.next')
    .click('button.back')
    .expect(Selector('.events-errorText').exists)
    .notOk()
    // Event should stay checked, other events should not be checked
    .expect(Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input').nth(0).checked)
    .ok()
    .expect(Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input').nth(1).checked)
    .notOk()
    // Test that event descriptions show up
    .click('.events-info-button')
    .expect(Selector('.events-info-dialog').exists)
    .ok()
    .click('.events-info-dialog .ok')

    // Check All Tests

    // Click "check all" and make sure they are all checked
    .click('.checkbox-check-all');

  let checkboxElements = Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input');
  let checkboxCount = await checkboxElements.count;
  for (let i = 0; i < checkboxCount; i++) {
    await t.expect(checkboxElements.nth(i).checked).ok(); // eslint-disable-line no-await-in-loop
  }


  // Make sure all checkbox elements are checked after page is changed
  await t
    .click('button.next')
    .click('button.back');

  checkboxElements = Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input');
  checkboxCount = await checkboxElements.count;
  for (let i = 0; i < checkboxCount; i++) {
    await t.expect(checkboxElements.nth(i).checked).ok(); // eslint-disable-line no-await-in-loop
  }

  // Click check all again and make sure they are all unchecked
  await t.click('.checkbox-check-all');

  checkboxElements = Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input');
  checkboxCount = await checkboxElements.count;
  for (let i = 0; i < checkboxCount; i++) {
    await t.expect(checkboxElements.nth(i).checked).notOk(); // eslint-disable-line no-await-in-loop
  }

  // Click one and make sure that 'check all' is unchecked
  await t
    .click(checkboxElements.nth(0))
    .expect(checkboxElements.nth(0).checked)
    .ok()
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()

    // Click check all and uncheck one, and make sure that 'check all' is unchecked
    .click('.checkbox-check-all')
    .expect(Selector('.checkbox-check-all input').checked)
    .ok()
    .click(checkboxElements.nth(0))
    .expect(checkboxElements.nth(0).checked)
    .notOk()
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()

    // Check every box, check-all should only be checked when everything else is
    .click('.checkbox-check-all')
    .click('.checkbox-check-all')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk();

  checkboxElements = Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input');
  checkboxCount = await checkboxElements.count;
  for (let i = 0; i < checkboxCount; i++) {
    if (i !== checkboxCount - 1) {
      await t // eslint-disable-line no-await-in-loop
        .click(checkboxElements.nth(i))
        .expect(Selector('.checkbox-check-all input').checked)
        .notOk();
    } else {
      await t // eslint-disable-line no-await-in-loop
        .click(checkboxElements.nth(i))
        .expect(Selector('.checkbox-check-all input').checked)
        .ok();
    }
  }

  await t
    .click('button.next')

    // Secret validation tests
    .typeText('.webhook-secret input', 'over twenty characters')
    .click('button.next')
    .expect(Selector('.webhook-secret').innerText)
    .contains('Secret must be less than 20 characters')
    .click('.webhook-secret input')
    .pressKey('ctrl+a')
    .pressKey('backspace')
    .typeText('.webhook-secret input', 'mysecret')
    .click('button.next')

    // Check stepper summary
    .expect(Selector('.new-webhook-summary').exists)
    .ok()
    .click('button.next')

    // Test that webhook was created, displayed
    .expect(Selector('.webhook-snack').innerText)
    .contains('Webhook Created')
    .expect(Selector('.webhook-title-url-0').innerText)
    .contains('http://example.com/hook')

    // Remove
    .click('.webhook-item-0 .webhook-title') // Open edit dropdown
    .click('.webhook-item-0 button.webhook-remove')
    .click('.delete-webhook .ok')
    .expect(Selector('.webhook-item-0').exists)
    .notOk()

    // Display multiple webhooks
    .wait(2000)
    .click('button.new-webhook')
    .typeText('.webhook-url input', 'http://example.com/hook1')
    .click('button.next')
    .click(Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input').nth(0))
    .click(Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input').nth(1))
    .click('button.next')
    .click('button.next') // Also tests for empty secret
    .click('button.next')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Webhook Created')
    .click('button.new-webhook')
    .typeText('.webhook-url input', 'http://example.com/hook2')
    .click('button.next')
    .click(Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input').nth(0))
    .click(Selector('.new-webhook-events-grid  *[class*="checkbox-event"] input').nth(1))
    .click('button.next')
    .typeText('.webhook-secret input', 'secret')
    .click('button.next')
    .click('button.next')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Webhook Created')
    .expect(Selector('.webhook-list').exists)
    .ok()
    .expect(Selector('.webhook-title-url-0').exists)
    .ok()
    .expect(Selector('.webhook-title-url-1').exists)
    .ok()
    .expect(Selector('.webhook-list').withText('http://example.com/hook1').exists)
    .ok()
    .expect(Selector('.webhook-list').withText('http://example.com/hook2').exists)
    .ok()

    // Remove one of the webhooks
    .click('.webhook-item-1 .webhook-title') // Open edit dropdown
    .click('.webhook-item-1 button.webhook-remove')
    .click('.delete-webhook .ok')
    .expect(Selector('.webhook-item-1').exists)
    .notOk()

    // Edit webhooks tests
    .click('.webhook-item-0 .webhook-title')
    .click('.webhook-item-0 button.webhook-edit')
    .click('.webhook-item-0 .edit-url input')

    // Test inavlid URL
    .pressKey('ctrl+a')
    .pressKey('backspace')
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-item-0 .edit-url').innerText)
    .contains('Invalid URL')

    // Test back button resets url field
    .typeText('.webhook-item-0 .edit-url input', 'http://new-url.com/')
    .click('.webhook-item-0 .webhook-back')
    .click('.webhook-item-0 .webhook-edit')
    .expect(Selector('.webhook-item-0 .edit-url input').value)
    .contains('http://example.com/hook')

    // Test save new url
    .click('.webhook-item-0 .edit-url input')
    .pressKey('ctrl+a')
    .pressKey('backspace')
    .typeText('.webhook-item-0 .edit-url input', 'new-url.com/')
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Updated Webhook')
    .click('.webhook-item-0 .webhook-title') // Open edit dropdown
    .click('.webhook-item-0 .webhook-edit')
    .expect(Selector('.webhook-item-0 .edit-url input').value)
    .contains('http://new-url.com/')


    // Test at least one event in edit
    .click('.checkbox-check-all')
    .click('.checkbox-check-all')
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-item-0 .events-errorText').innerText)
    .contains('Must select at least one event')
    .click('.checkbox-check-all');


  checkboxElements = Selector('.webhook-item-0 *[class*="checkbox-event"] input');
  checkboxCount = await checkboxElements.count;
  for (let i = 0; i < checkboxCount; i++) {
    await t.expect(checkboxElements.nth(i).checked).ok(); // eslint-disable-line no-await-in-loop
  }

  await t
    .expect(Selector('.webhook-item-0 .checkbox-check-all input').checked)
    .ok()
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Updated Webhook')
    .click('.webhook-item-0 .webhook-title') // Open edit dropdown
    .click('.webhook-item-0 .webhook-edit');

  checkboxElements = Selector('.webhook-item-0 *[class*="checkbox-event"] input');
  checkboxCount = await checkboxElements.count;
  for (let i = 0; i < checkboxCount; i++) {
    await t.expect(checkboxElements.nth(i).checked).ok(); // eslint-disable-line no-await-in-loop
  }

  await t
    .expect(Selector('.webhook-item-0 .checkbox-check-all input').checked)
    .ok()

    // Test events info dialog
    .click('.webhook-item-0 .events-info-button')
    .expect(Selector('.events-info-dialog').exists)
    .ok()
    .click('.events-info-dialog .ok')

    // Test toggle functionality
    .click('.webhook-item-0 .active-toggle input')
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Updated Webhook')
    .click('.webhook-item-0 .webhook-title') // Open edit dropdown
    .click('.webhook-item-0 .webhook-edit')
    .expect(Selector('.webhook-item-0 .active-toggle input').checked)
    .notOk()

    // Test secret can be changed
    .click('.webhook-item-0 .active-toggle input')
    .click('.webhook-item-0 .edit-secret input')
    .typeText('.webhook-item-0 .edit-secret input', 'over twenty characters')
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-item-0 .edit-secret').innerText)
    .contains('Secret must be less than 20 characters')
    .click('.webhook-item-0 .edit-secret input')
    .pressKey('ctrl+a')
    .pressKey('backspace')
    .typeText('.webhook-item-0 .edit-secret input', 'mysecret')
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Updated Webhook')

    // Test back button functionality
    .click('.webhook-item-0 .webhook-title') // Open edit dropdown
    .click('.webhook-item-0 .webhook-edit')
    .click('.webhook-item-0 .active-toggle input')
    .typeText('.webhook-item-0 .edit-url input', 'http://old-url.com/')
    .click('.checkbox-check-all')
    .click(Selector('.webhook-item-0 *[class*="checkbox-event"] input').nth(0))
    .click('.webhook-item-0 .webhook-back')
    .click('.webhook-item-0 .webhook-edit')
    // Expect url to revert
    .expect(Selector('.webhook-item-0 .edit-url input').value)
    .contains('http://new-url.com/')
    // Expect toggle to revert
    .expect(Selector('.webhook-item-0 .active-toggle input').checked)
    .ok();

  checkboxElements = Selector('.webhook-item-0 *[class*="checkbox-event"] input');
  checkboxCount = await checkboxElements.count;
  for (let i = 0; i < checkboxCount; i++) {
    await t.expect(checkboxElements.nth(i).checked).ok(); // eslint-disable-line no-await-in-loop
  }

  // Expect events to revert
  await t
    .expect(Selector('.webhook-item-0 .checkbox-check-all input').checked)
    .ok()

    // Test history functionality
    .click('.webhook-item-0 .webhook-back')
    .click('.webhook-item-0 button.webhook-history')
    // Expect no events
    .expect(Selector('.history-dialog .history-dialog-noEvents').innerText)
    .contains('No history events found.')
    .click('.history-dialog button.ok')
    // Create config item to fire a webhook
    .click('.config-tab')
    .click('button.lock-config')
    .typeText('.new-config-var .new-config-var-key input', 'test')
    .typeText('.new-config-var .new-config-var-value textarea[placeholder="VALUE"]', 'test')
    .click('.new-config-var .add')
    .click('.submit-config-vars')
    .click('button.lock-config')
    .click('button.save-config-vars')
    .wait(1000)
    .click('.webhooks-tab')
    // Expect an event
    .click('.webhook-item-0 .webhook-title') // Open edit dropdown
    .click('.webhook-item-0 button.webhook-history')
    .expect(Selector('.history-dialog .historyItem-0').exists)
    .ok()
    .expect(Selector('.history-dialog .historyItem-0').innerText)
    .contains('config_change')
    // Make sure the event details display correctly
    .click('.history-dialog .historyItem-0')
    .expect(Selector('.history-dialog .history-dialog-subtitle').innerText)
    .contains('Selected Item')
    .expect(Selector('.history-dialog .history-dialog-subtitle').innerText)
    .contains('config_change')
    .expect(Selector('.history-dialog .history-info-table').exists)
    .ok()
    // Expect back button to work
    .click(Selector('.history-dialog button.back'))
    .expect(Selector('.history-dialog .historyItem-0').innerText)
    .contains('config_change')
    .expect(Selector('.history-dialog .history-dialog-subtitle').innerText)
    .contains('Select an item to view detailed information.')
    .click(Selector('.history-dialog button.ok'));
});


test('Should be able to create edit and remove config vars', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  await t
    .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
    .click('.config-tab')

    // Check new component shows
    .click('.config-tab')
    .click('button.lock-config')
    .expect(Selector('.new-config-var .new-config-var-key input').exists)
    .ok()

    // Make sure we can cancel
    .click('button.lock-config')
    .expect(Selector('.new-config-var .new-config-var-key input').exists)
    .notOk()

    // Create new config var
    .click('button.lock-config')
    .typeText('.new-config-var .new-config-var-key input', 'MERP')
    .typeText('.new-config-var .new-config-var-value textarea[placeholder="VALUE"]', 'DERP')
    .click('.new-config-var .add')
    .click('.submit-config-vars')
    .click('button.lock-config')
    .click('button.save-config-vars')

    .click('button.lock-config')
    .typeText('.new-config-var .new-config-var-key input', 'FOO')
    .typeText('.new-config-var .new-config-var-value textarea[placeholder="VALUE"]', 'BAR')
    .click('.new-config-var .add')
    .click('.submit-config-vars')
    .click('button.lock-config')
    .click('button.save-config-vars')

    .expect(Selector('.config-list .MERP').innerText)
    .contains('DERP')
    .expect(Selector('.config-list .FOO').innerText)
    .contains('BAR')

    // Edit config var
    .click('button.lock-config')
    .click('.config-list .MERP button.edit')
    .typeText(Selector('.config-edit-value textarea').withAttribute('style'), 'Testcafe', { replace: true })
    // .typeText('.config-edit-value input', 'Testcafe', { replace: true })
    .click('.submit-config-vars')
    .click('button.lock-config')
    .click('button.save-config-vars')
    .expect(Selector('.config-list .MERP').innerText)
    .contains('Testcafe')

    // Remove config var
    .click('button.lock-config')
    .click('.config-list .MERP button.remove')
    .click('button.lock-config')
    .click('button.save-config-vars')
    .expect(Selector('.config-list .MERP').exists)
    .notOk();
});
