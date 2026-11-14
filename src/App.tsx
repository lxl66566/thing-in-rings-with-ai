import { type Component, createSignal } from 'solid-js';
import toast from 'solid-toast';

import { Modal } from './components/common/Modal';
import { ConfigPanel } from './components/ConfigPanel';
import { Game } from './components/Game';
import { useLanguage } from './i18n/LanguageContext';
// import { FiSettings } from "solid-icons/fi";
// import { IoLanguage } from "solid-icons/io";

const App: Component = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = createSignal(false);
  const { language, setLanguage, t } = useLanguage();
  const [loadingId, setLoadingId] = createSignal<string | undefined>(undefined);

  const openConfigModal = () => {
    setIsConfigModalOpen(true);
    const id = toast.loading(t('configureLLMFirst'));
    setLoadingId(id);
  };

  return (
    <div class="m-2 flex min-h-screen flex-col pb-2">
      {/* 顶部工具栏 */}
      <div class="top-4 right-4 z-40 flex flex-none justify-end">
        <div class="flex items-center">
          <button
            class="flex items-center rounded-lg bg-white px-4 py-2 shadow transition-colors hover:bg-gray-50"
            onClick={() => setIsConfigModalOpen(true)}
          >
            {/* <FiSettings /> */}
            {t('settings')}
          </button>
          <select
            class="ml-4 rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            onChange={e => {
              setLanguage(e.currentTarget.value === 'zh' ? 'zh' : 'en');
            }}
            value={language()}
          >
            {/* <IoLanguage /> */}
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>

      <Game openConfigModal={openConfigModal} />

      {/* 配置 Modal */}
      <Modal
        isOpen={isConfigModalOpen()}
        onClose={() => setIsConfigModalOpen(false)}
        title={t('llmConfig')}
      >
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
