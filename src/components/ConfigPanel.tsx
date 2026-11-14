import { type Component, For, createSignal } from 'solid-js';

import {
  type LLMConfig,
  type ProviderId,
  defaultConfig,
  getConfig,
  getProviderPreset,
  isProviderId,
  providerPresets,
  resolveProviderId,
  saveConfig,
} from '../config';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfigPanelProps {
  onAccept: (config: LLMConfig) => void;
  onReset: () => void;
}

const MODEL_SUGGESTIONS_ID = 'llm-model-suggestions';

export const ConfigPanel: Component<ConfigPanelProps> = props => {
  const [config, setConfig] = createSignal<LLMConfig>(getConfig());
  const { t } = useLanguage();

  // Models suggested by the currently selected preset (empty for custom).
  const suggestedModels = () =>
    providerPresets.find(preset => preset.id === config().provider)?.models ??
    [];

  // Picking a preset fills in its baseURL and first suggested model;
  // custom keeps whatever the user already typed.
  const handleProviderChange = (id: ProviderId): void => {
    const preset = getProviderPreset(id);
    setConfig(prev => ({
      ...prev,
      baseURL: id === 'custom' ? prev.baseURL : preset.baseURL,
      model: preset.models[0] ?? prev.model,
      provider: id,
    }));
  };

  // Hand-editing the baseURL re-syncs the provider so a stored config never
  // claims a preset it no longer points at.
  const handleBaseURLInput = (baseURL: string): void => {
    setConfig(prev => ({
      ...prev,
      baseURL,
      provider: resolveProviderId(baseURL),
    }));
  };

  return (
    <div>
      <div class="space-y-2">
        <div>
          <label class="block text-xl font-medium text-gray-700">
            {t('provider')}
          </label>
          <select
            class="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onChange={e => {
              const id: unknown = e.currentTarget.value;
              if (isProviderId(id)) {
                handleProviderChange(id);
              }
            }}
            value={config().provider}
          >
            <For each={providerPresets}>
              {preset => (
                <option value={preset.id}>
                  {preset.id === 'custom' ? t('custom') : preset.label}
                </option>
              )}
            </For>
          </select>
        </div>
        <div>
          <label class="block text-xl font-medium text-gray-700">API Key</label>
          <input
            class="mt-1 block w-full rounded-md border-gray-400 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onInput={e =>
              setConfig(prev => ({ ...prev, apiKey: e.currentTarget.value }))
            }
            type="password"
            value={config().apiKey}
          />
        </div>
        <div>
          <label class="block text-xl font-medium text-gray-700">
            Base URL
          </label>
          <input
            class="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onInput={e => {
              handleBaseURLInput(e.currentTarget.value);
            }}
            type="text"
            value={config().baseURL}
          />
        </div>
        <div>
          <label class="block text-xl font-medium text-gray-700">Model</label>
          <input
            class="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            list={MODEL_SUGGESTIONS_ID}
            onInput={e =>
              setConfig(prev => ({ ...prev, model: e.currentTarget.value }))
            }
            type="text"
            value={config().model}
          />
          <datalist id={MODEL_SUGGESTIONS_ID}>
            <For each={suggestedModels()}>
              {model => <option value={model} />}
            </For>
          </datalist>
        </div>
      </div>

      <div class="flex flex-row justify-end gap-3">
        <button
          class="mt-2 rounded bg-blue-300 px-4 py-2 text-gray-700 transition-colors hover:bg-blue-400"
          onClick={() => {
            saveConfig(config());
            props.onAccept(config());
          }}
        >
          {t('save')}
        </button>
        <button
          class="mt-2 rounded bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400"
          onClick={() => {
            const newConfig = { ...defaultConfig };
            setConfig(newConfig);
            saveConfig(newConfig);
            props.onReset();
          }}
        >
          {t('reset')}
        </button>
      </div>
    </div>
  );
};
