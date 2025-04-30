import { Component, createSignal, Show } from "solid-js";
import { useLanguage } from "../i18n/LanguageContext";
import { toast } from "solid-toast";
import { MainList } from "./MainList";
import { getGameState, resetGame, startGame } from "../store/gameStore";
import { GenerateGameAttributes } from "../llm";
import { SolidMarkdown } from "solid-markdown";
import { getConfig, isConfigValid } from "../config";

interface GameProps {
  openConfigModal: () => void;
}

export const Game: Component<GameProps> = (props) => {
  const gameState = getGameState();
  const { t } = useLanguage();
  const [isStarting, setIsStarting] = createSignal(false);

  const handleStartGame = async () => {
    if (!isConfigValid(getConfig())) {
      props.openConfigModal();
      return;
    }
    resetGame();
    setIsStarting(true);
    const attr = await GenerateGameAttributes();
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
        <div class="flex flex-col align-center justify-center items-center mb-8">
          <div class="flex items-center justify-center gap-2">
            <button
              disabled={isStarting()}
              onClick={handleStartGame}
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
            >
              <Show when={isStarting()} fallback={t("restartGame")}>
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("llmGenerating")}</span>
              </Show>
            </button>
          </div>
          <div class="flex-1">
            <MainList />
          </div>
        </div>
      </Show>
    </div>
  );
};
