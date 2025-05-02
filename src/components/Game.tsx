import { Component, createSignal, Show } from "solid-js";
import { useLanguage } from "../i18n/LanguageContext";
import { toast } from "solid-toast";
import { MainList } from "./MainList";
import { getGameState, resetGame, startGame } from "../store/gameStore";
import { GenerateGameAttributes } from "../llm";
import { SolidMarkdown } from "solid-markdown";
import { getConfig, isConfigValid } from "../config";
import { Modal } from "./common/Modal";
import { ConfirmButton } from "./common/ConfirmButton";
import { TableItem } from "../types/game";

interface GameProps {
  openConfigModal: () => void;
}

export const Game: Component<GameProps> = (props) => {
  const gameState = getGameState();
  const { t, language } = useLanguage();
  const [isStarting, setIsStarting] = createSignal(false);
  const [showGeneratedAttributes, setShowGeneratedAttributes] = createSignal(false);

  const [items, setItems] = createSignal<TableItem[]>([]); // 存储表格数据的数组信号

  const handleStartGame = async () => {
    if (!isConfigValid(getConfig())) {
      props.openConfigModal();
      return;
    }
    resetGame();
    setItems([]);
    setIsStarting(true);
    const attr = await GenerateGameAttributes(language);
    startGame(attr);
    setIsStarting(false);
    toast.success(t("gameStarted"));
  };

  return (
    <div class="min-h-screen flex flex-col justify-center bg-white shadow-lg">
      <Show when={!gameState.isStarted}>
        <div class="flex flex-col align-center justify-center items-center mb-8 p-8 gap-4">
          <div class="text-gray-700 text-base">
            <SolidMarkdown children={t("startGameDescription")} />
          </div>
          <div class="text-gray-500 text-sm">
            <SolidMarkdown children={t("announcement")} />
          </div>
          <button
            disabled={isStarting()}
            onClick={handleStartGame}
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
          >
            <Show when={isStarting()} fallback={t("startGame")}>
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t("llmGenerating")}</span>
            </Show>
          </button>
        </div>
      </Show>

      <Show when={gameState.isStarted}>
        <div class="flex flex-col align-center justify-center items-center mb-8 py-4">
          <div class="flex items-center justify-center gap-2">
            <ConfirmButton
              children={isStarting() ? t("llmGenerating") : t("restartGame")}
              onConfirm={() => handleStartGame()}
              disabled={isStarting()}
            ></ConfirmButton>
            <ConfirmButton children={t("showGeneratedAttributes")} onConfirm={() => setShowGeneratedAttributes(true)}></ConfirmButton>
          </div>
          <div class="flex-1">
            <MainList items={items} setItems={setItems} isStarting={isStarting} />
          </div>
        </div>
      </Show>
      <Modal isOpen={showGeneratedAttributes()} onClose={() => setShowGeneratedAttributes(false)} title={t("generatedAttributes")}>
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
