import { Show, type Component, createSignal } from 'solid-js';
import toast from 'solid-toast';

import { useLanguage } from '../i18n/LanguageContext';
import {
  createRoom,
  getLinkState,
  joinRoom,
  loadPlayerName,
} from '../store/onlineStore';

interface OnlineMenuProps {
  onBack: () => void;
}

export const OnlineMenu: Component<OnlineMenuProps> = props => {
  const { t } = useLanguage();
  const [name, setName] = createSignal(loadPlayerName());
  const [code, setCode] = createSignal('');

  const connected = () => getLinkState() === 'connected';

  const handleCreate = () => {
    if (!name().trim()) {
      toast.error(t('nameRequired'));
      return;
    }
    createRoom(name().trim());
  };

  const handleJoin = () => {
    if (!name().trim()) {
      toast.error(t('nameRequired'));
      return;
    }
    if (!code().trim()) {
      toast.error(t('enterCode'));
      return;
    }
    joinRoom(code(), name().trim());
  };

  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <div class="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-lg">
        <div>
          <label
            class="block text-sm font-medium text-gray-700"
            for="player-name"
          >
            {t('yourName')}
          </label>
          <input
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
            id="player-name"
            maxLength={24}
            onInput={e => setName(e.currentTarget.value)}
            type="text"
            value={name()}
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700"
            for="room-code-input"
          >
            {t('roomCode')}
          </label>
          <input
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono tracking-widest uppercase focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
            id="room-code-input"
            maxLength={4}
            onInput={e => setCode(e.currentTarget.value.toUpperCase())}
            placeholder="ABCD"
            type="text"
            value={code()}
          />
          <p class="mt-1 text-xs text-gray-500">{t('roomCodeJoinHint')}</p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row">
          <button
            class="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!connected()}
            onClick={handleCreate}
          >
            {t('createRoom')}
          </button>
          <button
            class="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!connected()}
            onClick={handleJoin}
          >
            {t('joinRoom')}
          </button>
        </div>
        <button
          class="w-full rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
          onClick={() => {
            props.onBack();
          }}
        >
          {t('backToSinglePlayer')}
        </button>
        <Show when={!connected()}>
          <p class="text-center text-sm text-gray-500">{t('connecting')}</p>
        </Show>
      </div>
      <p class="max-w-sm text-center text-xs text-gray-500">
        {t('multiplayerIntro')}
      </p>
    </div>
  );
};

export default OnlineMenu;
