import { Selector } from 'testcafe';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const botPassword = process.env.BOT_PASS;
const botUsername = process.env.BOT_USER;

fixture('Navigation') // eslint-disable-line no-undef
  .page(baseUrl)
  .beforeEach(async (t) => {
    await t
      .expect(Selector('button.login').innerText).eql('Login')
      .typeText('#username', botUsername)
      .typeText('#password', botPassword)
      .click('button.login');
  });

test('Should show title bar and navigation', async (t) => { // eslint-disable-line no-undef
  await t
    .expect(Selector('.linktodashboard').exists)
    .ok()
    .expect(Selector('.linktoapps').exists)
    .ok()
    .expect(Selector('.linktoinvoices').exists)
    .ok()
    .expect(Selector('.linktocollections').exists)
    .ok()
    .expect(Selector('.linktopipelines').exists)
    .ok()
    .expect(Selector('.linktosites').exists)
    .ok();
});

test('Should show account menu and logout', async (t) => { // eslint-disable-line no-undef
  const menu = Selector('.avatar');
  const account = Selector('.popover .account');
  const logout = Selector('.popover .logout');

  await t
    .click(menu)
    .expect(account.innerText)
    .contains('Account')
    .expect(logout.innerText)
    .contains('Logout')
    .click(logout)
    .expect(Selector('button.login').innerText)
    .contains('Login');
});
