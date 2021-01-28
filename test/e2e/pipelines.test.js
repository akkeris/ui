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
      .wait(100)
      .navigateTo(`${baseUrl}/pipelines`);
  });
test('Should show list of pipelines', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.pipeline-list .MuiTableBody-root').childElementCount)
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
    .expect(Selector('.error').innerText)
    .contains('The specified pipeline was not found.');
});

test('Should follow search to pipeline and see all info', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', 'testpipeline')
    .wait(2000).pressKey('enter')
    .expect(Selector('.pipeline-info').innerText)
    .contains('testpipeline')
    .expect(Selector('.review-stage').exists)
    .ok()
    .expect(Selector('.development-stage').exists)
    .ok()
    .expect(Selector('.staging-stage').exists)
    .ok()
    .expect(Selector('.production-stage').exists)
    .ok();
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
    // navigate to new pipeline page
    .click('.new-pipeline')

    // field validation
    .click('button.next')
    .expect(Selector('.pipeline-name').innerText)
    .contains('field required')

    .typeText('.pipeline-name input', pipelineName)
    .click('button.next')
    .click('button.next')

    // check if pipeline was created
    .navigateTo(`${baseUrl}/pipelines`)
    .click(`.pipeline-list .${pipelineName}`)
    .expect(Selector('.pipeline-info').innerText)
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
    await utils.createApp(appName);
    await utils.createApp(appName2);
    await utils.createApp(appName3);

    await t

      // login
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login')

      // create build on app1
      .navigateTo(`${baseUrl}/apps/${appName}-testcafe`)
      .click('.dynos-tab')
      .click('button.new-formation')
      .typeText('.new-type input', 'web')
      .click('button.next')
      .click('button.next') // quantity (1)
      .typeText(Selector('.select-textfield'), 'gp1')
      .pressKey('enter')
      .click('button.next')
      .typeText('.new-port input', '8080', { replace: true })
      .click('button.next')
      .click('button.next') // summary
      .expect(Selector('.formation-snack').innerText)
      .contains('New Formation Added')

      // new build on app1
      .click('.releases-tab')
      .click('button.new-build')
      .typeText('.url input', 'docker://docker.io/akkeris/apachetest:latest')
      .click('button.next')
      .click('button.next') // branch
      .click('button.next') // version
      .click('button.next')

      .expect(Selector('.release-snack').innerText)
      .contains('New Deployment Requested')
      .expect(Selector('.release-list tbody').childElementCount)
      .gt(0)
      .wait(10000)

      // Config for app 3
      .navigateTo(`${baseUrl}/apps/${appName3}-testcafe`)
      .click('.config-tab')
      .click('button.lock-config')
      .typeText('.new-config-var .new-config-var-key input', 'MERP')
      .typeText('.new-config-var .new-config-var-value textarea[placeholder="VALUE"]', 'DERP', { replace: true })
      .click('.new-config-var .add')
      .click('.submit-config-vars')
      .click('button.lock-config')
      .click('button.save-config-vars')
      .expect(Selector('.config-list .MERP').innerText)
      .contains('DERP')

      // Build and Release for app 2
      .navigateTo(`${baseUrl}/apps`)
      .navigateTo(`${baseUrl}/apps/${appName2}-testcafe`)
      .click('.dynos-tab')
      .click('button.new-formation')
      .typeText('.new-type input', 'web')
      .click('button.next')
      .click('button.next') // quantity (1)
      .typeText(Selector('.select-textfield'), 'gp1')
      .pressKey('enter')
      .click('button.next')
      .typeText('.new-port input', '8080', { replace: true })
      .click('button.next')
      .click('button.next') // summary
      .expect(Selector('.formation-snack').innerText)
      .contains('New Formation Added')

      // Create new release for app 2
      .click('.releases-tab')
      .click('button.new-build')
      .typeText('.url input', 'docker://docker.io/akkeris/apachetest:latest')
      .click('button.next')
      .click('button.next') // branch
      .click('button.next') // version
      .click('button.next')

      .expect(Selector('.release-snack').innerText)
      .contains('New Deployment Requested')
      .expect(Selector('.release-list tbody').childElementCount)
      .gt(0)
      .wait(10000)

      .navigateTo(`${baseUrl}/pipelines`)
      .click('.new-pipeline')
      .typeText('.pipeline-name input', pipelineName)
      .click('button.next')
      .click('button.next')
      .navigateTo(`${baseUrl}/pipelines`)
      .click(`.pipeline-list .${pipelineName}`)
      .expect(Selector('.pipeline-info').innerText)
      .contains(pipelineName);
  })
  .afterEach(async (t) => { // Cleanup
    const appName = t.ctx.appName;
    const appName2 = t.ctx.appName2;
    const appName3 = t.ctx.appName3;
    const pipelineName = t.ctx.pipelineName;

    await utils.deleteApp(`${appName}-testcafe`);

    try {
      await utils.deleteApp(`${appName2}-testcafe`);
    } catch (err) {
      if (err.response.status !== 404) {
        throw new Error(`Error deleting ${appName2}: ${err.response.data}`);
      }
    }

    try {
      await utils.deleteApp(`${appName3}-testcafe`);
    } catch (err) {
      if (err.response.status !== 404) {
        throw new Error(`Error deleting ${appName3}: ${err.response.data}`);
      }
    }

    await t
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
  const pipelineName = t.ctx.pipelineName;
  await t
    // Dev coupling
    .click('button.development-new-coupling')
    .expect(Selector('.development-app-search input').exists)
    .ok()

    .click('button.development-cancel')
    .expect(Selector('.development-app-search input').exists)
    .notOk()

    .click('button.development-new-coupling')
    .typeText('.development-app-search input', `${appName}-testcafe`)
    .pressKey('enter')
    .click('.development-ok')
    .expect(Selector('.development-coupling-list .coupling').childElementCount)
    .gt(0)

    // Duplicates
    .click('button.development-new-coupling')
    .typeText('.development-app-search input', `${appName}-testcafe`)
    .pressKey('enter')
    .click('.development-ok')
    .expect(Selector('.error').innerText)
    .contains('The application already is pipelined.')
    .click('button.ok')

    // Check no targets
    .expect(Selector(`.development-coupling-list .${appName}-testcafe button.promote`).exists)
    .notOk()

    // Staging coupling
    .click('button.staging-new-coupling')
    .typeText('.staging-app-search input', `${appName2}-testcafe`)
    .pressKey('enter')
    .click('.staging-ok')
    .expect(Selector('.staging-coupling-list .coupling').childElementCount)
    .gt(0)

    // Prod coupling
    .click('button.production-new-coupling')
    .typeText('.production-app-search input', `${appName3}-testcafe`)
    .pressKey('enter')
    .wait(1000)
    .click('.production-ok')
    .expect(Selector('.production-coupling-list .coupling').childElementCount)
    .gt(0)
    .expect(Selector(`.production-coupling-list .${appName3}-testcafe button.promote`).exists)
    .notOk()

    .wait(60000)
    .navigateTo(`${baseUrl}/pipelines/${pipelineName}`)

    // Promote to staging
    .click(`.development-coupling-list .${appName}-testcafe button.promote`)
    .expect(Selector('.promote-confirm').innerText)
    .contains('Promote')
    .click('.promote-confirm .ok')
    .wait(1000)

    // Promote to prod
    .click(`.staging-coupling-list .${appName2}-testcafe button.promote`)
    .expect(Selector('.promote-confirm').innerText)
    .contains('Promote')
    .click('.promote-confirm .force-check')
    .click('.promote-confirm .ok')
    .expect(Selector('.error').innerText)
    .contains('Safe promotion was specified and this promotion has been deemed unsafe.')
    .click('button.ok')
    .wait(1000)

    // Force Promote
    .click(`.staging-coupling-list .${appName2}-testcafe button.promote`)
    .expect(Selector('.promote-confirm').innerText)
    .contains('Promote')
    .click('.promote-confirm .ok')
    .wait(1000)

    // Remove
    .click(`.staging-coupling-list .${appName2}-testcafe button.remove`)
    .expect(Selector('.staging-remove-confirm').innerText)
    .contains('Are you sure you want to remove ')
    .click('.staging-remove-confirm .ok')
    .expect(Selector('.staging-coupling-list .coupling').exists)
    .notOk();
});
