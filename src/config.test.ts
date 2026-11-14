import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PROVIDER_IDS,
  type LLMConfig,
  defaultConfig,
  getConfig,
  getProviderPreset,
  isConfigValid,
  isProviderId,
  providerPresets,
  resolveProviderId,
  saveConfig,
} from './config';

// Minimal localStorage stub; tests run in a plain node environment.
const storage = new Map<string, string>();

const stubLocalStorage = (): void => {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  });
};

beforeEach(() => {
  storage.clear();
  stubLocalStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('config', () => {
  it('returns the default config when nothing is stored', () => {
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('round-trips a saved config', () => {
    const config: LLMConfig = {
      apiKey: 'key',
      baseURL: 'https://example.com/v1',
      model: 'm',
      provider: 'custom',
    };
    saveConfig(config);
    expect(getConfig()).toEqual(config);
  });

  it('persists the provider field for later loads', () => {
    saveConfig({
      apiKey: 'key',
      baseURL: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      provider: 'deepseek',
    });
    expect(JSON.parse(storage.get('llm_config') ?? '{}')).toMatchObject({
      provider: 'deepseek',
    });
  });

  it('migrates a legacy bare config by inferring the provider from the baseURL', () => {
    storage.set(
      'llm_config',
      JSON.stringify({
        apiKey: 'key',
        baseURL: defaultConfig.baseURL,
        model: defaultConfig.model,
      }),
    );
    expect(getConfig()).toEqual({
      apiKey: 'key',
      baseURL: defaultConfig.baseURL,
      model: defaultConfig.model,
      provider: 'aistudio',
    });
  });

  it.each(providerPresets.filter(preset => preset.id !== 'custom'))(
    'migrates a legacy config with the $id baseURL to provider $id',
    preset => {
      storage.set(
        'llm_config',
        JSON.stringify({
          apiKey: 'key',
          baseURL: preset.baseURL,
          model: preset.models[0],
        }),
      );
      expect(getConfig().provider).toBe(preset.id);
    },
  );

  it('migrates a legacy config with an unknown baseURL to the custom provider', () => {
    storage.set(
      'llm_config',
      JSON.stringify({
        apiKey: 'key',
        baseURL: 'https://llm.example.net/api',
        model: 'm',
      }),
    );
    expect(getConfig()).toEqual({
      apiKey: 'key',
      baseURL: 'https://llm.example.net/api',
      model: 'm',
      provider: 'custom',
    });
  });

  it('keeps an explicitly stored provider even when the baseURL matches another preset', () => {
    storage.set(
      'llm_config',
      JSON.stringify({ ...defaultConfig, provider: 'deepseek' }),
    );
    expect(getConfig().provider).toBe('deepseek');
  });

  it('falls back to baseURL inference when the stored provider is unknown', () => {
    storage.set(
      'llm_config',
      JSON.stringify({ ...defaultConfig, provider: 'banana' }),
    );
    expect(getConfig().provider).toBe('aistudio');
  });

  it('falls back to the default config on invalid JSON', () => {
    storage.set('llm_config', '{not json');
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('falls back to the default config on a malformed stored shape', () => {
    storage.set('llm_config', JSON.stringify({ apiKey: 42 }));
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('falls back to the default config on a non-string provider', () => {
    storage.set(
      'llm_config',
      JSON.stringify({ ...defaultConfig, provider: 42 }),
    );
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('strips unknown keys from the stored config', () => {
    storage.set('llm_config', JSON.stringify({ ...defaultConfig, extra: 'x' }));
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('validates completeness', () => {
    expect(
      isConfigValid({
        apiKey: 'k',
        baseURL: 'b',
        model: 'm',
        provider: 'openai',
      }),
    ).toBe(true);
    expect(isConfigValid({ ...defaultConfig })).toBe(false);
    expect(
      isConfigValid({
        apiKey: 'k',
        baseURL: '',
        model: 'm',
        provider: 'openai',
      }),
    ).toBe(false);
    expect(
      isConfigValid({
        apiKey: '',
        baseURL: 'b',
        model: 'm',
        provider: 'openai',
      }),
    ).toBe(false);
  });
});

describe('provider presets', () => {
  it('has exactly one preset per provider id', () => {
    expect(providerPresets.map(preset => preset.id)).toEqual([...PROVIDER_IDS]);
  });

  it('exposes a preset for every provider id', () => {
    for (const id of PROVIDER_IDS) {
      expect(getProviderPreset(id).id).toBe(id);
    }
  });

  it('leaves the custom preset without a baseURL or models', () => {
    const custom = getProviderPreset('custom');
    expect(custom.baseURL).toBe('');
    expect(custom.models).toEqual([]);
  });

  it.each(providerPresets.filter(preset => preset.id !== 'custom'))(
    'requires a baseURL and suggested models on $id',
    preset => {
      expect(preset.baseURL).toMatch(/^https:\/\//);
      expect(preset.models.length).toBeGreaterThan(0);
    },
  );

  it('keeps the default config on the aistudio preset for backward compatibility', () => {
    expect(defaultConfig.provider).toBe('aistudio');
    expect(defaultConfig.baseURL).toBe(getProviderPreset('aistudio').baseURL);
  });

  it.each([
    ['https://api.openai.com/v1', 'openai'],
    ['https://api.openai.com/v1/', 'openai'],
    ['https://open.bigmodel.cn/api/paas/v4/', 'zhipu'],
    ['https://llm.example.net/v1', 'custom'],
    ['', 'custom'],
  ])('resolves %s to %s', (baseURL, expected) => {
    expect(resolveProviderId(baseURL)).toBe(expected);
  });

  it('narrows provider ids', () => {
    expect(isProviderId('deepseek')).toBe(true);
    expect(isProviderId('banana')).toBe(false);
    expect(isProviderId(42)).toBe(false);
    expect(isProviderId(undefined)).toBe(false);
  });
});
