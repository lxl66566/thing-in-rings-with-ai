import { expect, test } from '@playwright/test';

import {
  APP_URL_PATH,
  injectValidConfig,
  mockAttributes,
  mockJudgement,
  mockLlmApi,
  startGame,
  submitItem,
} from './helpers';

test('generates three attributes from the mocked LLM and renders the game', async ({
  page,
}) => {
  await injectValidConfig(page);
  await mockLlmApi(page);
  await page.goto(APP_URL_PATH);

  await startGame(page);
  await expect(page.locator('#name')).toBeVisible();

  // The generated attributes are revealed through the confirm-then-show modal.
  await page
    .getByRole('button', { name: 'Show LLM generated attributes' })
    .click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(
    page.getByRole('heading', { name: 'LLM generated attributes' }),
  ).toBeVisible();
  await expect(page.getByText(mockAttributes.word)).toBeVisible();
  await expect(page.getByText(mockAttributes.attribute)).toBeVisible();
  await expect(page.getByText(mockAttributes.context)).toBeVisible();
});

test('judges a submitted item and colours the table row', async ({ page }) => {
  await injectValidConfig(page);
  await mockLlmApi(page);
  await page.goto(APP_URL_PATH);

  await startGame(page);
  await submitItem(page, 'dog', 'a common pet animal', true);

  const row = page.getByRole('row').filter({ hasText: 'dog' });
  await expect(row).toBeVisible();
  await expect(row).toContainText('a common pet animal');
  await expect(row).toContainText(mockJudgement.explanation);

  // Checked Word matches the actual word (green), Context differs (red),
  // unchecked Attribute matches the actual attribute (green).
  await expect(row.locator('td.bg-green-100')).toHaveCount(2);
  await expect(row.locator('td.bg-red-100')).toHaveCount(1);
});

test('guides to settings when the LLM config is invalid', async ({ page }) => {
  await mockLlmApi(page);
  // No injected config: default apiKey is empty, so the config is invalid.
  await page.goto(APP_URL_PATH);

  await page.getByRole('button', { name: 'Start Game' }).click();

  await expect(
    page.getByRole('heading', { name: 'LLM Configuration' }),
  ).toBeVisible();
  // The game has not started.
  await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible();
});

test('mobile viewport keeps the core flow usable', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only layout guard');

  await injectValidConfig(page);
  await mockLlmApi(page);
  await page.goto(APP_URL_PATH);

  await startGame(page);
  await submitItem(page, 'dog', 'a common pet animal', true);
  await expect(page.getByRole('row').filter({ hasText: 'dog' })).toBeVisible();

  // The page itself must not scroll horizontally: wide content (e.g. the
  // items table) is confined to its own scroll container.
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThan(2);
});
