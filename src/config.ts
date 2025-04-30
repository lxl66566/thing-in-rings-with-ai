// LLM 配置的类型定义
export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

// 默认配置
export const defaultConfig: LLMConfig = {
  apiKey: "",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  model: "gemini-2.5-flash-preview-04-17",
};

// localStorage 中存储配置的 key
const CONFIG_KEY = "llm_config";

// 从 localStorage 获取配置
export function getConfig(): LLMConfig {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) {
    return defaultConfig;
  }
  try {
    return JSON.parse(stored) as LLMConfig;
  } catch {
    return defaultConfig;
  }
}

// 保存配置到 localStorage
export function saveConfig(config: LLMConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// 验证配置是否完整
export function isConfigValid(config: LLMConfig): boolean {
  return Boolean(config.apiKey && config.baseURL && config.model);
}
