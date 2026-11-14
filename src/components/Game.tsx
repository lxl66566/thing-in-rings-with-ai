import { type Component, createSignal, Show } from 'solid-js';
import { SolidMarkdown } from 'solid-markdown';
import { toast } from 'solid-toast';

import { getConfig, isConfigValid } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { GenerateGameAttributes, judgeItemPlacement } from '../llm';
import { getGameState, resetGame, startGame } from '../store/gameStore';
import type { TableItem, VennArea } from '../types/game';
import { ConfirmButton } from './common/ConfirmButton';
import { GeneratedAttributesModal } from './GeneratedAttributesModal';
import InputBar from './InputBar';
import { MainList } from './MainList';

interface GameProps {
  onEnterMultiplayer: () => void;
  openConfigModal: () => void;
}

export const Game: Component<GameProps> = props => {
  const gameState = getGameState();
  const { language, t } = useLanguage();
  const [isStarting, setIsStarting] = createSignal(false);
  const [showGeneratedAttributes, setShowGeneratedAttributes] =
    createSignal(false);

  const [items, setItems] = createSignal<TableItem[]>([]); // 存储表格数据的数组信号

  const handleStartGame = async () => {
    if (!isConfigValid(getConfig())) {
      props.openConfigModal();
      return;
    }
    resetGame();
    setItems([]);
    setIsStarting(true);
    try {
      const attr = await GenerateGameAttributes(language());
      startGame(attr);
      toast.success(t('gameStarted'));
    } catch (error) {
      console.error('Error starting the game:', error);
      toast.error(t('startFailed'));
    } finally {
      setIsStarting(false);
    }
  };

  // 处理"创建"按钮点击事件的异步函数
  const handleCreate = async (
    name: string,
    description: string,
    area: VennArea,
    callback: () => void,
  ) => {
    const attributes = gameState.attributes;
    if (!attributes) return;
    const userInputItem = {
      description: description,
      word: name,
    };

    try {
      const judgementResult = await judgeItemPlacement(
        language(),
        userInputItem,
        attributes,
      );
      const actualResult = judgementResult?.correctJudgement;

      if (!actualResult) {
        toast.error('Incorrect judgement');
        return;
      }

      const newItem: TableItem = {
        actualResult: actualResult,
        color: '#FFFFFF', // 默认颜色
        description: description,
        explanation: judgementResult.explanation || t('noExplanation'),
        id: Date.now(),
        name: name,
        userInput: area,
      };
      setItems(prev => [...prev, newItem]);
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      callback();
    }
  };
  const dispatchHandleCreate = (
    name: string,
    description: string,
    area: VennArea,
    callback: () => void,
  ) => {
    void handleCreate(name, description, area, callback);
  };

  const updateItemColor = (itemId: number, newColor: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, color: newColor } : item,
      ),
    );
  };

  return (
    <div class="flex flex-1 flex-col overflow-visible bg-white shadow-lg">
      <Show when={!gameState.isStarted}>
        <div class="my-auto flex flex-col items-center justify-center gap-4 p-4 sm:py-8">
          <div class="text-base text-gray-700">
            <SolidMarkdown children={t('startGameDescription')} />
          </div>
          <div class="text-sm text-gray-500">
            <SolidMarkdown children={t('announcement')} />
          </div>
          <button
            class="flex min-w-30 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75 sm:py-2"
            disabled={isStarting()}
            onClick={() => void handleStartGame()}
          >
            <Show fallback={t('startGame')} when={isStarting()}>
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t('llmGenerating')}</span>
            </Show>
          </button>
          <button
            class="rounded-md bg-white px-4 py-2 text-indigo-600 shadow transition-colors hover:bg-gray-50 sm:py-2"
            onClick={() => {
              props.onEnterMultiplayer();
            }}
          >
            {t('multiplayer')}
          </button>
        </div>
      </Show>

      <Show when={gameState.isStarted}>
        <div class="flex flex-1 flex-col gap-4 py-2 sm:py-4">
          <div class="flex flex-wrap items-center justify-center gap-2">
            <ConfirmButton
              children={isStarting() ? t('llmGenerating') : t('restartGame')}
              disabled={isStarting()}
              onConfirm={() => void handleStartGame()}
            />
            <ConfirmButton
              children={t('showGeneratedAttributes')}
              onConfirm={() => setShowGeneratedAttributes(true)}
            />
          </div>
          <div class="min-w-0 flex-1">
            <InputBar
              disableButton={isStarting}
              onCreate={dispatchHandleCreate}
            />
            <MainList items={items} onItemColorChange={updateItemColor} />
          </div>
        </div>
      </Show>

      <GeneratedAttributesModal
        attributes={gameState.attributes}
        isOpen={showGeneratedAttributes()}
        onClose={() => setShowGeneratedAttributes(false)}
      />
    </div>
  );
};
