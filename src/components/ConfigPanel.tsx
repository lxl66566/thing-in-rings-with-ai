import { type Component, createSignal } from "solid-js";
import { type LLMConfig, defaultConfig, getConfig, saveConfig } from "../config";
import { useLanguage } from "../i18n/LanguageContext";

interface ConfigPanelProps {
  onAccept: (config: LLMConfig) => void;
  onReset: () => void;
}

export const ConfigPanel: Component<ConfigPanelProps> = (props) => {
  const [config, setConfig] = createSignal<LLMConfig>(getConfig());
  const { t } = useLanguage();

  return (
    <div>
      <div class="space-y-2">
        <div>
          <label class="block text-xl font-medium text-gray-700">API Key</label>
          <input
            type="password"
            value={config().apiKey}
            onInput={(e) => setConfig({ ...config(), apiKey: e.currentTarget.value })}
            class="mt-1 block w-full px-3 py-2 rounded-md border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xl font-medium text-gray-700">Base URL</label>
          <input
            type="text"
            value={config().baseURL}
            onInput={(e) => setConfig({ ...config(), baseURL: e.currentTarget.value })}
            class="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xl font-medium text-gray-700">Model</label>
          <input
            type="text"
            value={config().model}
            onInput={(e) => setConfig({ ...config(), model: e.currentTarget.value })}
            class="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div class="flex flex-row justify-end gap-3">
        <button
          onClick={() => {
            saveConfig(config());
            props.onAccept(config());
          }}
          class="mt-2 px-4 py-2 bg-blue-300 text-gray-700 rounded hover:bg-blue-400 transition-colors"
        >
          {t("save")}
        </button>
        <button
          onClick={() => {
            const newConfig = { ...defaultConfig };
            setConfig(newConfig);
            saveConfig(newConfig);
            props.onReset();
          }}
          class="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
        >
          {t("reset")}
        </button>
      </div>
    </div>
  );
};
