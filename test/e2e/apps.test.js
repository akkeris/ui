import { Selector } from 'testcafe';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

fixture('Apps Page') // eslint-disable-line no-undef
  .page(`${baseUrl}/apps`)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login');
  });

test('Should show list of apps based on filter', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.app-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.app-list .api-default').innerText)
    .contains('api-default')

    .click('.region-dropdown')
    .expect(Selector('#menu-region .us-seattle').innerText)
    .contains('us-seattle')

    .click('#menu-region .us-seattle')

    .click('.space-dropdown')
    .expect(Selector('#menu-space .default').innerText)
    .contains('default')

    .click('#menu-space .default')
    .expect(Selector('.app-list .api-default').innerText)
    .contains('default')

    .click('.space-dropdown')
    .click('#menu-space .test')
    .expect(Selector('.app-list tbody').childElementCount)
    .eql(0);
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

test('Should follow search to app and see all info', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', 'api-default')
    .wait(2000).pressKey('enter')
    .expect(Selector('.card .header').innerText)
    .contains('api-default');
});

test('Should show apps as first group in global search', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', 't')
    .wait(2000)
    .expect(Selector('.global-search-results .group-heading').nth(0).innerText)
    .contains('Apps', 'List of apps not first in search results');
});

test('Should be able to create and delete an app', async (t) => { // eslint-disable-line no-undef
  await t
  // navigate to new app page
    .click('.new-app')
    .click('button.next')
    .expect(Selector('.app-name').innerText)
    .contains('App required')

  // create app
    .typeText('.app-name input', 'testcafe')
    .click('button.next')

    // Check step 1 caption
    .expect(Selector('.step-0-label .step-label-caption').innerText)
    .contains('testcafe')

    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')

    // Check step 2 caption
    .expect(Selector('.step-1-label .step-label-caption').innerText)
    .contains('testcafe')

    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')

    // Check step 3 caption, stepper summary
    .expect(Selector('.step-2-label .step-label-caption').innerText)
    .contains('testcafe')
    .expect(Selector('.new-app-summary').innerText)
    .contains('The app testcafe-testcafe will be created in the testcafe org.')
    .click('button.next')

    // Verify that app exists
    .click('.space-dropdown')
    .click('#menu-space .testcafe')
    .expect(Selector('.app-list .testcafe-testcafe').exists)
    .ok()

  // navigate to new app page
    .click('.new-app')
    .click('button.next')
    .expect(Selector('.app-name').innerText)
    .contains('App required')

  // test duplicate
    .typeText('.app-name input', 'testcafe')
    .click('button.next')
    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')
    .typeText('div.select-textfield', 'testcafe')
    .pressKey('enter')
    .click('button.next')
    .click('button.next')
    .expect(Selector('.new-app-error').innerText)
    .contains('The requested application already exists.')
    .click('.ok')

    .navigateTo(`${baseUrl}/apps`)
    // check if app was created
    .click('.space-dropdown')
    .click('#menu-space .testcafe')
    .click('.app-list .testcafe-testcafe')
    .expect(Selector('.card .header').innerText)
    .contains('testcafe-testcafe')

    // delete the app
    .click('button.delete')
    .expect(Selector('.delete-confirm').innerText)
    .contains('Are you sure you want to delete this app?')

    // confirm delete and make sure app no longer exists
    .click('.delete-confirm .ok')
    .expect(Selector('.app-list .testcafe-testcafe').exists)
    .notOk();
});


fixture('AppInfo Page') // eslint-disable-line no-undef
  .page(`${baseUrl}/apps`)
  .beforeEach(async (t) => {
    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

      // navigate to new app page
      .click('.new-app')

      // create app
      .typeText('.app-name input', 'testcafe')
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .click('button.next')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .ok();
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

test('Should follow search to app and see all info', async (t) => { // eslint-disable-line no-undef
  await t
    .click('.app-list .testcafe-testcafe')
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
  await t
    .click('.app-list .testcafe-testcafe')
    .click('.toggle')
    .expect(Selector('.maintenance-confirm').innerText)
    .contains('Are you sure you want to put this app in maintenance?')
    .click('.maintenance-confirm .ok')

    .expect(Selector('.app-snack').innerText)
    .contains('Maintenance Mode Updated')

    .expect(Selector('.audit-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.audit-list tbody tr').innerText)
    .contains('feature_change')
    .click('.audit-list tbody tr')
    .expect(Selector('.audit-info tbody').childElementCount)
    .gt(0)
    .click('button.ok');
});

test('Should be able to create edit and delete formations', async (t) => { // eslint-disable-line no-undef
  await t
    .click('.app-list .testcafe-testcafe')
    .click('.dynos-tab')

    // Check new component shows
    .click('button.new-formation')
    .expect(Selector('.new-type label').innerText)
    .contains('Type')

    // Make sure we can cancel
    .click('button.cancel')
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
    .click('.new-size .constellation')
    .click('button.next')

    // Check step 3 caption
    .expect(Selector('.step-2-label .step-label-caption').innerText)
    .contains('constellation')
    .click('button.next')

    // Check stepper summary
    .expect(Selector('.new-formation-summary').innerText)
    .contains('[2] web dyno(s) will be created with size constellation, and will use the default port.')
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
    .click('.scout')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web')
    .expect(Selector('.formation-list .web .web-info .size-select').innerText)
    .contains('scout')

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
    .contains('8080');
});

test('Should be able to create view and release builds', async (t) => { // eslint-disable-line no-undef
  await t
    .click('.app-list .testcafe-testcafe')
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
    .click('.addons-tab')
    .click('.releases-tab')
    .click('.release-list .r0 button.logs')
    .expect(Selector('.logs h2').innerText)
    .contains('Logs for')
    .click('.logs button');
});

test // eslint-disable-line no-undef
  .before(async (t) => {
    await t

    // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

    // navigate to new app page
      .click('.new-app')

    // create app
      .typeText('.app-name input', 'testcafe')
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .click('button.next')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .ok()

      // navigate to new app page
      .click('.new-app')

    // create app
      .typeText('.app-name input', 'testcafe2')
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .typeText('div.select-textfield', 'testcafe')
      .pressKey('enter')
      .click('button.next')
      .click('button.next')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafe2-testcafe').exists)
      .ok();
  })('Should be able to create and remove addons', async (t) => { // eslint-disable-line no-undef
    await t
      .click('.app-list .testcafe-testcafe')
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
      .navigateTo(`${baseUrl}/apps/testcafe-testcafe`)
      .click('.config-tab')
      .expect(Selector('.config-list .OCT_VAULT_DB_LIDS_HOSTNAME').exists)
      .ok()

    // Create and Attach addon
      .navigateTo(`${baseUrl}/apps`)
      .navigateTo(`${baseUrl}/apps/testcafe2-testcafe`)
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
      .navigateTo(`${baseUrl}/apps`)
      .navigateTo(`${baseUrl}/apps/testcafe-testcafe`)
      .click('.addons-tab')
      .click('button.attach-addon')
      .typeText('.app-search input', 'testcafe2-testcafe')
      .pressKey('enter')
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
      .expect(Selector('.attachment-1 .attachment-owner').innerText)
      .contains('Owner')
      .click('.ok')

    // Test Dupes
      .click('button.attach-addon')
      .typeText('.app-search input', 'testcafe2-testcafe')
      .pressKey('enter')
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
    await t
      .navigateTo(`${baseUrl}/apps/testcafe-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('button.delete')

    // confirm delete and make sure app no longer exists
      .click('.delete-confirm .ok')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .notOk()

      .navigateTo(`${baseUrl}/apps/testcafe2-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('button.delete')

    // confirm delete and make sure app no longer exists
      .click('.delete-confirm button.ok')
      .expect(Selector('.app-list .testcafe2-testcafe').exists)
      .notOk();
  });

test('Should be able to create edit and remove webhooks', async (t) => { // eslint-disable-line no-undef
  await t
    .click('.app-list .testcafe-testcafe')
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
    .click('button.next')
    .expect(Selector('.events-errorText').innerText)
    .contains('Must select at least one event')
    .click('.checkbox-release')
    .click('button.next')
    .click('button.back')
    .expect(Selector('.events-errorText').exists)
    .notOk()
    .expect(Selector('.checkbox-release input').checked)
    .ok()
    .expect(Selector('.checkbox-build input').checked)
    .notOk()
    .click('.events-info-button')
    .expect(Selector('.events-info-dialog').exists)
    .ok()
    .click('.events-info-dialog .ok')

    // Check All Tests
    // Click "check all" and make sure they are all checked
    .click('.checkbox-check-all')
    .expect(Selector('.checkbox-release input').checked)
    .ok()
    .expect(Selector('.checkbox-build input').checked)
    .ok()
    .expect(Selector('.checkbox-formation_change input').checked)
    .ok()
    .expect(Selector('.checkbox-logdrain_change input').checked)
    .ok()
    .expect(Selector('.checkbox-addon_change input').checked)
    .ok()
    .expect(Selector('.checkbox-config_change input').checked)
    .ok()
    .expect(Selector('.checkbox-destroy input').checked)
    .ok()
    .expect(Selector('.checkbox-preview input').checked)
    .ok()
    .expect(Selector('.checkbox-preview-released input').checked)
    .ok()
    .expect(Selector('.checkbox-released input').checked)
    .ok()
    .expect(Selector('.checkbox-crashed input').checked)
    .ok()
    .expect(Selector('.checkbox-check-all input').checked)
    .ok()
    .click('button.next')
    .click('button.back')
    .expect(Selector('.checkbox-release input').checked)
    .ok()
    .expect(Selector('.checkbox-build input').checked)
    .ok()
    .expect(Selector('.checkbox-formation_change input').checked)
    .ok()
    .expect(Selector('.checkbox-logdrain_change input').checked)
    .ok()
    .expect(Selector('.checkbox-addon_change input').checked)
    .ok()
    .expect(Selector('.checkbox-config_change input').checked)
    .ok()
    .expect(Selector('.checkbox-destroy input').checked)
    .ok()
    .expect(Selector('.checkbox-preview input').checked)
    .ok()
    .expect(Selector('.checkbox-preview-released input').checked)
    .ok()
    .expect(Selector('.checkbox-released input').checked)
    .ok()
    .expect(Selector('.checkbox-crashed input').checked)
    .ok()
    .expect(Selector('.checkbox-check-all input').checked)
    .ok()

    // Click check all again and make sure they are all unchecked
    .click('.checkbox-check-all')
    .expect(Selector('.checkbox-release input').checked)
    .notOk()
    .expect(Selector('.checkbox-build input').checked)
    .notOk()
    .expect(Selector('.checkbox-formation_change input').checked)
    .notOk()
    .expect(Selector('.checkbox-logdrain_change input').checked)
    .notOk()
    .expect(Selector('.checkbox-addon_change input').checked)
    .notOk()
    .expect(Selector('.checkbox-config_change input').checked)
    .notOk()
    .expect(Selector('.checkbox-destroy input').checked)
    .notOk()
    .expect(Selector('.checkbox-preview input').checked)
    .notOk()
    .expect(Selector('.checkbox-preview-released input').checked)
    .notOk()
    .expect(Selector('.checkbox-released input').checked)
    .notOk()
    .expect(Selector('.checkbox-crashed input').checked)
    .notOk()
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()

    // Click one and make sure that 'check all' is unchecked
    .click('.checkbox-release')
    .expect(Selector('.checkbox-release input').checked)
    .ok()
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()

    // Click check all and uncheck one, and make sure that 'check all' is unchecked
    .click('.checkbox-check-all')
    .expect(Selector('.checkbox-check-all input').checked)
    .ok()
    .click('.checkbox-release')
    .expect(Selector('.checkbox-release input').checked)
    .notOk()
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()

    // Check every box, check-all should only be checked when everything else is
    .click('.checkbox-check-all')
    .click('.checkbox-check-all')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-release')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-build')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-formation_change')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-logdrain_change')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-addon_change')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-config_change')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-destroy')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-preview')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-preview-released')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-released')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-crashed')
    .expect(Selector('.checkbox-check-all input').checked)
    .ok()
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
    .click('button.new-webhook')
    .typeText('.webhook-url input', 'http://example.com/hook1')
    .click('button.next')
    .click('.checkbox-config_change')
    .click('button.next')
    .click('button.next') // Also tests for empty secret
    .click('button.next')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Webhook Created')
    .click('button.new-webhook')
    .typeText('.webhook-url input', 'http://example.com/hook2')
    .click('button.next')
    .click('.checkbox-release')
    .click('button.next')
    .typeText('.webhook-secret input', 'secret')
    .click('button.next')
    .click('button.next')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Webhook Created')
    .expect(Selector('.webhook-list').exists)
    .ok()
    .expect(Selector('.webhook-title-url-0').innerText)
    .contains('http://example.com/hook1')
    .expect(Selector('.webhook-title-url-1').innerText)
    .contains('http://example.com/hook2')

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
    .contains('http://example.com/hook1')

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
    .expect(Selector('.webhook-item-0 .checkbox-config_change input').checked)
    .ok()
    .click('.checkbox-check-all')
    .click('.checkbox-check-all')
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-item-0 .events-errorText').innerText)
    .contains('Must select at least one event')
    .click('.checkbox-check-all')
    .expect(Selector('.webhook-item-0 .checkbox-release input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-build input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-formation_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-logdrain_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-addon_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-config_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-destroy input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-preview input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-preview-released input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-released input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-crashed input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-check-all input').checked)
    .ok()
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Updated Webhook')
    .click('.webhook-item-0 .webhook-title') // Open edit dropdown
    .click('.webhook-item-0 .webhook-edit')
    .expect(Selector('.webhook-item-0 .checkbox-release input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-build input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-formation_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-logdrain_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-addon_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-config_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-destroy input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-preview input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-preview-released input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-released input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-crashed input').checked)
    .ok()
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
    .click('.checkbox-release')
    .click('.webhook-item-0 .webhook-back')
    .click('.webhook-item-0 .webhook-edit')
    // Expect url to revert
    .expect(Selector('.webhook-item-0 .edit-url input').value)
    .contains('http://new-url.com/')
    // Expect toggle to revert
    .expect(Selector('.webhook-item-0 .active-toggle input').checked)
    .ok()
    // Expect events to revert
    .expect(Selector('.webhook-item-0 .checkbox-release input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-build input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-formation_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-logdrain_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-addon_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-config_change input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-destroy input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-preview input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-preview-released input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-released input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-crashed input').checked)
    .ok()
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
    .click('button.new-config')
    .typeText('.config-key input', 'test')
    .click('.next')
    .typeText(Selector('.config-value textarea').withAttribute('style'), 'test')
    .click('.next')
    .click('.next')
    .expect(Selector('.config-snack').innerText)
    .contains('Added Config Var')
    .click('.webhooks-tab')
    // Expect an event
    .click('.webhook-item-0 .webhook-title') // Open edit dropdown
    .click('.webhook-item-0 button.webhook-history')
    .expect(Selector('.history-dialog .historyItem-0'))
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
  await t
    .click('.app-list .testcafe-testcafe')
    .click('.config-tab')

    // Check new component shows
    .click('button.new-config')
    .expect(Selector('.config-key').exists)
    .ok()

    // Make sure we can cancel
    .click('button.config-cancel')
    .expect(Selector('.config-key').exists)
    .notOk()

    // Create new config var
    .click('button.new-config')
    .click('button.next')
    .expect(Selector('.config-key p').innerText)
    .contains('field required')
    .typeText('.config-key input', 'MERP')
    .click('button.next')

    // Check step 1 caption
    .expect(Selector('.step-0-label .step-label-caption').innerText)
    .contains('MERP')
    .click('button.next')

    // Field validation
    .expect(Selector('.config-value p').innerText)
    .contains('field required')
    .typeText(Selector('.config-value textarea').withAttribute('style'), 'DERP')
    .click('button.next')

    // Check step 2 caption, stepper summary
    .expect(Selector('.step-1-label .step-label-caption').innerText)
    .contains('DERP')
    .expect(Selector('.new-config-summary').innerText)
    .contains('The environment variable MERP = DERP will be added to this app.')
    .click('button.next')

    .expect(Selector('.config-snack').innerText)
    .contains('Added Config Var')
    .expect(Selector('.config-list .MERP').innerText)
    .contains('DERP')

    // Edit config var
    .click('.config-list .MERP button.edit')
    .typeText(Selector('.config-edit-value textarea').withAttribute('style'), 'Testcafe', { replace: true })
    // .typeText('.config-edit-value input', 'Testcafe', { replace: true })
    .click('.submit')
    .expect(Selector('.config-snack').innerText)
    .contains('Updated Config Var')
    .expect(Selector('.config-list .MERP').innerText)
    .contains('Testcafe')

    // Remove config var
    .click('.config-list .MERP button.remove')
    .click('.remove-config .ok')
    .expect(Selector('.config-list .MERP').exists)
    .notOk();
});
