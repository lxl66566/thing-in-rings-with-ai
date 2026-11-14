/**
 * 游戏中的区域属性类型
 */
export interface AreaAttributes {
  attribute: string; // 物品的主观属性
  context: string; // 物品的客观属性
  word: string; // 物品英文单词的特征
}

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
  actualResult: VennArea; // 异步函数返回的实际VennArea值
  color?: string; // 条目的颜色
  description: string;
  explanation: string;
  id: number; // 用于列表渲染的唯一key
  name: string;
  userInput: VennArea; // 用户输入时的VennArea值
}

/**
 * Venn 图中的区域
 */
export interface VennArea {
  attribute: boolean;
  context: boolean;
  word: boolean;
}
