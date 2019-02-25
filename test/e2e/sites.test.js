import { Selector } from 'testcafe';

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
    .typeText('.search input', 'merp')
    .pressKey('enter')
    .expect(Selector('.not-found-error').innerText)
    .contains('The specified site was not found.');
});

test('Should follow search to site and see all info', async (t) => { // eslint-disable-line no-undef
  await t
    .typeText('.search input', 'testsite')
    .pressKey('enter')
    .expect(Selector('.card .header').innerText)
    .contains('testsite');
});

test('Should be able to create and delete site', async (t) => { // eslint-disable-line no-undef
  await t
    // navigate to new app page
    .click('.new-site')

    // field validation
    .click('button.next')
    .expect(Selector('.site-name').innerText)
    .contains('field required')

    .typeText('.site-name input', 'testcafe')
    .click('button.next')

    // field validation
    .click('.us-seattle')
    .click('button.next')

    .click('button.next')

    // check if app was created
    .click('.site-list .testcafe')
    .expect(Selector('.card .header').innerText)
    .contains('testcafe')

    // delete the app
    .click('button.delete')
    .expect(Selector('.confirm').innerText)
    .contains('Are you sure you want to delete this site?')

    // confirm delete and make sure app no longer exists
    .click('.confirm .ok')
    .expect(Selector('.site-list .testcafe').exists)
    .notOk();
});
