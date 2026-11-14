import { expect, type Page } from '@playwright/test';

/** Playwright registration handle, returned by page.route/addInitScript. */
type Registration = Promise<{ dispose: () => Promise<void> }>;

/**
 * The dev server only serves the app under vite's public base path
 * (see vite.config.ts `base`); `new URL('/', baseURL)` would drop it.
 */
export const APP_URL_PATH = '/thing-in-rings-with-ai/';

/** Fake LLM API origin; every request to it is intercepted in tests. */
export const mockBaseURL = 'https://llm.invalid/v1/';

/** Attributes returned by the mocked attribute-generation call. */
export const mockAttributes = {
  attribute: 'most people have it at home',
  context: 'often makes sounds',
  word: '4-8 letters long',
};

/** Judgement returned by the mocked placement-judgement call. */
export const mockJudgement = {
  correctJudgement: { attribute: false, context: true, word: true },
  explanation: 'Mock explanation for judging the item.',
};

interface ChatCompletionPayload {
  response_format?: {
    json_schema?: {
      schema?: { properties?: Record<string, unknown> };
    };
  };
}

const completionResponse = (content: string): string =>
  JSON.stringify({
    choices: [
      {
        finish_reason: 'stop',
        message: { content, role: 'assistant' },
      },
    ],
    usage: { completion_tokens: 24, prompt_tokens: 42, total_tokens: 66 },
  });

/**
 * Intercept all external (non-localhost) requests and answer
 * /chat/completions with an OpenAI-compatible response. The two
 * xsai generateObject calls (attribute generation vs. item judgement)
 * are told apart by their JSON schema properties.
 */
export const mockLlmApi = (page: Page): Registration =>
  page.route(/^https?:\/\/(?!localhost[:/])/, async route => {
    if (!route.request().url().endsWith('/chat/completions')) {
      await route.abort();
      return;
    }
    const payload = JSON.parse(
      route.request().postData() ?? '{}',
    ) as ChatCompletionPayload;
    const schemaProperties =
      payload.response_format?.json_schema?.schema?.properties ?? {};
    const content =
      'correctJudgement' in schemaProperties
        ? JSON.stringify(mockJudgement)
        : JSON.stringify(mockAttributes);
    await route.fulfill({
      body: completionResponse(content),
      contentType: 'application/json',
      status: 200,
    });
  });

/**
 * Pre-seed a valid LLM config (same shape as src/config.ts) so tests
 * skip the settings UI entirely.
 */
export const injectValidConfig = (page: Page): Registration =>
  page.addInitScript(
    config => {
      localStorage.setItem('llm_config', JSON.stringify(config));
    },
    { apiKey: 'e2e-api-key', baseURL: mockBaseURL, model: 'e2e-model' },
  );

/** Start a game against the mocked LLM and wait for the in-game UI. */
export const startGame = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Start Game' }).click();
  await expect(
    page.getByRole('button', { name: 'Restart Game' }),
  ).toBeVisible();
};

/** Fill the input bar and submit an item for judging. */
export const submitItem = async (
  page: Page,
  name: string,
  description: string,
  checkWord: boolean,
): Promise<void> => {
  await page.locator('#name').fill(name);
  await page.locator('#description').fill(description);
  if (checkWord) {
    await page.getByRole('checkbox', { name: 'Word' }).check();
  }
  await page.getByRole('button', { name: 'Create' }).click();
};
