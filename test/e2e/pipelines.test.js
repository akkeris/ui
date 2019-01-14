import { Selector } from 'testcafe';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

fixture('Pipelines Page') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)

      .click('button.login')
      .navigateTo(`${baseUrl}/#/pipelines`);
  });

test('Should show list of pipelines', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.pipeline-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.pipeline-list .testpipeline').innerText)
    .contains('testpipeline');
});

test('Should throw error on non-existent pipeline', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.search input', 'merp')
    .pressKey('enter')
    .expect(Selector('.not-found-error').innerText)
    .contains('The specified pipeline was not found.');
});

test('Should follow search to pipeline and see all info', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.search input', 'testpipeline')
    .pressKey('enter')
    .expect(Selector('.card .header').innerText)
    .contains('testpipeline')
    .click('.review-tab')
    .click('.dev-tab')
    .click('.staging-tab')
    .click('.prod-tab');
});

test('Should be able to create and delete pipeline', async (t) => { // eslint-disable-line no-undef
  await t
    // navigate to new app page
    .click('.new-pipeline')

    // field validation
    .click('button.next')
    .expect(Selector('.pipeline-name').innerText)
    .contains('field required')

    .typeText('.pipeline-name input', 'testcafe')
    .click('button.next')

    // check if pipeline was created
    .click('.pipeline-list .testcafe')
    .expect(Selector('.card .header').innerText)
    .contains('testcafe')

    // delete the pipeline
    .click('button.delete-pipeline')
    .expect(Selector('.confirm').innerText)
    .contains('Are you sure you want to delete this pipeline?')

    // confirm delete and make sure pipeline no longer exists
    .click('.confirm .ok')
    .expect(Selector('.pipeline-list .testcafe').exists)
    .notOk();
});

fixture('Pipeline Info Page') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

      // App 1
      .click('.new-app')
      .typeText('.app-name input', 'testcafepipe1')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafepipe1-testcafe').exists)
      .ok()

      // App 2
      .click('.new-app')
      .typeText('.app-name input', 'testcafepipe2')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafepipe2-testcafe').exists)
      .ok()

      // App 3
      .click('.new-app')
      .typeText('.app-name input', 'testcafepipe3')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('div.dropdown')
      .click('li.testcafe')
      .click('button.next')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafepipe3-testcafe').exists)
      .ok()

      // Config for app 3
      .navigateTo(`${baseUrl}/#/apps/testcafepipe3-testcafe`)
      .click('.config-tab')
      .click('button.new-config')
      .click('.next')
      .expect(Selector('.config-key').innerText)
      .contains('field required')
      .typeText('.config-key input', 'MERP')
      .click('.next')
      .typeText('.config-value', 'DERP', { replace: true })
      .click('.next')
      .expect(Selector('.config-list .MERP').innerText)
      .contains('DERP')

      // Build and Release for app 1
      .navigateTo(`${baseUrl}/#/apps`)
      .navigateTo(`${baseUrl}/#/apps/testcafepipe1-testcafe`)
      .click('.releases-tab')

      // Create new release
      .click('button.new-build')
      .typeText('.url input', 'docker://registry.hub.docker.com/library/httpd:alpine')
      .click('button.next')
      .click('button.next') // branch
      .click('button.next') // versiom

      .expect(Selector('.release-snack').innerText)
      .contains('New Deployment Requested')
      .expect(Selector('.release-list tbody').childElementCount)
      .gt(0)
      .wait(20000)

      .navigateTo(`${baseUrl}/#/pipelines`)
      .click('.new-pipeline')
      .typeText('.pipeline-name input', 'testcafe')
      .click('button.next')
      .click('.pipeline-list .testcafe')
      .expect(Selector('.card .header').innerText)
      .contains('testcafe');
  })
  .afterEach(async (t) => { // Cleanup
    await t
      // App 1
      .navigateTo(`${baseUrl}/#/apps/testcafepipe1-testcafe`)
      .click('.info-tab')
      .click('button.delete')
      .click('.delete-confirm .ok')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafepipe1').exists)
      .notOk()

      // App 2
      .navigateTo(`${baseUrl}/#/apps/testcafepipe2-testcafe`)
      .click('.info-tab')
      .click('button.delete')
      .click('.delete-confirm .ok')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafepipe2').exists)
      .notOk()

      // App 3
      .navigateTo(`${baseUrl}/#/apps/testcafepipe3-testcafe`)
      .click('.info-tab')
      .click('button.delete')
      .click('.delete-confirm .ok')
      .click('.space-dropdown')
      .click('#menu-space .testcafe')
      .expect(Selector('.app-list .testcafepipe3').exists)
      .notOk()

      // Pipeline
      .navigateTo(`${baseUrl}/#/pipelines/testcafe`)
      .click('button.delete-pipeline')
      .click('.confirm .ok')
      .expect(Selector('.pipeline-list .testcafe').exists)
      .notOk();
  });

test('Should be able to create promote and remove couplings', async (t) => { // eslint-disable-line no-undef
  await t

    // Dev coupling
    .click('.dev-tab')
    .click('button.development-new-coupling')
    .expect(Selector('.development-app-search input').exists)
    .ok()

    .click('button.development-cancel')
    .expect(Selector('.development-app-search input').exists)
    .notOk()

    .click('button.development-new-coupling')
    .typeText('.development-app-search input', 'testcafepipe1-testcafe')
    .pressKey('enter')
    .expect(Selector('.pipeline-snack').innerText)
    .contains('Coupling Added')
    .expect(Selector('.development-coupling-list tbody').childElementCount)
    .gt(0)

    // Duplicates
    .click('button.development-new-coupling')
    .typeText('.development-app-search input', 'testcafepipe1-testcafe')
    .pressKey('enter')
    .expect(Selector('.error').innerText)
    .contains('The application already is pipelined.')
    .click('button.ok')

    // Check no targets
    .click('.development-coupling-list .testcafepipe1-testcafe button.promote')
    .expect(Selector('.development-promote-confirm').innerText)
    .contains('Are you sure you want to promote?')
    .click('.development-promote-confirm .ok')
    .expect(Selector('.error').innerText)
    .contains('No Promotion Targets')
    .click('button.ok')

    // Staging coupling
    .click('.staging-tab')
    .click('button.staging-new-coupling')
    .typeText('.staging-app-search input', 'testcafepipe2-testcafe')
    .pressKey('enter')
    .expect(Selector('.pipeline-snack').innerText)
    .contains('Coupling Added')
    .expect(Selector('.staging-coupling-list tbody').childElementCount)
    .gt(0)

    // Prod coupling
    .click('.prod-tab')
    .click('button.production-new-coupling')
    .typeText('.production-app-search input', 'testcafepipe3-testcafe')
    .pressKey('enter')
    .expect(Selector('.pipeline-snack').innerText)
    .contains('Coupling Added')
    .expect(Selector('.production-coupling-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.production-coupling-list .testcafepipe3-testcafe button.promote').exists)
    .notOk()

    // Promote to staging
    .click('.dev-tab')
    .click('.development-coupling-list .testcafepipe1-testcafe button.promote')
    .expect(Selector('.development-promote-confirm').innerText)
    .contains('Are you sure you want to promote?')
    .click('.development-promote-confirm .ok')
    .expect(Selector('.pipeline-snack').innerText)
    .contains('Promoted: testcafepipe1-testcafe to staging')

    // Promote to prod
    .click('.staging-tab')
    .click('.staging-coupling-list .testcafepipe2-testcafe button.promote')
    .expect(Selector('.staging-promote-confirm').innerText)
    .contains('Are you sure you want to promote?')
    .click('.staging-promote-confirm .ok')
    .expect(Selector('.error').innerText)
    .contains('Safe promotion was specified and this promotion has been deemed unsafe.')
    .click('button.ok')
    // Force Promote
    .click('.staging-coupling-list .testcafepipe2-testcafe button.promote')
    .expect(Selector('.staging-promote-confirm').innerText)
    .contains('Are you sure you want to promote?')
    .click('.staging-promote-confirm .force-check')
    .click('.staging-promote-confirm .ok')

    .expect(Selector('.pipeline-snack').innerText)
    .contains('Promoted: testcafepipe2-testcafe to prod')

    // Remove
    .click('.staging-coupling-list .testcafepipe2-testcafe button.remove')
    .expect(Selector('.staging-remove-confirm').innerText)
    .contains('Are you sure you want to delete this coupling?')
    .click('.staging-remove-confirm .ok')
    .expect(Selector('.staging-coupling-list tbody').childElementCount)
    .eql(0);
});
