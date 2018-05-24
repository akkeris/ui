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
    
  // // Check restart
  // .click('.formation-list .web button.restart')
  // .expect(Selector('.snack').innerText)
  // .contains('Formation Restarted')
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
    .click('.logs button')

    // rebuilds only work for autobuilds.
    // .click('.build-list .b1 button.rebuild')
    // .expect(Selector('.build-error').innerText)
    // .contains('This build has been archived and cannot be rebuilt')
    // .click('.ok')
    //.wait(20000)

    
    // Rollback
    //.click('button.new-release')
    //.click('.release-rollback button')
    //.click('.releases-menu button')
    //.click('.release-1')
    //.click('.next button')
    //.typeText('.release-description input', 'testcafe')
    //.click('.next button')
    //.expect(Selector('.release-snack').innerText)
    //.contains('Triggered New Release')
    //.expect(Selector('.release-list tbody').childElementCount)
    //.gt(1);
});

test('Should be able to create and remove addons', async (t) => { // eslint-disable-line no-undef
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

    // attach addon
    .click('.service-menu button')
    .click('.Lids.Db.Credentials')
    .click('.next button')
    .click('.plan-menu button')
    .click('.Lids.Dev.Credentials')
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

    // Check Config Vars
    .navigateTo(`${baseUrl}/#/apps/testcafe-testcafe`)
    .click('.config-tab')
    .expect(Selector('.config-list .OCT_VAULT_DB_LIDS_HOSTNAME').exists)
    .ok()

    // Remove
    .click('.addons-tab')
    .click('.addon-list .lids-db button.remove')
    .click('.remove-confirm .ok')
    .expect(Selector('.addon-list .lids-db').exists)
    .notOk();
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
