import { VennArea } from "./types/game";
import * as v from "valibot";
import { generateObject } from "xsai";
import { getConfig } from "./config";
import { getGameState } from "./store/gameStore";

// 验证 LLM 返回的属性的 schema
const attributesSchema = v.object({
  attribute: v.string(),
  context: v.string(),
  word: v.string(),
});

// 验证 LLM 判断结果的 schema
const judgementSchema = v.object({
  isCorrect: v.boolean(),
  correctJudgement: v.optional(
    v.object({
      attribute: v.boolean(),
      context: v.boolean(),
      word: v.boolean(),
    }),
  ),
  explanation: v.string(),
});

/**
 * 开始新游戏
 */
export const GenerateGameAttributes = async () => {
  const config = getConfig();
  const attributes = await generateObject({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    model: config.model,
    messages: [
      {
        role: "user",
        content: `你是游戏《Thing in Rings》的上帝，请你自由发挥，为游戏生成三个中文属性，用于**模糊地**描述名词的特征。下面虽然有给出一些例子，但请你不要局限于这些例子。
word: 代表该名词英文单词的特征，可以从字母数量的范围、开头/结尾/中间的特定字母、音节数量与元音辅音数量或位置等等进行描述。例如“长度为 4-8 个字母”、“包含两个或更多不同的元音”、“以 A 到 M 之间的字母开头”等。该特征必须清晰，不可有任何歧义。
attribute: 代表人类可能对该名词抱有的相对主观感觉，这里你可以自由地发挥，可以说得非常模糊，例如“大多数人家里都有”，“通常附近有其他东西”，“可以在商店购买”，“具有历史意义”等。
context: 代表物体可能具有的相对客观特性，例如“形状不规则”，“寿命长”，“可以折叠或弯曲”，“经常发出声音”等。
好的属性应该减少歧义，并且不会出现一个属性囊括几乎所有常见名词的情况。
`,
      },
    ],
    schema: attributesSchema,
    temperature: 1.9,
  });
  console.log(attributes);
  return attributes.object;
};

/**
 * 判断物品放置是否正确
 */
export const judgeItemPlacement = async (item: { word: string; description?: string }, area: VennArea) => {
  const gameAttributes = getGameState().attributes;
  if (!gameAttributes) return;
  const config = getConfig();
  const result = await generateObject({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    model: config.model,
    messages: [
      {
        role: "system",
        content: `假设你是一个生活在中国的一般人，你正在参与一个游戏。下面是游戏中预设好的三个属性：
        1. Attribute (subjective property): ${gameAttributes.attribute}
        2. Context (objective property): ${gameAttributes.context}
        3. Word: ${gameAttributes.word}
        
        请判断某位用户对某个物品的断言是否正确，并返回其正确的属性。对于每一个属性，只能有“是”或“不是”两种情况。你还需要对你的判断作出解释。`,
      },
      {
        role: "user",
        content: `Item: "${item.word}"${item.description ? ` (${item.description})` : ""}
        用户断言 Attribute: ${area.attribute.toString()}, Context: ${area.context.toString()}, Word: ${area.word.toString()}`,
      },
    ],
    schema: judgementSchema,
    temperature: 0.3,
  });

  return result.object;
};
