import type { LLMConfig } from "@/types";

interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
}

/**
 * LLM APIを使用してコンテンツを要約・分割
 */
export async function summarizeContent(
  content: string,
  config: LLMConfig,
  targetLength: number = 1000
): Promise<SummarizeResponse> {
  const prompt = `以下のコンテンツをX（Twitter）のスレッド投稿用に要約してください。

要件:
- 全体で${targetLength}文字程度に要約
- 重要なポイントを箇条書きで5つ程度抽出
- 日本語で出力
- 読者の興味を引く内容に

コンテンツ:
${content}

出力形式:
{
  "summary": "要約文",
  "keyPoints": ["ポイント1", "ポイント2", ...]
}`;

  switch (config.provider) {
    case "anthropic":
      return callAnthropicAPI(prompt, config);
    case "openai":
      return callOpenAIAPI(prompt, config);
    case "gemini":
      return callGeminiAPI(prompt, config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Anthropic Claude API呼び出し
 */
async function callAnthropicAPI(
  prompt: string,
  config: LLMConfig
): Promise<SummarizeResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  return parseJSONResponse(text);
}

/**
 * OpenAI API呼び出し
 */
async function callOpenAIAPI(
  prompt: string,
  config: LLMConfig
): Promise<SummarizeResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  return parseJSONResponse(text);
}

/**
 * Google Gemini API呼び出し
 */
async function callGeminiAPI(
  prompt: string,
  config: LLMConfig
): Promise<SummarizeResponse> {
  const model = config.model || "gemini-2.0-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  return parseJSONResponse(text);
}

/**
 * JSONレスポンスをパース
 */
function parseJSONResponse(text: string): SummarizeResponse {
  try {
    // JSONブロックを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found in response");
  } catch {
    // パースできない場合はデフォルト値を返す
    return {
      summary: text.slice(0, 1000),
      keyPoints: [],
    };
  }
}

/**
 * テキストをスレッド用に最適化
 */
export async function optimizeForThread(
  content: string,
  config: LLMConfig,
  maxCharsPerPost: number
): Promise<string[]> {
  const prompt = `以下のコンテンツをX（Twitter）のスレッド形式に変換してください。

要件:
- 各ポストは${maxCharsPerPost}文字以内
- 読みやすく、興味を引く内容に
- 適切な箇所で区切る
- 日本語で出力
- JSON配列形式で出力

コンテンツ:
${content}

出力形式:
["ポスト1の内容", "ポスト2の内容", ...]`;

  let text: string;

  switch (config.provider) {
    case "anthropic": {
      const response = await callAnthropicAPI(prompt, config);
      text = JSON.stringify(response);
      break;
    }
    case "openai": {
      const response = await callOpenAIAPI(prompt, config);
      text = JSON.stringify(response);
      break;
    }
    case "gemini": {
      const response = await callGeminiAPI(prompt, config);
      text = JSON.stringify(response);
      break;
    }
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }

  try {
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    return [content];
  } catch {
    return [content];
  }
}
