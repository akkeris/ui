import { Selector } from 'testcafe';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

fixture('Spaces Page') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)

      .click('button.login')
      .navigateTo(`${baseUrl}/#/spaces`);
  });

test('Should show list of spaces', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.space-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.space-list .default').innerText)
    .contains('default');
});

test("Shouldn't be able to create duplicate space", async (t) => { // eslint-disable-line no-undef
  await t
    // navigate to new app page
    .click('.new-space')

    // field validation
    .click('button.next')
    .expect(Selector('.space-name').innerText)
    .contains('field required')

    .typeText('.space-name input', 'testcafe')
    .click('button.next')

    // select stack
    .click('.stack-menu')
    .expect(Selector('#menu-stack .maru').innerText)
    .contains('maru')
    .click('#menu-stack .maru')
    .click('button.next')

    // field validation
    .typeText('.space-description input', 'testcafe')
    .click('button.next')

    .click('.checkbox-dev')
    .click('button.next')

    .expect(Selector('.error').innerText)
    .contains('The specified space already exists.')
    .click('.ok');
});
