import * as v from 'valibot';

/** LLM configuration. */
export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

/** Default configuration. */
export const defaultConfig: LLMConfig = {
  apiKey: '',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  model: 'gemini-2.5-flash-preview-04-17',
};

// Key under which the config is stored in localStorage.
const CONFIG_KEY = 'llm_config';

const configSchema = v.object({
  apiKey: v.string(),
  baseURL: v.string(),
  model: v.string(),
});

/** Load the config from localStorage, falling back to the default on any mismatch. */
export function getConfig(): LLMConfig {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored === null || stored === '') {
    return defaultConfig;
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    return v.parse(configSchema, parsed);
  } catch {
    return defaultConfig;
  }
}

/** Check that every required field is non-empty. */
export function isConfigValid(config: LLMConfig): boolean {
  return Boolean(config.apiKey && config.baseURL && config.model);
}

/** Persist the config to localStorage. */
export function saveConfig(config: LLMConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
