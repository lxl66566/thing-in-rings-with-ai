import type { AreaAttributes, VennArea } from '../../shared/protocol';

/**
 * Wire types shared with the server; see shared/protocol.ts.
 */
export type { AreaAttributes, VennArea };

/**
 * 游戏状态
 */
export interface GameState {
  attributes?: AreaAttributes;
  isStarted: boolean;
}

/**
 * LLM 判断结果的类型
 */
export interface JudgementResult {
  correctArea?: VennArea;
  explanation: string;
}

// 定义表格中每个条目的类型
// 包含用户输入的值和异步函数返回的实际值
export interface TableItem {
  actualResult?: VennArea; // 异步函数返回的实际VennArea值，判定中时为空
  color?: string; // 条目的颜色
  description: string;
  explanation: string;
  id: number; // 用于列表渲染的唯一key
  name: string;
  userInput: VennArea; // 用户输入时的VennArea值
}
