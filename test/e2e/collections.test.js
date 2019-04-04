import { Selector } from 'testcafe';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

fixture('Collections Page') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')

      .typeText('#username', botUsername)
      .typeText('#password', botPassword)

      .click('button.login')
      .navigateTo(`${baseUrl}/collections`);
  });

test('Should show list of spaces', async (t) => { // eslint-disable-line no-undef
  await t
    .click(Selector('button.spaces-tab'))
    .expect(Selector('.space-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.space-list .default').innerText)
    .contains('default');
});

test("Shouldn't be able to create duplicate space", async (t) => { // eslint-disable-line no-undef
  await t
    // navigate to new space page
    .click(Selector('button.spaces-tab'))
    .click('.new-space')

    // field validation
    .click('button.next')
    .expect(Selector('.space-name').innerText)
    .contains('field required')

    .typeText('.space-name input', 'testcafe')
    .click('button.next')

    // Check step 1 caption
    .expect(Selector('.step-0-label .step-label-caption').innerText)
    .contains('testcafe')

    // select stack
    .click('.stack-menu')
    .expect(Selector('#menu-stack .maru').innerText)
    .contains('maru')
    .click('#menu-stack .maru')
    .click('button.next')

    // Check step 2 caption
    .expect(Selector('.step-1-label .step-label-caption').innerText)
    .contains('maru')

    // field validation
    .typeText('.space-description input', 'testcafe')
    .click('button.next')

    .click('.checkbox-dev')
    .click('button.next')

    // Check stepper summary
    .expect(Selector('.new-space-summary').innerText)
    .contains('The space testcafe will be created in the stack maru with the following compliance(s): dev.')
    .click('button.next')

    .click('button.next')

    .expect(Selector('.error').innerText)
    .contains('The specified space already exists.')
    .click('.ok');
});

test('Should show list of orgs', async (t) => { // eslint-disable-line no-undef
  await t
    .click(Selector('button.orgs-tab'))
    .expect(Selector('.org-list tbody').childElementCount)
    .gt(0)
    .expect(Selector('.org-list .test').innerText)
    .contains('test');
});

test("Shouldn't be able to create duplicate org", async (t) => { // eslint-disable-line no-undef
  await t
    // navigate to new app page
    .click(Selector('button.orgs-tab'))
    .click('.new-org')

    // field validation
    .click('button.next')
    .expect(Selector('.org-name').innerText)
    .contains('field required')

    .typeText('.org-name input', 'testcafe')
    .click('button.next')

    // Check step caption
    .expect(Selector('.step-0-label .step-label-caption').innerText)
    .contains('testcafe')

    // field validation
    .click('button.next')
    .expect(Selector('.org-description').innerText)
    .contains('field required')

    .typeText('.org-description input', 'testcafe')
    .click('button.next')

    // Check stepper summary
    .expect(Selector('.new-org-summary').innerText)
    .contains('The new org testcafe will be created.')
    .click('button.next')

    .expect(Selector('.error').innerText)
    .contains('The specified organization already exists.')
    .click('.ok');
});
