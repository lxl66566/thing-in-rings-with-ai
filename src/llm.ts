import { generateObject } from '@xsai/generate-object';
import * as v from 'valibot';

import { type ProviderId, getConfig } from './config';
import type { Language } from './i18n/translations';
import type { AreaAttributes } from './types/game';

// 验证 LLM 返回的特征的 schema
const attributesSchema = v.object({
  attribute: v.string(),
  context: v.string(),
  word: v.string(),
});

// 验证 LLM 判断结果的 schema
const judgementSchema = v.object({
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
 * xsai 硬编码 `response_format: json_schema`，但部分 OpenAI 兼容服务不支持该
 * 类型（DeepSeek 返回 400 "This response_format type is unavailable now"，
 * 仅支持 `json_object`）。对这些 provider 用自定义 fetch 把请求改写为 JSON
 * 模式，并把 schema 描述追加到 system 消息里；业务 prompt/schema 完全不动。
 */
const JSON_SCHEMA_UNSUPPORTED_PROVIDERS: ReadonlySet<ProviderId> = new Set([
  'deepseek',
]);

interface ChatCompletionBody {
  [key: string]: unknown;
  messages: { content: unknown; role: string }[];
  response_format?: {
    json_schema?: { schema?: unknown };
    type?: string;
  };
}

// `json_object` 模式只保证"是合法 JSON"，不保证符合 schema，且偶发残缺输出
// （真机遇到一次截断导致 JSON.parse 失败），所以对改写后的请求做一次重试。
const isParseableChatCompletionJSON = async (
  response: Response,
): Promise<boolean> => {
  try {
    const completion = JSON.parse(await response.clone().text()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = completion.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return false;
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
};

const jsonModeFetch: typeof fetch = async (input, init) => {
  const body = typeof init?.body === 'string' ? init.body : undefined;
  if (body === undefined) return fetch(input, init);
  const request = JSON.parse(body) as ChatCompletionBody;
  const schema = request.response_format?.json_schema?.schema;
  if (request.response_format?.type !== 'json_schema' || schema === undefined) {
    return fetch(input, init);
  }
  const rewrittenBody = JSON.stringify({
    ...request,
    messages: [
      ...request.messages,
      {
        content: `Respond with a single JSON object and nothing else. The object must conform to this JSON Schema: ${JSON.stringify(schema)}`,
        role: 'system',
      },
    ],
    response_format: { type: 'json_object' },
  });
  const requestInit: RequestInit = { ...init, body: rewrittenBody };
  const response = await fetch(input, requestInit);
  if (!response.ok || (await isParseableChatCompletionJSON(response))) {
    return response;
  }
  return fetch(input, requestInit);
};

/** Per-provider fetch; `undefined` keeps xsai's default global fetch. */
const fetchForProvider = (provider: ProviderId): typeof fetch | undefined =>
  JSON_SCHEMA_UNSUPPORTED_PROVIDERS.has(provider) ? jsonModeFetch : undefined;

/**
 * 开始新游戏
 */
export const GenerateGameAttributes = async (
  lang: Language,
): Promise<{
  attribute: string;
  context: string;
  word: string;
}> => {
  const config = getConfig();

  const prompt =
    lang === 'zh'
      ? `你是游戏《Thing in Rings》的上帝，请你自由发挥，为游戏生成三个中文特征，用于**模糊地**描述名词的特征。好的特征应该减少歧义，并且不会出现一个特征囊括几乎所有常见名词的情况。下面虽然有给出一些例子，但请你不要局限于这些例子。
word: 代表该名词英文单词的特征，可以从字母数量的范围、开头/结尾/中间的特定字母、音节数量与元音辅音数量或位置等等进行描述。例如“长度为 4-8 个字母”、“包含两个或更多不同的元音”、“以 A 到 M 之间的字母开头”等。该特征必须清晰，不可有任何歧义。
attribute: 代表人类可能对该名词抱有的相对主观感觉，这里你可以自由地发挥，可以说得非常模糊，例如“大多数人家里都有”，“通常附近有其他东西”，“可以在商店购买”，“具有历史意义”等。
context: 代表物体可能具有的相对客观特性，例如“形状不规则”，“寿命长”，“可以折叠或弯曲”，“经常发出声音”等。
`
      : `You are the god of the game "Thing in Rings." Please freely generate three English characteristics to **vaguely** describe the features of nouns. Good characteristics should reduce ambiguity and avoid situations where one characteristic encompasses almost all common nouns. Although some examples are provided below, please do not limit yourself to them.  

word: Represents the characteristics of the noun's English word, which can be described based on the range of letter counts, specific letters at the beginning/end/middle, syllable count, vowel/consonant count or position, etc. For example, "4-8 letters long," "contains two or more different vowels," "starts with a letter between A and M," etc. This characteristic must be clear and free of any ambiguity.  
attribute: Represents the relatively subjective feelings humans might have about the noun. Here, you can freely express yourself, being as vague as you like. For example, "most people have it at home," "usually found near other things," "can be bought in stores," "has historical significance," etc.  
context: Represents the relatively objective properties the object might have. For example, "irregularly shaped," "long lifespan," "can be folded or bent," "often makes sounds," etc.
`;
  const attributes = await generateObject({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    fetch: fetchForProvider(config.provider),
    messages: [
      {
        content: prompt,
        role: 'user',
      },
    ],
    model: config.model,
    schema: attributesSchema,
    temperature: 1.9,
  });
  console.log(attributes);
  return attributes.object;
};

/**
 * 判断名词放置是否正确
 */
export const judgeItemPlacement = async (
  lang: Language,
  item: { description?: string; word: string },
  gameAttributes: AreaAttributes,
): Promise<
  | undefined
  | {
      correctJudgement?:
        | undefined
        | {
            attribute: boolean;
            context: boolean;
            word: boolean;
          };
      explanation: string;
    }
> => {
  const prompt =
    lang === 'zh'
      ? `假设你是一个生活在中国的一般人，正在一个游戏里当裁判。下面是游戏中预设好的三个特征：
1. Attribute: ${gameAttributes.attribute}
2. Context: ${gameAttributes.context}
3. Word: ${gameAttributes.word}

你拥有绝对的理性，请：
1. 判断给出的名词实际上是否符合这些游戏特征。对于每一个特征，只能有“符合”或“不符合”两种结果。
2. 对你的判断作出中文解释。`
      : `Assume you are an ordinary person living in USA, serving as a referee in a game. Below are the three preset characteristics in the game:  
1. Attribute: ${gameAttributes.attribute}  
2. Context: ${gameAttributes.context}  
3. Word: ${gameAttributes.word}  

You possess absolute rationality. Please:  
1. Assess whether the noun actually matches these game characteristics. For each characteristic, the only possible results are "matches" or "does not match."  
2. Provide an English explanation for your judgment.
`;
  const config = getConfig();
  const result = await generateObject({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    fetch: fetchForProvider(config.provider),
    messages: [
      {
        content: prompt,
        role: 'system',
      },
      {
        content: `Item: "${item.word}"${item.description ? ` (${item.description})` : ''}`,
        role: 'user',
      },
    ],
    model: config.model,
    schema: judgementSchema,
    temperature: 0.1,
  });

  return result.object;
};
