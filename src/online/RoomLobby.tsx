import { For, Show, type Accessor, type Component } from 'solid-js';

import type { RoomSnapshot } from '../../shared/protocol';
import { ConfirmButton } from '../components/common/ConfirmButton';
import { getConfig, isConfigValid } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { getYouId, leaveOnline, startGame } from '../store/onlineStore';

interface RoomLobbyProps {
  openConfigModal: () => void;
  snapshot: Accessor<RoomSnapshot>;
}

export const RoomLobby: Component<RoomLobbyProps> = props => {
  const { t } = useLanguage();
  const isHost = () => getYouId() === props.snapshot().hostId;
  const configValid = () => isConfigValid(getConfig());

  const handleStart = () => {
    if (!configValid()) {
      props.openConfigModal();
      return;
    }
    startGame();
  };

  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <div class="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-lg">
        <div class="text-center">
          <h2 class="text-lg font-semibold text-gray-800">{t('roomCode')}</h2>
          <div
            class="font-mono text-4xl font-bold tracking-[0.3em] text-indigo-600"
            data-testid="room-code"
          >
            {props.snapshot().code}
          </div>
          <p class="mt-1 text-xs text-gray-500">{t('roomCodeHint')}</p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-700">{t('members')}</h3>
          <For each={props.snapshot().members}>
            {member => (
              <div
                class="flex items-center gap-2 py-1"
                data-testid={`member-${member.name}`}
              >
                <span
                  class="h-4 w-4 flex-shrink-0 rounded-full border border-gray-300"
                  style={{ 'background-color': member.color }}
                />
                <span
                  class={member.connected ? 'text-gray-800' : 'text-gray-400'}
                >
                  {member.name}
                </span>
                <Show when={member.isHost}>
                  <span class="rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">
                    {t('hostTag')}
                  </span>
                </Show>
                <Show when={!member.connected}>
                  <span class="text-xs text-gray-400">{t('offline')}</span>
                </Show>
              </div>
            )}
          </For>
        </div>

        <Show
          fallback={
            <p class="text-center text-sm text-gray-500">
              {t('waitingForHost')}
            </p>
          }
          when={isHost()}
        >
          <div class="space-y-2 text-center">
            <p class="text-sm text-gray-500">{t('startMultiplayerHint')}</p>
            <Show when={!configValid()}>
              <p class="text-sm text-red-500">{t('configureLLMFirst')}</p>
            </Show>
            <button
              class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
              onClick={handleStart}
            >
              {t('startGame')}
            </button>
          </div>
        </Show>

        <ConfirmButton
          confirmContent={isHost() ? t('roomDissolvedWarning') : undefined}
          onConfirm={() => {
            leaveOnline();
          }}
        >
          {t('leaveRoom')}
        </ConfirmButton>
      </div>
    </div>
  );
};

export default RoomLobby;
