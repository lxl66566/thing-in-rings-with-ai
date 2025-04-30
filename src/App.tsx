import { Component, createSignal } from "solid-js";
import { useLanguage } from "./i18n/LanguageContext";
import { ConfigPanel } from "./components/ConfigPanel";
import { Modal } from "./components/Modal";
import { Game } from "./components/Game";
import toast from "solid-toast";
// import { FiSettings } from "solid-icons/fi";
// import { IoLanguage } from "solid-icons/io";

const App: Component = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = createSignal(false);
  const { t, language, setLanguage } = useLanguage();
  const [loadingId, setLoadingId] = createSignal<string | undefined>(undefined);

  const openConfigModal = () => {
    setIsConfigModalOpen(true);
    const id = toast.loading(t("configureLLMFirst"));
    setLoadingId(id);
  };

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

      <Game openConfigModal={openConfigModal} />

      {/* 配置 Modal */}
      <Modal isOpen={isConfigModalOpen()} onClose={() => setIsConfigModalOpen(false)} title={t("llmConfig")}>
        <ConfigPanel
          onAccept={() => {
            setIsConfigModalOpen(false);
            toast.remove(loadingId());
            setLoadingId(undefined);
          }}
          onReset={() => {}}
        />
      </Modal>
    </div>
  );
};

export default App;
