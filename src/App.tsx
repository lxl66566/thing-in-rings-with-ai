import { Component, Show, createSignal } from "solid-js";
import { useLanguage } from "./i18n/LanguageContext";
import { ConfigPanel } from "./components/ConfigPanel";
import { Modal } from "./components/Modal";
import { isConfigValid as checkConfigValid, getConfig } from "./config";
import { Game } from "./components/Game";
import { FiSettings } from "solid-icons/fi";
import { IoLanguage } from "solid-icons/io";

const App: Component = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = createSignal(false);
  const [isConfigValid, setIsConfigValid] = createSignal(checkConfigValid(getConfig()));
  const { t, language, setLanguage } = useLanguage();

  return (
    <div class="min-h-screen bg-gray-100">
      {/* 顶部工具栏 */}
      <div class="fixed top-4 right-4 z-40 ">
        <div class="flex items-center">
          <button onClick={() => setIsConfigModalOpen(true)} class="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors">
            {/* <FiSettings /> */}
            {t("settings")}
          </button>
          <select
            value={language}
            onChange={(e) => setLanguage(e.currentTarget.value as "en" | "zh")}
            class="ml-4 border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            {/* <IoLanguage /> */}
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>

      {/* 主界面 */}
      <Show
        when={isConfigValid()}
        fallback={
          <div class="container mx-auto p-4">
            <div class="text-center py-12">
              <h2 class="text-xl font-bold text-gray-700 mb-4">{t("configureLLMFirst")}</h2>
              <button onClick={() => setIsConfigModalOpen(true)} class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {t("configureLLM")}
              </button>
            </div>
          </div>
        }
      >
        <Game />
      </Show>

      {/* 配置 Modal */}
      <Modal isOpen={isConfigModalOpen()} onClose={() => setIsConfigModalOpen(false)} title={t("llmConfig")}>
        <ConfigPanel onAccept={(config) => setIsConfigValid(checkConfigValid(config))} onReset={() => setIsConfigValid(false)} />
      </Modal>
    </div>
  );
};

export default App;
