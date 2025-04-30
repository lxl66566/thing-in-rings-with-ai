import { createStore } from "solid-js/store";
import { AreaAttributes, GameState } from "../types/game";

const initialState: GameState = {
  isStarted: false,
};

const [gameState, setGameState] = createStore<GameState>(initialState);

/**
 * 获取游戏状态
 */
export const getGameState = () => gameState;

/**
 * 重置游戏
 */
export const resetGame = () => {
  setGameState(initialState);
};

export const startGame = (attr: AreaAttributes) => {
  setGameState({ isStarted: true, attributes: attr });
};
