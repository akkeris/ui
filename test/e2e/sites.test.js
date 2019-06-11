import { Selector } from 'testcafe';

const utils = require('../utils');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

fixture('Sites Page') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)

      .click('button.login')
      .navigateTo(`${baseUrl}/sites`);
  });

test('Should show list of sites', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.site-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.site-list .testsite').innerText)
    .contains('testsite');
});

test('Should throw error on non-existent site', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', '____')
    .wait(2000)
    .expect(Selector('.global-search-results').innerText)
    .contains('No results', 'Search results found when none expected')
    .navigateTo(`${baseUrl}/sites/merp/info`)
    .expect(Selector('.not-found-error').innerText)
    .contains('The specified site was not found.');
});

test('Should follow search to site and see all info', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', 'testsite')
    .wait(2000).pressKey('enter')
    .expect(Selector('.card .header').innerText)
    .contains('testsite');
});

test('Should show sites as first group in global search', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.global-search input', 't')
    .wait(2000)
    .expect(Selector('.global-search-results .group-heading').nth(0).innerText)
    .contains('Sites', 'List of sites not first in search results');
});

test('Should be able to create and delete site', async (t) => { // eslint-disable-line no-undef
  const siteName = utils.randomString();
  await t
    // navigate to new app page
    .click('.new-site')

    // field validation
    .click('button.next')
    .expect(Selector('.site-name').innerText)
    .contains('field required')

    .typeText('.site-name input', siteName)
    .click('button.next')

    // Check step 1 caption
    .expect(Selector('.step-0-label .step-label-caption').innerText)
    .contains(siteName)

    // field validation
    .click('.us-seattle')
    .click('button.next')

    // Check step 2 caption
    .expect(Selector('.step-1-label .step-label-caption').innerText)
    .contains('us-seattle')
    .click('button.next')

    // Check step 3 caption and stepper summary
    .expect(Selector('.step-2-label .step-label-caption').innerText)
    .contains('external')
    .expect(Selector('.new-site-summary').innerText)
    .contains(`The external site ${siteName} will be created in the region us-seattle.`)
    .click('button.next')

    // check if site was created
    .click(`.site-list .${siteName}`)
    .expect(Selector('.card .header').innerText)
    .contains(siteName)

    // delete the site
    .click('button.delete')
    .expect(Selector('.confirm').innerText)
    .contains('Are you sure you want to delete this site?')

    // confirm delete and make sure site no longer exists
    .click('.confirm .ok')
    .expect(Selector(`.site-list .${siteName}`).exists)
    .notOk();
});
