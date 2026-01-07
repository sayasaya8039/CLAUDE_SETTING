import { DEFAULT_SETTINGS, type StorageSettings } from "@/types";

const STORAGE_KEY = "x_thread_maker_settings";

/**
 * 設定を保存
 */
export async function saveSettings(
  settings: Partial<StorageSettings>
): Promise<void> {
  const current = await loadSettings();
  const updated = { ...current, ...settings };

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * 設定を読み込み
 */
export async function loadSettings(): Promise<StorageSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const settings = result[STORAGE_KEY] || {};
      resolve({ ...DEFAULT_SETTINGS, ...settings });
    });
  });
}

/**
 * APIキーを保存
 */
export async function saveApiKey(
  provider: StorageSettings["llmConfig"]["provider"],
  apiKey: string
): Promise<void> {
  const settings = await loadSettings();
  settings.llmConfig = {
    ...settings.llmConfig,
    provider,
    apiKey,
  };
  await saveSettings(settings);
}

/**
 * 履歴を保存（最大10件）
 */
export async function saveHistory(
  content: string,
  posts: string[]
): Promise<void> {
  const HISTORY_KEY = "x_thread_maker_history";
  const MAX_HISTORY = 10;

  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_KEY], (result) => {
      const history = result[HISTORY_KEY] || [];

      history.unshift({
        id: Date.now(),
        content: content.slice(0, 200),
        posts,
        createdAt: new Date().toISOString(),
      });

      // 最大件数を超えたら古いものを削除
      if (history.length > MAX_HISTORY) {
        history.pop();
      }

      chrome.storage.local.set({ [HISTORY_KEY]: history }, resolve);
    });
  });
}

/**
 * 履歴を取得
 */
export async function loadHistory(): Promise<
  Array<{
    id: number;
    content: string;
    posts: string[];
    createdAt: string;
  }>
> {
  const HISTORY_KEY = "x_thread_maker_history";

  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_KEY], (result) => {
      resolve(result[HISTORY_KEY] || []);
    });
  });
}
