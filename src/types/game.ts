/**
 * 游戏中的区域属性类型
 */
export type AreaAttributes = {
  attribute: string; // 物品的主观属性
  context: string; // 物品的客观属性
  word: string; // 物品英文单词的特征
};

/**
 * Venn 图中的区域
 */
export type VennArea = {
  attribute: boolean;
  context: boolean;
  word: boolean;
};

/**
 * 游戏状态
 */
export type GameState = {
  isStarted: boolean;
  attributes?: AreaAttributes;
};

/**
 * LLM 判断结果的类型
 */
export type JudgementResult = {
  isCorrect: boolean;
  correctArea?: VennArea;
  explanation: string;
};

// 定义表格中每个条目的类型
// 包含用户输入的值和异步函数返回的实际值
export type TableItem = {
  id: number; // 用于列表渲染的唯一key
  name: string;
  description: string;
  color?: string; // 条目的颜色
  userInput: VennArea; // 用户输入时的VennArea值
  actualResult: VennArea; // 异步函数返回的实际VennArea值
  explanation: string;
};
