import { Selector } from 'testcafe';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

fixture('Orgs Page') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)

      .click('button.login')
      .navigateTo(`${baseUrl}/#/orgs`);
  });

test('Should show list of orgs', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.org-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.org-list .test').innerText)
    .contains('test');
});

test("Shouldn't be able to create duplicate org", async (t) => { // eslint-disable-line no-undef
  await t
    // navigate to new app page
    .click('.new-org')

    // field validation
    .click('.next button')
    .expect(Selector('.org-name').innerText)
    .contains('field required')

    .typeText('.org-name input', 'testcafe')
    .click('.next button')

    // field validation
    .click('.next button')
    .expect(Selector('.org-description').innerText)
    .contains('field required')

    .typeText('.org-description input', 'testcafe')
    .click('.next button')

    .expect(Selector('.error').innerText)
    .contains('The specified organization already exists.')
    .click('.ok');
});
