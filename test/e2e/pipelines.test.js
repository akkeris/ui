import { Selector } from 'testcafe';

const utils = require('../utils');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

if (!global.createdApps) {
  global.createdApps = [];
}

if (!global.createdPipelines) {
  global.createdPipelines = [];
}

fixture('Pipelines Page') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)

      .click('button.login')
      .navigateTo(`${baseUrl}/pipelines`);
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
    .typeText('.global-search input', '____')
    .wait(2000)
    .expect(Selector('.global-search-results').innerText)
    .contains('No results', 'Search results found when none expected')
    .navigateTo(`${baseUrl}/pipelines/merp/info`)
    .expect(Selector('.not-found-error').innerText)
    .contains('The specified pipeline was not found.');
});

test('Should follow search to pipeline and see all info', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', 'testpipeline')
    .wait(2000).pressKey('enter')
    .expect(Selector('.card .header').innerText)
    .contains('testpipeline')
    .click('.review-tab')
    .click('.dev-tab')
    .click('.staging-tab')
    .click('.prod-tab');
});

test('Should show pipelines as first group in global search', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', 't')
    .wait(2000)
    .expect(Selector('.global-search-results .group-heading').nth(0).innerText)
    .contains('Pipelines', 'List of pipelines not first in search results');
});


test('Should be able to create and delete pipeline', async (t) => { // eslint-disable-line no-undef
  const pipelineName = utils.randomString();
  global.createdPipelines.push(pipelineName);
  await t
    // navigate to new app page
    .click('.new-pipeline')

    // field validation
    .click('button.next')
    .expect(Selector('.pipeline-name').innerText)
    .contains('field required')

    .typeText('.pipeline-name input', pipelineName)
    .click('button.next')

    // check if pipeline was created
    .navigateTo(`${baseUrl}/pipelines`)
    .click(`.pipeline-list .${pipelineName}`)
    .expect(Selector('.card .header').innerText)
    .contains(pipelineName)

    // delete the pipeline
    .click('button.delete-pipeline')
    .expect(Selector('.confirm').innerText)
    .contains('Are you sure you want to delete this pipeline?')

    // confirm delete and make sure pipeline no longer exists
    .click('.confirm .ok')
    .expect(Selector(`.pipeline-list .${pipelineName}`).exists)
    .notOk();
});

fixture('Pipeline Info Page') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    const appName = utils.randomString();
    const appName2 = utils.randomString();
    const appName3 = utils.randomString();
    const pipelineName = utils.randomString();
    t.ctx.appName = appName; // eslint-disable-line no-param-reassign
    t.ctx.appName2 = appName2; // eslint-disable-line no-param-reassign
    t.ctx.appName3 = appName3; // eslint-disable-line no-param-reassign
    t.ctx.pipelineName = pipelineName; // eslint-disable-line no-param-reassign
    global.createdApps.push(appName, appName2, appName3);
    global.createdPipelines.push(pipelineName);
    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

      // App 1
      .click('.new-app')
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

      // App 2
      .click('.new-app')
      .typeText('.app-name input', appName2)
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
      .click('.filter-select-clear')
      .typeText(Selector('.filter-select-input input'), 'testcafe')
      .click('.filter-select-results .testcafe')
      .expect(Selector(`.app-list .${appName2}-testcafe`).exists)
      .ok()

      // App 3
      .click('.new-app')
      .typeText('.app-name input', appName3)
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
      .click('.filter-select-clear')
      .typeText(Selector('.filter-select-input input'), 'testcafe')
      .click('.filter-select-results .testcafe')
      .expect(Selector(`.app-list .${appName3}-testcafe`).exists)
      .ok()

      // Config for app 3
      .navigateTo(`${baseUrl}/apps/${appName3}-testcafe`)
      .click('.config-tab')
      .click('button.new-config')
      .click('.next')
      .expect(Selector('.key-0').innerText)
      .contains('Must enter at least one valid keypair')
      .typeText('.key-0 input', 'MERP')
      .typeText('.value-0', 'DERP', { replace: true })
      .click('.next')
      .click('.next')
      .expect(Selector('.config-list .MERP').innerText)
      .contains('DERP')

      // Build and Release for app 1
      .navigateTo(`${baseUrl}/apps`)
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .click('.releases-tab')

      // Create new release
      .click('button.new-build')
      .typeText('.url input', 'docker://registry.hub.docker.com/library/httpd:alpine')
      .click('button.next')
      .click('button.next') // branch
      .click('button.next') // version
      .click('button.next')

      .expect(Selector('.release-snack').innerText)
      .contains('New Deployment Requested')
      .expect(Selector('.release-list tbody').childElementCount)
      .gt(0)
      .wait(20000)

      .navigateTo(`${baseUrl}/pipelines`)
      .click('.new-pipeline')
      .typeText('.pipeline-name input', pipelineName)
      .click('button.next')
      .navigateTo(`${baseUrl}/pipelines`)
      .click(`.pipeline-list .${pipelineName}`)
      .expect(Selector('.card .header').innerText)
      .contains(pipelineName);
  })
  .afterEach(async (t) => { // Cleanup
    const appName = t.ctx.appName;
    const appName2 = t.ctx.appName2;
    const appName3 = t.ctx.appName3;
    const pipelineName = t.ctx.pipelineName;

    await t
      // App 1
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .click('.info-tab')
      .click('button.app-menu-button')
      .click('.delete-app')
      .click('.delete-confirm .ok')
      .click('button.addFilter')
      .click('.filter-select-clear')
      .typeText(Selector('.filter-select-input input'), 'testcafe')
      .click('.filter-select-results .testcafe')
      .expect(Selector(`.app-list ${appName}`).exists)
      .notOk()

      // App 2
      .navigateTo(`${baseUrl}/apps/${appName2}-testcafe`)
      .click('.info-tab')
      .click('button.app-menu-button')
      .click('.delete-app')
      .click('.delete-confirm .ok')
      .click('button.addFilter')
      .click('.filter-select-clear')
      .typeText(Selector('.filter-select-input input'), 'testcafe')
      .click('.filter-select-results .testcafe')
      .expect(Selector(`.app-list .${appName2}`).exists)
      .notOk()

      // App 3
      .navigateTo(`${baseUrl}/apps/${appName3}-testcafe`)
      .click('.info-tab')
      .click('button.app-menu-button')
      .click('.delete-app')
      .click('.delete-confirm .ok')
      .click('button.addFilter')
      .click('.filter-select-clear')
      .typeText(Selector('.filter-select-input input'), 'testcafe')
      .click('.filter-select-results .testcafe')
      .expect(Selector(`.app-list .${appName3}`).exists)
      .notOk()

      // Pipeline
      .navigateTo(`${baseUrl}/pipelines/${pipelineName}`)
      .click('button.delete-pipeline')
      .click('.confirm .ok')
      .expect(Selector(`.pipeline-list .${pipelineName}`).exists)
      .notOk();
  });

test('Should be able to create promote and remove couplings', async (t) => { // eslint-disable-line no-undef
  const appName = t.ctx.appName;
  const appName2 = t.ctx.appName2;
  const appName3 = t.ctx.appName3;
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
    .typeText('.development-app-search input', `${appName}-testcafe`)
    .pressKey('enter')
    .expect(Selector('.pipeline-snack').innerText)
    .contains('Coupling Added')
    .expect(Selector('.development-coupling-list tbody').childElementCount)
    .gt(0)

    // Duplicates
    .click('button.development-new-coupling')
    .typeText('.development-app-search input', `${appName}-testcafe`)
    .pressKey('enter')
    .expect(Selector('.error').innerText)
    .contains('The application already is pipelined.')
    .click('button.ok')

    // Check no targets
    .click(`.development-coupling-list .${appName}-testcafe button.promote`)
    .expect(Selector('.development-promote-confirm').innerText)
    .contains('Are you sure you want to promote?')
    .click('.development-promote-confirm .ok')
    .expect(Selector('.error').innerText)
    .contains('No Promotion Targets')
    .click('button.ok')

    // Staging coupling
    .click('.staging-tab')
    .click('button.staging-new-coupling')
    .typeText('.staging-app-search input', `${appName2}-testcafe`)
    .pressKey('enter')
    .expect(Selector('.pipeline-snack').innerText)
    .contains('Coupling Added')
    .expect(Selector('.staging-coupling-list tbody').childElementCount)
    .gt(0)

    // Prod coupling
    .click('.prod-tab')
    .click('button.production-new-coupling')
    .typeText('.production-app-search input', `${appName3}-testcafe`)
    .pressKey('enter')
    .expect(Selector('.pipeline-snack').innerText)
    .contains('Coupling Added')
    .expect(Selector('.production-coupling-list tbody').childElementCount)
    .gt(0)
    .expect(Selector(`.production-coupling-list .${appName3}-testcafe button.promote`).exists)
    .notOk()

    // Promote to staging
    .click('.dev-tab')
    .click(`.development-coupling-list .${appName}-testcafe button.promote`)
    .expect(Selector('.development-promote-confirm').innerText)
    .contains('Are you sure you want to promote?')
    .click('.development-promote-confirm .ok')
    .expect(Selector('.pipeline-snack').innerText)
    .contains(`Promoted: ${appName}-testcafe to staging`)

    // Promote to prod
    .click('.staging-tab')
    .click(`.staging-coupling-list .${appName2}-testcafe button.promote`)
    .expect(Selector('.staging-promote-confirm').innerText)
    .contains('Are you sure you want to promote?')
    .click('.staging-promote-confirm .ok')
    .expect(Selector('.error').innerText)
    .contains('Safe promotion was specified and this promotion has been deemed unsafe.')
    .click('button.ok')
    // Force Promote
    .click(`.staging-coupling-list .${appName2}-testcafe button.promote`)
    .expect(Selector('.staging-promote-confirm').innerText)
    .contains('Are you sure you want to promote?')
    .click('.staging-promote-confirm .force-check')
    .click('.staging-promote-confirm .ok')

    .expect(Selector('.pipeline-snack').innerText)
    .contains(`Promoted: ${appName2}-testcafe to prod`)

    // Remove
    .click(`.staging-coupling-list .${appName2}-testcafe button.remove`)
    .expect(Selector('.staging-remove-confirm').innerText)
    .contains('Are you sure you want to delete this coupling?')
    .click('.staging-remove-confirm .ok')
    .expect(Selector('.staging-coupling-list tbody').childElementCount)
    .eql(0);
});
