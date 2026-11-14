import { type Component, createSignal, Show } from 'solid-js';
import toast from 'solid-toast';

import { Modal } from './components/common/Modal';
import { ConfigPanel } from './components/ConfigPanel';
import { Game } from './components/Game';
import { useLanguage } from './i18n/LanguageContext';
import { OnlineFlow } from './online/OnlineFlow';
import { hasStoredSession, leaveOnline } from './store/onlineStore';

type AppMode = 'online' | 'single';

const App: Component = () => {
  // A stored online session (page refresh) reopens the online mode.
  const [mode, setMode] = createSignal<AppMode>(
    hasStoredSession() ? 'online' : 'single',
  );
  const { language, setLanguage, t } = useLanguage();
  const [isConfigModalOpen, setIsConfigModalOpen] = createSignal(false);
  const [loadingId, setLoadingId] = createSignal<string | undefined>(undefined);

  const openConfigModal = () => {
    setIsConfigModalOpen(true);
    const id = toast.loading(t('configureLLMFirst'));
    setLoadingId(id);
  };

  return (
    <div class="flex min-h-dvh flex-col p-2">
      {/* 顶部工具栏 */}
      <div class="flex flex-none items-center justify-end gap-3">
        <button
          class="flex items-center rounded-lg bg-white px-4 py-2.5 shadow transition-colors hover:bg-gray-50 sm:py-2"
          onClick={() => setIsConfigModalOpen(true)}
        >
          {t('settings')}
        </button>
        <select
          class="rounded-md border border-gray-300 bg-white px-3 py-2.5 shadow-sm sm:py-2"
          onChange={e => {
            setLanguage(e.currentTarget.value === 'zh' ? 'zh' : 'en');
          }}
          value={language()}
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </div>

      <Show
        fallback={
          <Game
            onEnterMultiplayer={() => {
              setMode('online');
            }}
            openConfigModal={openConfigModal}
          />
        }
        when={mode() === 'online'}
      >
        <OnlineFlow
          onBack={() => {
            leaveOnline();
            setMode('single');
          }}
          openConfigModal={openConfigModal}
        />
      </Show>

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
