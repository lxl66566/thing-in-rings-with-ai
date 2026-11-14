import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultConfig, getConfig, isConfigValid, saveConfig } from './config';

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
    const config = {
      apiKey: 'key',
      baseURL: 'https://example.com/v1/',
      model: 'm',
    };
    saveConfig(config);
    expect(getConfig()).toEqual(config);
  });

  it('falls back to the default config on invalid JSON', () => {
    storage.set('llm_config', '{not json');
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('falls back to the default config on a malformed stored shape', () => {
    storage.set('llm_config', JSON.stringify({ apiKey: 42 }));
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('strips unknown keys from the stored config', () => {
    storage.set('llm_config', JSON.stringify({ ...defaultConfig, extra: 'x' }));
    expect(getConfig()).toEqual(defaultConfig);
  });

  it('validates completeness', () => {
    expect(isConfigValid({ apiKey: 'k', baseURL: 'b', model: 'm' })).toBe(true);
    expect(isConfigValid({ ...defaultConfig })).toBe(false);
    expect(isConfigValid({ apiKey: 'k', baseURL: '', model: 'm' })).toBe(false);
    expect(isConfigValid({ apiKey: '', baseURL: 'b', model: 'm' })).toBe(false);
  });
});
