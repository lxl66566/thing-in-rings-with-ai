import { type Component, createSignal } from 'solid-js';

import {
  type LLMConfig,
  defaultConfig,
  getConfig,
  saveConfig,
} from '../config';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfigPanelProps {
  onAccept: (config: LLMConfig) => void;
  onReset: () => void;
}

export const ConfigPanel: Component<ConfigPanelProps> = props => {
  const [config, setConfig] = createSignal<LLMConfig>(getConfig());
  const { t } = useLanguage();

  return (
    <div>
      <div class="space-y-2">
        <div>
          <label class="block text-xl font-medium text-gray-700">API Key</label>
          <input
            class="mt-1 block w-full rounded-md border-gray-400 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onInput={e =>
              setConfig({ ...config(), apiKey: e.currentTarget.value })
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
            onInput={e =>
              setConfig({ ...config(), baseURL: e.currentTarget.value })
            }
            type="text"
            value={config().baseURL}
          />
        </div>
        <div>
          <label class="block text-xl font-medium text-gray-700">Model</label>
          <input
            class="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onInput={e =>
              setConfig({ ...config(), model: e.currentTarget.value })
            }
            type="text"
            value={config().model}
          />
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
