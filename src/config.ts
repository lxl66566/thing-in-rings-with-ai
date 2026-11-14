import * as v from 'valibot';

/**
 * Built-in provider ids. `custom` means the user supplies their own
 * OpenAI-compatible baseURL. The union is derived from this const tuple, so
 * adding a provider here is all it takes to plumb it through the type system.
 */
export const PROVIDER_IDS = [
  'aistudio',
  'openai',
  'deepseek',
  'openrouter',
  'moonshot',
  'zhipu',
  'custom',
] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

/** Built-in OpenAI-compatible provider preset. */
export interface ProviderPreset {
  baseURL: string;
  id: ProviderId;
  label: string;
  /** Suggested models; the model field itself stays free-form. */
  models: readonly string[];
}

/**
 * Preset data keyed by provider id. The Record type forces every ProviderId
 * to have an entry (and rejects unknown keys) at compile time.
 */
const presetData: Record<ProviderId, Omit<ProviderPreset, 'id'>> = {
  aistudio: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    label: 'Google AI Studio',
    models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
  },
  custom: {
    baseURL: '',
    label: 'Custom',
    models: [],
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    label: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  moonshot: {
    baseURL: 'https://api.moonshot.cn/v1',
    label: 'Moonshot Kimi',
    models: ['kimi-k3.1-pro', 'kimi-k3.1-pro-highspeed', 'kimi-k3'],
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    label: 'OpenAI',
    models: ['gpt-5.1', 'gpt-5.1-mini', 'gpt-5-mini', 'gpt-4.1-mini'],
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    label: 'OpenRouter',
    models: [
      'openai/gpt-5.1',
      'anthropic/claude-sonnet-4.5',
      'google/gemini-2.5-flash',
      'deepseek/deepseek-chat',
    ],
  },
  zhipu: {
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    label: 'Zhipu GLM',
    models: ['glm-4.6', 'glm-4.5', 'glm-4.5-air', 'glm-4-flash'],
  },
};

/** Presets in UI order (aistudio first for backward compatibility). */
export const providerPresets: readonly ProviderPreset[] = PROVIDER_IDS.map(
  id => ({ id, ...presetData[id] }),
);

/** Look up the preset of a provider id. Total: every id has an entry. */
export function getProviderPreset(id: ProviderId): ProviderPreset {
  return { id, ...presetData[id] };
}

/** Narrow an unknown value to a ProviderId. */
export function isProviderId(value: unknown): value is ProviderId {
  return (
    typeof value === 'string' &&
    (PROVIDER_IDS as readonly string[]).includes(value)
  );
}

const normalizeBaseURL = (url: string): string =>
  url.trim().replace(/\/+$/, '');

/** LLM configuration. */
export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  provider: ProviderId;
}

/** Infer the provider id from a baseURL, falling back to `custom`. */
export function resolveProviderId(baseURL: string): ProviderId {
  const normalized = normalizeBaseURL(baseURL);
  const preset = providerPresets.find(
    candidate =>
      candidate.baseURL !== '' &&
      normalizeBaseURL(candidate.baseURL) === normalized,
  );
  return preset?.id ?? 'custom';
}

/**
 * Default configuration. The baseURL/model keep the pre-multi-provider
 * values so existing stored configs and muscle memory stay valid.
 */
export const defaultConfig: LLMConfig = {
  apiKey: '',
  baseURL: presetData.aistudio.baseURL,
  model: 'gemini-2.5-flash-preview-04-17',
  provider: 'aistudio',
};

// Key under which the config is stored in localStorage.
const CONFIG_KEY = 'llm_config';

/**
 * Stored shape. `provider` is optional so configs written before
 * multi-provider support (bare {apiKey, baseURL, model}) still parse; the
 * provider is then inferred from the baseURL.
 */
const storedConfigSchema = v.object({
  apiKey: v.string(),
  baseURL: v.string(),
  model: v.string(),
  provider: v.optional(v.string()),
});

/** Load the config from localStorage, falling back to the default on any mismatch. */
export function getConfig(): LLMConfig {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored === null || stored === '') {
    return defaultConfig;
  }
  try {
    const parsed = v.parse(storedConfigSchema, JSON.parse(stored));
    return {
      apiKey: parsed.apiKey,
      baseURL: parsed.baseURL,
      model: parsed.model,
      provider: isProviderId(parsed.provider)
        ? parsed.provider
        : resolveProviderId(parsed.baseURL),
    };
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
