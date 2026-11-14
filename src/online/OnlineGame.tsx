import {
  createEffect,
  createSignal,
  For,
  Show,
  type Accessor,
  type Component,
} from 'solid-js';

import type {
  AreaAttributes,
  RoomEntry,
  RoomSnapshot,
} from '../../shared/protocol';
import { ConfirmButton } from '../components/common/ConfirmButton';
import { GeneratedAttributesModal } from '../components/GeneratedAttributesModal';
import InputBar from '../components/InputBar';
import { MainList } from '../components/MainList';
import { useLanguage } from '../i18n/LanguageContext';
import { judgeItemPlacement } from '../llm';
import {
  getYouId,
  leaveOnline,
  restartGame,
  sendJudgementFailed,
  sendJudgementResult,
  skipPlayer,
  submitItem,
} from '../store/onlineStore';
import type { TableItem, VennArea } from '../types/game';

interface OnlineGameProps {
  snapshot: Accessor<RoomSnapshot>;
}

export const OnlineGame: Component<OnlineGameProps> = props => {
  const { language, t } = useLanguage();
  const [showAttributes, setShowAttributes] = createSignal(false);
  const [judgedEntryId, setJudgedEntryId] = createSignal<number | undefined>(
    undefined,
  );
  const [colorOverrides, setColorOverrides] = createSignal<
    Record<number, string>
  >({});

  const isHost = () => {
    const you = getYouId();
    return you !== undefined && you === props.snapshot().hostId;
  };
  const myTurn = () => {
    const you = getYouId();
    return you !== undefined && props.snapshot().currentTurnPlayerId === you;
  };
  const pendingEntry = () =>
    props.snapshot().entries.find(entry => entry.pending);
  const currentTurnName = () => {
    const snapshot = props.snapshot();
    const current = snapshot.members.find(
      member => member.id === snapshot.currentTurnPlayerId,
    );
    return current?.name ?? '';
  };

  // Only the host's client talks to the LLM: judge the pending entry, then
  // return the result to the server. Tracking the entry id keeps this from
  // re-running while the snapshot is re-broadcast before the resolution.
  createEffect(() => {
    const snapshot = props.snapshot();
    if (!isHost()) return;
    const pending = pendingEntry();
    const attributes = snapshot.attributes;
    if (!pending || pending.id === judgedEntryId() || !attributes) {
      return;
    }
    setJudgedEntryId(pending.id);
    void runJudgement(pending, attributes);
  });

  const runJudgement = async (
    pending: RoomEntry,
    attributes: AreaAttributes,
  ): Promise<void> => {
    try {
      const result = await judgeItemPlacement(
        language(),
        {
          description:
            pending.description === '' ? undefined : pending.description,
          word: pending.word,
        },
        attributes,
      );
      if (result?.correctJudgement) {
        sendJudgementResult(
          pending.id,
          result.correctJudgement,
          result.explanation,
        );
      } else {
        sendJudgementFailed(pending.id, 'no judgement returned');
      }
    } catch (error) {
      sendJudgementFailed(
        pending.id,
        error instanceof Error ? error.message : 'unknown error',
      );
    }
  };

  const items = (): TableItem[] =>
    props.snapshot().entries.map(entry => {
      const overrides = colorOverrides();
      const memberColor = props
        .snapshot()
        .members.find(member => member.id === entry.playerId)?.color;
      return {
        actualResult: entry.actual,
        color: overrides[entry.id] ?? memberColor,
        description: entry.description,
        explanation: entry.explanation ?? '',
        id: entry.id,
        name: entry.word,
        userInput: entry.guesses,
      };
    });

  const handleCreate = (
    name: string,
    description: string,
    area: VennArea,
    callback: () => void,
  ) => {
    submitItem(name, description, area);
    callback();
  };

  const handleColorChange = (itemId: number, color: string): void => {
    setColorOverrides(prev => ({ ...prev, [itemId]: color }));
  };

  return (
    <div class="flex flex-1 flex-col gap-4 py-2 sm:py-4">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <span
          class="rounded px-3 py-1.5 text-sm font-medium"
          classList={{
            'bg-indigo-600 text-white': myTurn(),
            'bg-white text-gray-700 shadow': !myTurn(),
          }}
          data-testid="turn-status"
        >
          {myTurn()
            ? t('yourTurn')
            : `${t('currentTurn')}: ${currentTurnName()}`}
        </span>
        <Show when={pendingEntry()}>
          <span class="text-sm text-gray-500">{t('judging')}</span>
        </Show>
        <Show when={isHost()}>
          <ConfirmButton
            children={t('skipPlayer')}
            disabled={pendingEntry() !== undefined}
            onConfirm={skipPlayer}
          />
          <ConfirmButton children={t('restartGame')} onConfirm={restartGame} />
        </Show>
        <ConfirmButton
          children={t('showGeneratedAttributes')}
          onConfirm={() => {
            setShowAttributes(true);
          }}
        />
        <ConfirmButton
          children={t('leaveRoom')}
          confirmContent={isHost() ? t('roomDissolvedWarning') : undefined}
          onConfirm={() => {
            leaveOnline();
          }}
        />
      </div>
      <div
        class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
        data-testid="members"
      >
        <For each={props.snapshot().members}>
          {member => (
            <span
              class="flex items-center gap-1 text-xs"
              data-testid={`member-${member.name}`}
            >
              <span
                class="h-3 w-3 rounded-full border border-gray-300"
                style={{ 'background-color': member.color }}
              />
              <span
                classList={{
                  'text-gray-400': !member.connected,
                  'text-gray-800': member.connected,
                }}
              >
                {member.name}
              </span>
              <Show when={!member.connected}>
                <span class="text-gray-400">({t('offline')})</span>
              </Show>
            </span>
          )}
        </For>
      </div>
      <div class="min-w-0 flex-1">
        <Show
          fallback={
            <div class="flex flex-col items-center gap-3 py-8">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span class="text-sm text-gray-600">{t('llmGenerating')}</span>
            </div>
          }
          when={props.snapshot().phase === 'playing'}
        >
          <InputBar
            disableButton={() => !myTurn() || pendingEntry() !== undefined}
            onCreate={handleCreate}
          />
          <MainList items={items} onItemColorChange={handleColorChange} />
        </Show>
      </div>

      <GeneratedAttributesModal
        attributes={props.snapshot().attributes}
        isOpen={showAttributes()}
        onClose={() => {
          setShowAttributes(false);
        }}
      />
    </div>
  );
};

export default OnlineGame;
