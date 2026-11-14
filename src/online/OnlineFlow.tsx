import {
  Match,
  onMount,
  Show,
  Switch,
  type Component,
  createEffect,
  createSignal,
  on,
} from 'solid-js';
import toast from 'solid-toast';

import { useLanguage } from '../i18n/LanguageContext';
import { GenerateGameAttributes } from '../llm';
import {
  connectOnline,
  getLastError,
  getRoomClosedSeq,
  getSnapshot,
  getYouId,
  sendGenerationFailed,
  sendGenerationResult,
} from '../store/onlineStore';
import { errorCodeToastKey } from './errorToast';
import OnlineGame from './OnlineGame';
import OnlineMenu from './OnlineMenu';
import RoomLobby from './RoomLobby';

interface OnlineFlowProps {
  onBack: () => void;
  openConfigModal: () => void;
}

export const OnlineFlow: Component<OnlineFlowProps> = props => {
  const { language, t } = useLanguage();
  const [generationHandled, setGenerationHandled] = createSignal(false);

  onMount(() => {
    connectOnline();
  });

  // Surface server error codes as translated toasts.
  createEffect(
    on(getLastError, error => {
      if (error) {
        toast.error(t(errorCodeToastKey[error.code]));
      }
    }),
  );
  createEffect(
    on(getRoomClosedSeq, seq => {
      if (seq > 0) {
        toast.error(t('roomClosedReason'));
      }
    }),
  );

  // Only the host's client talks to the LLM: when the server marks the room
  // as generating, the host generates attributes and returns them. The flag
  // is reset whenever the phase leaves `generating` (result, failure, or
  // restart), so a re-broadcast never triggers a duplicate generation.
  createEffect(() => {
    const snapshot = getSnapshot();
    if (!snapshot || snapshot.phase !== 'generating') {
      setGenerationHandled(false);
      return;
    }
    const isHost = getYouId() !== undefined && getYouId() === snapshot.hostId;
    if (!isHost || generationHandled()) {
      return;
    }
    setGenerationHandled(true);
    const run = async (): Promise<void> => {
      try {
        const attributes = await GenerateGameAttributes(language());
        sendGenerationResult(attributes);
      } catch (error) {
        // Everyone learns about the failure via the server's error broadcast.
        sendGenerationFailed(
          error instanceof Error ? error.message : 'unknown error',
        );
      }
    };
    void run();
  });

  return (
    <Show fallback={<OnlineMenu onBack={props.onBack} />} when={getSnapshot()}>
      {snapshot => (
        <Switch>
          <Match when={snapshot().phase === 'lobby'}>
            <RoomLobby
              openConfigModal={props.openConfigModal}
              snapshot={snapshot}
            />
          </Match>
          <Match when={snapshot().phase !== 'lobby'}>
            <OnlineGame snapshot={snapshot} />
          </Match>
        </Switch>
      )}
    </Show>
  );
};

export default OnlineFlow;
