import { createStore } from "solid-js/store";
import type { AreaAttributes, GameState } from "../types/game";

const initialState: GameState = {
  isStarted: false,
};

const [gameState, setGameState] = createStore<GameState>(initialState);

/**
 * 获取游戏状态
 */
export const getGameState = (): GameState => gameState;

/**
 * 重置游戏
 */
export const resetGame = (): void => {
  setGameState(initialState);
};

export const startGame = (attr: AreaAttributes): void => {
  setGameState({ isStarted: true, attributes: attr });
};
