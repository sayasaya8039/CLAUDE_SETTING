// スレッドの1つのポスト
export interface ThreadPost {
  id: string;
  content: string;
  charCount: number;
  isOverLimit: boolean;
}

// スレッド全体
export interface Thread {
  posts: ThreadPost[];
  totalPosts: number;
  originalContent: string;
  source: ContentSource;
}

// コンテンツのソース
export type ContentSource = "note" | "youtube" | "manual" | "clipboard";

// LLM設定
export interface LLMConfig {
  provider: "openai" | "anthropic" | "gemini";
  apiKey: string;
  model: string;
}

// ストレージに保存する設定
export interface StorageSettings {
  llmConfig: LLMConfig;
  maxCharsPerPost: number;
  includeNumbering: boolean;
  autoAddContinue: boolean;
}

// メッセージタイプ
export type MessageType =
  | { type: "GET_NOTE_CONTENT" }
  | { type: "GET_YOUTUBE_CONTENT" }
  | { type: "INSERT_TO_X"; payload: { content: string } }
  | { type: "INSERT_THREAD_TO_X"; payload: { posts: string[] } }
  | { type: "CONTENT_RESULT"; payload: { content: string; title: string } };

// デフォルト設定
export const DEFAULT_SETTINGS: StorageSettings = {
  llmConfig: {
    provider: "anthropic",
    apiKey: "",
    model: "claude-sonnet-4-20250514",
  },
  maxCharsPerPost: 140,
  includeNumbering: true,
  autoAddContinue: true,
};

// X (Twitter) の文字数制限
export const X_CHAR_LIMITS = {
  standard: 280,
  japanese: 140, // 日本語は実質140字程度が読みやすい
  withMedia: 280,
} as const;
