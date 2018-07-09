import { Selector } from 'testcafe';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

fixture('Apps Page') // eslint-disable-line no-undef
  .page(`${baseUrl}/#/apps`)
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

    .click('.region-dropdown button')
    .expect(Selector('[role=menu] .us-seattle').innerText)
    .contains('us-seattle')

    .click('[role=menu] .us-seattle')

    .click('.space-dropdown button')
    .expect(Selector('[role=menu] .default').innerText)
    .contains('default')

    .click('[role=menu] .default')
    .expect(Selector('.app-list .api-default').innerText)
    .contains('default')

    .click('.space-dropdown button')
    .click('[role=menu] .test')
    .expect(Selector('.app-list tbody').childElementCount)
    .eql(0);
});

test('Should throw error on non-existent app', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.search input', 'merp')
    .pressKey('enter')
    .expect(Selector('.not-found-error').innerText)
    .contains('The specified application merp does not exist');
});

test('Should follow search to app and see all info', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.search input', 'api-default')
    .pressKey('enter')
    .expect(Selector('.card .header').innerText)
    .contains('api-default');
});

test('Should be able to create and delete an app', async (t) => { // eslint-disable-line no-undef
  await t
  // navigate to new app page
    .click('.new-app')
    .click('.next button')
    .expect(Selector('.app-name').innerText)
    .contains('field required')

  // create app
    .typeText('.app-name input', 'testcafe')
    .click('.next button')
    .click('.dropdown button')
    .click('[role=menu] .testcafe')
    .click('.next button')
    .click('.dropdown button')
    .click('[role=menu] .testcafe')
    .click('.next button')
    .expect(Selector('.app-list .testcafe-testcafe').innerText)
    .contains('testcafe-testcafe')

  // navigate to new app page
    .click('.new-app')
    .click('.next button')
    .expect(Selector('.app-name').innerText)
    .contains('field required')

  // test duplicate
    .typeText('.app-name input', 'testcafe')
    .click('.next button')
    .click('.dropdown button')
    .click('[role=menu] .testcafe')
    .click('.next button')
    .click('.dropdown button')
    .click('[role=menu] .testcafe')
    .click('.next button')
    .expect(Selector('.new-app-error').innerText)
    .contains('The requested application already exists.')
    .click('.ok')

    .navigateTo(`${baseUrl}/#/apps`)
    // check if app was created
    .click('.app-list .testcafe-testcafe')
    .expect(Selector('.card .header').innerText)
    .contains('testcafe-testcafe')

    // delete the app
    .click('.delete button')
    .expect(Selector('.delete-confirm').innerText)
    .contains('Are you sure you want to delete this app?')

    // confirm delete and make sure app no longer exists
    .click('.delete-confirm .ok')
    .expect(Selector('.app-list .testcafe-testcafe').exists)
    .notOk();
});


fixture('AppInfo Page') // eslint-disable-line no-undef
  .page(`${baseUrl}/#/apps`)
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
      .click('.next button')
      .click('.dropdown button')
      .click('[role=menu] .testcafe')
      .click('.next button')
      .click('.dropdown button')
      .click('[role=menu] .testcafe')
      .click('.next button')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .ok();
  })
  .afterEach(async (t) => {
    await t
      .navigateTo(`${baseUrl}/#/apps/testcafe-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('.delete button')

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
    .expect(Selector('.type-header').innerText)
    .contains('Type')

    // Make sure we can cancel
    .click('button.cancel')
    .expect(Selector('.type-header').exists)
    .notOk()

    // Create the new formation
    .click('button.new-formation')
    .click('.next button')
    .expect(Selector('.new-type').innerText)
    .contains('Field required')
    .typeText('.new-type input', '!')
    .click('.next button')
    .expect(Selector('.new-type').innerText)
    .contains('Alphanumeric characters only')
    .click('.new-type input')
    .pressKey('backspace')
    .typeText('.new-type input', 'web')
    .click('.next button')
    .click('button.back')
    .expect(Selector('.new-type').innerText)
    .notContains('Alphanumeric characters only')
    .expect(Selector('.new-type input').value)
    .contains('web')
    .click('.next button')

    .click('.new-dropdown button')
    .click('[role=menu] .q2')
    .click('.next button')
    .click('.new-size .constellation')
    .click('.next button')
    .click('.next button')

    .expect(Selector('.formation-snack').innerText)
    .contains('New Formation Added')

    // Confirm creation
    .expect(Selector('.formation-list .web').innerText)
    .contains('web')

    // Check duplicate error
    .click('button.new-formation')
    .typeText('.new-type input', 'web')
    .click('.next button')
    .click('.next button')
    .click('.next button')
    .click('.next button')
    .expect(Selector('.new-error').innerText)
    .contains('The process of type web already exists.')
    .click('.new-error button.ok')

    // Check dyno info
    .click('.formation-list .web button')
    .expect(Selector('.formation-list .web .web-info').exists)
    .ok()
    .expect(Selector('.formation-list .web .web-dynos').exists)
    .ok()
    .click('.formation-list .web button')
    .expect(Selector('.formation-list .web .web-info').exists)
    .notOk()
    .expect(Selector('.formation-list .web .web-dynos').exists)
    .notOk()

    // Check edit
    .click('.formation-list .web button')
    .click('.formation-list .web .web-info button.edit')
    .click('.formation-list .web .web-info button.back')

    // Size
    .click('.formation-list .web .web-info button.edit')
    .click('.formation-list .web .web-info .size-select')
    .click('[role=menu] .scout')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web button')
    .expect(Selector('.formation-list .web .web-info .size-select').innerText)
    .contains('scout')

    // Quantity
    .click('.formation-list .web .web-info button.edit')
    .click('.formation-list .web .web-info .quantity-select')
    .click('[role=menu] .q1')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web button')
    .expect(Selector('.formation-list .web .quantity-select').innerText)
    .contains('1')

    // Port
    .click('.formation-list .web .web-info button.edit')
    .typeText('.formation-list .web .web-info .port input', '8080')
    .click('.formation-list .web .web-info button.save')
    .expect(Selector('.formation-snack').innerText)
    .contains('Updated Formation')
    .click('.formation-list .web button')
    .expect(Selector('.formation-list .web .port input').value)
    .contains('8080');
});

test('Should be able to create view and release builds', async (t) => { // eslint-disable-line no-undef
  await t
    .click('.app-list .testcafe-testcafe')
    .click('.releases-tab')
    .expect(Selector('.release-list tbody').childElementCount)
    .eql(0)

    // Check new component shows
    .click('button.new-build')
    .expect(Selector('.select-org').innerText)
    .contains('Select Org')

    // Make sure we can cancel
    .click('button.build-cancel')
    .expect(Selector('.select-org').exists)
    .notOk()

    // Create the new build
    .click('button.new-build')
    .click('.org-menu button')
    .click('.testcafe')
    .click('.next button')
    .typeText('.url input', 'docker://registry.hub.docker.com/library/httpd:alpine')
    .click('.next button')
    .click('.next button') // checksum
    .click('.next button') // repo
    .click('.next button') // sha
    .click('.next button') // branch
    .click('.next button') // versiom

    .expect(Selector('.release-snack').innerText)
    .contains('New Deployment Requested')
    .expect(Selector('.release-list tbody').childElementCount)
    .gt(0)

    .wait(5000)
    .click('.addons-tab')
    .click('.releases-tab')
    .click('.release-list .r0 button.logs')
    .expect(Selector('.logs h3').innerText)
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
      .click('.next button')
      .click('.dropdown button')
      .click('[role=menu] .testcafe')
      .click('.next button')
      .click('.dropdown button')
      .click('[role=menu] .testcafe')
      .click('.next button')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .ok()

      // navigate to new app page
      .click('.new-app')

    // create app
      .typeText('.app-name input', 'testcafe2')
      .click('.next button')
      .click('.dropdown button')
      .click('[role=menu] .testcafe')
      .click('.next button')
      .click('.dropdown button')
      .click('[role=menu] .testcafe')
      .click('.next button')
      .expect(Selector('.app-list .testcafe2-testcafe').exists)
      .ok();
  })('Should be able to create and remove addons', async (t) => { // eslint-disable-line no-undef
    await t
      .click('.app-list .testcafe-testcafe')
      .click('.addons-tab')

    // Check new component shows
      .click('button.new-addon')
      .expect(Selector('.service-menu').exists)
      .ok()

    // Make sure we can cancel
      .click('button.addon-cancel')
      .expect(Selector('.service-menu').exists)
      .notOk()

    // Test compliance
      .click('button.new-addon')
      .click('.service-menu button')
      .click('.Lids.Db.Credentials')
      .click('.next button')
      .click('.plan-menu button')
      .click('.Lids.Prod.Credentials')
      .click('.next button')
      .expect(Selector('.new-addon-error').innerText)
      .contains('The specified addon may not be attached to this app. It requires these necessary compliances in the space')
      .click('.ok')

    // create addon
      .click('.service-menu button')
      .click('.Lids.Db.Credentials')
      .click('.next button')
      .click('.plan-menu button')
      .click('.Lids.Dev.Credentials')

      // Test addon plan description
      .expect(Selector('.plan-price').innerText)
      .contains('/mo')
      .expect(Selector('.plan-description').innerText)
      .contains('credentials')
      .click('button.back')
      .click('.next button')
      .expect(Selector('.plan-price').exists)
      .ok()
      .expect(Selector('.plan-description').exists)
      .ok()
      .click('.next button')
      .expect(Selector('.addon-snack').innerText)
      .contains('Addon Created')
      .expect(Selector('.addon-list .lids-db').exists)
      .ok()

    // Test duplicate
      .click('button.new-addon')
      .click('.service-menu button')
      .click('.Lids.Db.Credentials')
      .click('.next button')
      .click('.plan-menu button')
      .click('.Lids.Dev.Credentials')
      .click('.next button')
      .expect(Selector('.new-addon-error').innerText)
      .contains('This addon is already created and attached to this application and cannot be used twice.')
      .click('.ok')
      .click('.addon-cancel')

    // Check Config Vars
      .navigateTo(`${baseUrl}/#/apps/testcafe-testcafe`)
      .click('.config-tab')
      .expect(Selector('.config-list .OCT_VAULT_DB_LIDS_HOSTNAME').exists)
      .ok()

    // Create and Attach addon
      .navigateTo(`${baseUrl}/#/apps`)
      .navigateTo(`${baseUrl}/#/apps/testcafe2-testcafe`)
      .click('.addons-tab')
      .click('button.new-addon')
      .click('.service-menu button')
      .click('.Alamo.Postgres')
      .click('.next button')
      .click('.plan-menu button')
      .click('.Standard-0')
      .expect(Selector('.plan-price').exists)
      .ok()
      .expect(Selector('.plan-description').exists)
      .ok()
      .click('.next button')
      .expect(Selector('.addon-snack').innerText)
      .contains('Addon Created')
      .expect(Selector('.addon-list .alamo-postgresql').exists)
      .ok()

    // Attach Addon from app 2
      .navigateTo(`${baseUrl}/#/apps`)
      .navigateTo(`${baseUrl}/#/apps/testcafe-testcafe`)
      .click('.addons-tab')
      .click('button.attach-addon')
      .typeText('.app-search input', 'testcafe2-testcafe')
      .pressKey('enter')
      .click('.addon-menu button')
      .click('.alamo-postgresql')
      .click('.next button')
      .expect(Selector('.addon-snack').innerText)
      .contains('Addon Attached')
      .expect(Selector('.addon-attachment-list').childElementCount)
      .gt(0)

    // Test Dupes
      .click('button.attach-addon')
      .typeText('.app-search input', 'testcafe2-testcafe')
      .pressKey('enter')
      .click('.addon-menu button')
      .click('.alamo-postgresql')
      .click('.next button')
      .expect(Selector('.attach-addon-error').innerText)
      .contains('This addon is already provisioned or attached on this app.')
      .click('.ok')

    // Remove
      .click('.addons-tab')
      .click('.addon-list .lids-db button.addon-remove')
      .click('.remove-addon-confirm .ok')
      .expect(Selector('.addon-list .lids-dbl').exists)
      .notOk()

      .click('.addon-attachment-list button.attachment-remove')
      .click('.remove-attachment-confirm .ok')
      .expect(Selector('.addon-attachment-list').exists)
      .notOk();
  })
  .after(async (t) => {
    await t
      .navigateTo(`${baseUrl}/#/apps/testcafe-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('.delete button')

    // confirm delete and make sure app no longer exists
      .click('.delete-confirm button.ok')
      .expect(Selector('.app-list .testcafe-testcafe').exists)
      .notOk()

      .navigateTo(`${baseUrl}/#/apps/testcafe2-testcafe`)
      .click('.info-tab')

    // delete the app
      .click('.delete button')

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
    .click('.next button')
    .expect(Selector('.webhook-url').innerText)
    .contains('Invalid URL')
    .typeText('.webhook-url input', '!')
    .click('.next button')
    .expect(Selector('.webhook-url').innerText)
    .contains('Invalid URL')
    .click('.webhook-url input')
    .pressKey('backspace')
    .typeText('.webhook-url input', 'example.com/hook')
    .click('.next button')
    .click('button.back')
    .expect(Selector('.webhook-url').innerText)
    .notContains('Invalid URL')
    .expect(Selector('.webhook-url input').value)
    .contains('http://example.com/hook')
    .click('.next button')

    // Events validation tests
    .click('.next button')
    .expect(Selector('.events-errorText').innerText)
    .contains('Must select at least one event')
    .click('.checkbox-release')
    .click('.next button')
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
    .expect(Selector('.checkbox-released input').checked)
    .ok()
    .expect(Selector('.checkbox-crashed input').checked)
    .ok()
    .expect(Selector('.checkbox-check-all input').checked)
    .ok()
    .click('.next button')
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
    .click('.checkbox-released')
    .expect(Selector('.checkbox-check-all input').checked)
    .notOk()
    .click('.checkbox-crashed')
    .expect(Selector('.checkbox-check-all input').checked)
    .ok()
    .click('.next button')

    // Secret validation tests
    .typeText('.webhook-secret input', 'over twenty characters')
    .click('.next button')
    .expect(Selector('.webhook-secret').innerText)
    .contains('Secret must be less than 20 characters')
    .click('.webhook-secret input')
    .pressKey('ctrl+a')
    .pressKey('backspace')
    .typeText('.webhook-secret input', 'mysecret')
    .click('.next button')

    // Test that webhook was created, displayed
    .expect(Selector('.webhook-snack').innerText)
    .contains('Webhook Created')
    .expect(Selector('.webhook-title-url-0').innerText)
    .contains('http://example.com/hook')

    // Remove
    .click('.webhook-item-0 div div button') // Open edit dropdown
    .click('.webhook-item-0 button.webhook-remove')
    .click('.delete-webhook .ok')
    .expect(Selector('.webhook-item-0').exists)
    .notOk()

    // Display multiple webhooks
    .click('button.new-webhook')
    .typeText('.webhook-url input', 'http://example.com/hook1')
    .click('.next button')
    .click('.checkbox-config_change')
    .click('.next button')
    .click('.next button') // Also tests for empty secret
    .expect(Selector('.webhook-snack').innerText)
    .contains('Webhook Created')
    .click('button.new-webhook')
    .typeText('.webhook-url input', 'http://example.com/hook2')
    .click('.next button')
    .click('.checkbox-release')
    .click('.next button')
    .typeText('.webhook-secret input', 'secret')
    .click('.next button')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Webhook Created')
    .expect(Selector('.webhook-list').exists)
    .ok()
    .expect(Selector('.webhook-item-0').innerText)
    .contains('http://example.com/hook1')
    .expect(Selector('.webhook-item-1').innerText)
    .contains('http://example.com/hook2')

    // Remove one of the webhooks
    .click('.webhook-item-1 div div button') // Open edit dropdown
    .click('.webhook-item-1 button.webhook-remove')
    .click('.delete-webhook .ok')
    .expect(Selector('.webhook-item-1').exists)
    .notOk()

    // Edit webhooks tests
    .click('.webhook-item-0 div div button')
    .click('.webhook-item-0 .webhook-edit')
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
    .click('.webhook-item-0 div div button') // Open edit dropdown
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
    .expect(Selector('.webhook-item-0 .checkbox-released input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-crashed input').checked)
    .ok()
    .expect(Selector('.webhook-item-0 .checkbox-check-all input').checked)
    .ok()
    .click('.webhook-item-0 .webhook-save')
    .expect(Selector('.webhook-snack').innerText)
    .contains('Updated Webhook')
    .click('.webhook-item-0 div div button') // Open edit dropdown
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
    .click('.webhook-item-0 div div button') // Open edit dropdown
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
    .click('.webhook-item-0 div div button') // Open edit dropdown
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
    .typeText(Selector('.config-value textarea').withAttribute('id'), 'test')
    .click('.next')
    .expect(Selector('.config-snack').innerText)
    .contains('Added Config Var')
    .click('.webhooks-tab')
    // Expect an event
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
  const editTextArea = Selector('.config-edit-value textarea').withAttribute('id');
  const newTextArea = Selector('.config-value textarea').withAttribute('id');
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
    .click('.next')
    .expect(Selector('.config-key').innerText)
    .contains('field required')
    .typeText('.config-key input', 'MERP')
    .click('.next')
    .click('.next')
    .expect(Selector('.config-value').innerText)
    .contains('field required')
    .typeText(newTextArea, 'DERP', { replace: true })
    .click('.next')
    .expect(Selector('.config-snack').innerText)
    .contains('Added Config Var')
    .expect(Selector('.config-list .MERP').innerText)
    .contains('DERP')

    // Edit config var
    .click('.config-list .MERP button.edit')
    .typeText(editTextArea, 'Testcafe', { replace: true })
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
