import { expect, test, type Page } from '@playwright/test';

import {
  APP_URL_PATH,
  injectValidConfig,
  mockJudgement,
  mockLlmApi,
} from './helpers';

/**
 * The multiplayer websocket is proxied by the vite dev server to the node
 * server started as a second playwright webServer (see playwright.config.ts).
 */

const enterMultiplayer = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Multiplayer' }).click();
  await expect(page.getByLabel('Your Name')).toBeVisible();
};

const joinAsHost = async (page: Page, name: string): Promise<string> => {
  await enterMultiplayer(page);
  await page.getByLabel('Your Name').fill(name);
  await page.getByRole('button', { name: 'Create Room' }).click();
  const roomCode = page.getByTestId('room-code');
  await expect(roomCode).toBeVisible();
  const code = (await roomCode.textContent()) ?? '';
  expect(code).toHaveLength(4);
  return code;
};

const joinAsGuest = async (
  page: Page,
  name: string,
  code: string,
): Promise<void> => {
  await enterMultiplayer(page);
  await page.getByLabel('Your Name').fill(name);
  await page.getByLabel('Room Code').fill(code);
  await page.getByRole('button', { name: 'Join Room' }).click();
  await expect(page.getByTestId('room-code')).toHaveText(code);
};

test('full round: create, join, start, skip, submit, judge, shared table', async ({
  browser,
}) => {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  // Only the host needs an LLM configuration: it generates the attributes
  // and judges items with its own provider settings.
  await injectValidConfig(hostPage);
  await mockLlmApi(hostPage);
  await hostPage.goto(APP_URL_PATH);
  const code = await joinAsHost(hostPage, 'Alice');

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(APP_URL_PATH);
  await joinAsGuest(guestPage, 'Bob', code);

  // Both lobbies list both members.
  await expect(hostPage.getByText('Bob')).toBeVisible();
  await expect(guestPage.getByText('Alice')).toBeVisible();

  // Host starts the game; both pages reach the shared table.
  await hostPage.getByRole('button', { name: 'Start Game' }).click();
  await expect(hostPage.locator('#name')).toBeVisible();
  await expect(guestPage.locator('#name')).toBeVisible();

  // First turn belongs to the host (join order); the guest is locked out.
  await expect(hostPage.getByTestId('turn-status')).toContainText('Your turn');
  await expect(guestPage.getByTestId('turn-status')).toContainText('Alice');
  await expect(guestPage.locator('#name')).toBeDisabled();

  // Host skips its own turn so the guest can play.
  await hostPage.getByRole('button', { name: 'Skip this player' }).click();
  await hostPage.getByRole('button', { name: 'Confirm' }).click();
  await expect(guestPage.getByTestId('turn-status')).toContainText('Your turn');
  await expect(hostPage.getByTestId('turn-status')).toContainText('Bob');

  // Guest submits; the host's client judges via the mocked LLM API.
  await guestPage.locator('#name').fill('dog');
  await guestPage.locator('#description').fill('a common pet animal');
  await guestPage.getByRole('checkbox', { name: 'Word' }).check();
  await guestPage.getByRole('button', { name: 'Create' }).click();

  // Both ends show the same judged row.
  const hostRow = hostPage.getByRole('row').filter({ hasText: 'dog' });
  const guestRow = guestPage.getByRole('row').filter({ hasText: 'dog' });
  await expect(hostRow).toContainText('a common pet animal');
  await expect(guestRow).toContainText(mockJudgement.explanation);
  await expect(hostRow.locator('td.bg-green-100')).toHaveCount(2);
  await expect(guestRow.locator('td.bg-green-100')).toHaveCount(2);

  // Turn passed back to the host after the judgement.
  await expect(hostPage.getByTestId('turn-status')).toContainText('Your turn');
  await expect(guestPage.getByTestId('turn-status')).toContainText('Alice');
});

test('host disconnect dissolves the room and notifies guests', async ({
  browser,
}) => {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await injectValidConfig(hostPage);
  await mockLlmApi(hostPage);
  await hostPage.goto(APP_URL_PATH);
  const code = await joinAsHost(hostPage, 'Alice');

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(APP_URL_PATH);
  await joinAsGuest(guestPage, 'Bob', code);

  await hostContext.close();

  // Guest is told why and lands back on the online menu.
  await expect(
    guestPage.getByText('The host left; the room was dissolved'),
  ).toBeVisible();
  await expect(guestPage.getByLabel('Your Name')).toBeVisible();
});

test('guest disconnect marks them offline and skips their turn', async ({
  browser,
}) => {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await injectValidConfig(hostPage);
  await mockLlmApi(hostPage);
  await hostPage.goto(APP_URL_PATH);
  const code = await joinAsHost(hostPage, 'Alice');

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(APP_URL_PATH);
  await joinAsGuest(guestPage, 'Bob', code);

  await hostPage.getByRole('button', { name: 'Start Game' }).click();
  await expect(hostPage.locator('#name')).toBeVisible();

  // Skip the host's turn so it is the guest's turn.
  await hostPage.getByRole('button', { name: 'Skip this player' }).click();
  await hostPage.getByRole('button', { name: 'Confirm' }).click();
  await expect(guestPage.getByTestId('turn-status')).toContainText('Your turn');

  // Guest drops mid-turn: marked offline, turn returns to the host.
  await guestContext.close();
  await expect(hostPage.getByTestId('turn-status')).toContainText('Your turn');
  await expect(hostPage.getByTestId('member-Bob')).toContainText('offline');
});
