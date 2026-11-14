import { type Component, createSignal, Show } from 'solid-js';
import { SolidMarkdown } from 'solid-markdown';
import { toast } from 'solid-toast';

import { getConfig, isConfigValid } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { GenerateGameAttributes, judgeItemPlacement } from '../llm';
import { getGameState, resetGame, startGame } from '../store/gameStore';
import type { TableItem, VennArea } from '../types/game';
import { ConfirmButton } from './common/ConfirmButton';
import { Modal } from './common/Modal';
import InputBar from './InputBar';
import { MainList } from './MainList';

interface GameProps {
  openConfigModal: () => void;
}

export const Game: Component<GameProps> = props => {
  const gameState = getGameState();
  const { language, t } = useLanguage();
  const [isStarting, setIsStarting] = createSignal(false);
  const [showGeneratedAttributes, setShowGeneratedAttributes] =
    createSignal(false);

  const [items, setItems] = createSignal<TableItem[]>([]); // 存储表格数据的数组信号

  // fake data
  // const l = [];
  // for (let i = 0; i < 20; i++) {
  //   l.push({
  //     id: i,
  //     name: " 123",
  //     description: " 456",
  //     userInput: {
  //       word: false,
  //       attribute: false,
  //       context: false,
  //     },
  //     actualResult: {
  //       word: false,
  //       attribute: false,
  //       context: false,
  //     },
  //     explanation: "123",
  //   });
  // }
  // setItems(l);

  const handleStartGame = async () => {
    if (!isConfigValid(getConfig())) {
      props.openConfigModal();
      return;
    }
    resetGame();
    setItems([]);
    setIsStarting(true);
    const attr = await GenerateGameAttributes(language());
    startGame(attr);
    setIsStarting(false);
    toast.success(t('gameStarted'));
  };

  // 处理"创建"按钮点击事件的异步函数
  const handleCreate = async (
    name: string,
    description: string,
    area: VennArea,
    callback: () => void,
  ) => {
    const userInputItem = {
      description: description,
      word: name,
    };

    try {
      const judgementResult = await judgeItemPlacement(
        language(),
        userInputItem,
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

  return (
    <div class="flex min-h-screen flex-1 flex-col justify-center overflow-visible bg-white shadow-lg">
      <Show when={!gameState.isStarted}>
        <div class="align-center mb-8 flex flex-col items-center justify-center gap-4 p-4">
          <div class="text-base text-gray-700">
            <SolidMarkdown children={t('startGameDescription')} />
          </div>
          <div class="text-sm text-gray-500">
            <SolidMarkdown children={t('announcement')} />
          </div>
          <button
            class="flex min-w-[120px] items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75"
            disabled={isStarting()}
            onClick={() => void handleStartGame()}
          >
            <Show fallback={t('startGame')} when={isStarting()}>
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t('llmGenerating')}</span>
            </Show>
          </button>
        </div>
      </Show>

      <Show when={gameState.isStarted}>
        <div class="align-center mb-8 flex flex-col items-center justify-center py-4 sm:w-auto">
          <div class="flex items-center justify-center gap-2">
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
          <div class="h-screen max-w-screen flex-1 overflow-visible">
            <InputBar
              disableButton={isStarting}
              onCreate={dispatchHandleCreate}
            />
            <MainList
              isStarting={isStarting}
              items={items}
              setItems={setItems}
            />
          </div>
        </div>
      </Show>

      <Modal
        isOpen={showGeneratedAttributes()}
        onClose={() => setShowGeneratedAttributes(false)}
        title={t('generatedAttributes')}
      >
        <ul>
          <li class="text-red-500">
            <strong>Attribute</strong>: {gameState.attributes?.attribute}
          </li>
          <li class="text-blue-500">
            <strong>Context</strong>: {gameState.attributes?.context}
          </li>
          <li class="text-yellow-500">
            <strong>Word</strong>: {gameState.attributes?.word}
          </li>
        </ul>
      </Modal>
    </div>
  );
};
