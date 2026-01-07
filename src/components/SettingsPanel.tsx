import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";
import type { StorageSettings } from "@/types";

interface SettingsPanelProps {
  settings: StorageSettings;
  onClose: () => void;
  onUpdateSettings: (updates: Partial<StorageSettings>) => Promise<void>;
}

export function SettingsPanel({
  settings,
  onClose,
  onUpdateSettings,
}: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState(settings.llmConfig.apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateSettings({
      llmConfig: { ...settings.llmConfig, apiKey },
    });
    setIsSaving(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-x-light rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-x-gray" />
        </button>
        <h2 className="font-bold text-x-black">設定</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* LLM設定 */}
        <section className="space-y-4">
          <h3 className="font-bold text-sm text-x-black">AI設定</h3>

          {/* プロバイダー選択 */}
          <div className="space-y-2">
            <label className="text-sm text-x-gray">プロバイダー</label>
            <div className="grid grid-cols-3 gap-2">
              {(["anthropic", "openai", "gemini"] as const).map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      llmConfig: {
                        ...settings.llmConfig,
                        provider,
                        model: getDefaultModel(provider),
                      },
                    })
                  }
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    settings.llmConfig.provider === provider
                      ? "border-x-blue bg-blue-50 text-x-blue"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {getProviderLabel(provider)}
                </button>
              ))}
            </div>
          </div>

          {/* APIキー */}
          <div className="space-y-2">
            <label className="text-sm text-x-gray">APIキー</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${getProviderLabel(settings.llmConfig.provider)} APIキーを入力`}
                className="w-full p-3 pr-20 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-x-blue"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1.5 hover:bg-gray-100 rounded"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4 text-x-gray" />
                  ) : (
                    <Eye className="w-4 h-4 text-x-gray" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-1.5 hover:bg-blue-100 rounded text-x-blue"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-x-gray">
              AI要約機能を使用するにはAPIキーが必要です
            </p>
          </div>
        </section>

        {/* スレッド設定 */}
        <section className="space-y-4">
          <h3 className="font-bold text-sm text-x-black">スレッド設定</h3>

          {/* 最大文字数 */}
          <div className="space-y-2">
            <label className="text-sm text-x-gray">
              1ポストあたりの最大文字数
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={100}
                max={280}
                step={10}
                value={settings.maxCharsPerPost}
                onChange={(e) =>
                  onUpdateSettings({
                    maxCharsPerPost: Number(e.target.value),
                  })
                }
                className="flex-1"
              />
              <span className="w-12 text-right font-mono text-sm">
                {settings.maxCharsPerPost}
              </span>
            </div>
            <p className="text-xs text-x-gray">
              日本語の場合は140字程度が読みやすくおすすめです
            </p>
          </div>

          {/* 番号付け */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-x-black">番号付け</label>
              <p className="text-xs text-x-gray">1/5, 2/5 のように表示</p>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  includeNumbering: !settings.includeNumbering,
                })
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.includeNumbering ? "bg-x-blue" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.includeNumbering ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* 続きマーカー */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-x-black">続きマーカー</label>
              <p className="text-xs text-x-gray">末尾に → を追加</p>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  autoAddContinue: !settings.autoAddContinue,
                })
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoAddContinue ? "bg-x-blue" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.autoAddContinue ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* 情報 */}
        <section className="space-y-2 pt-4 border-t border-gray-200">
          <h3 className="font-bold text-sm text-x-black">情報</h3>
          <div className="text-xs text-x-gray space-y-1">
            <p>X Thread Maker v1.0.0</p>
            <p>note記事やYouTube動画の要約をスレッド形式で投稿支援</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function getProviderLabel(
  provider: StorageSettings["llmConfig"]["provider"]
): string {
  const labels = {
    anthropic: "Claude",
    openai: "OpenAI",
    gemini: "Gemini",
  };
  return labels[provider];
}

function getDefaultModel(
  provider: StorageSettings["llmConfig"]["provider"]
): string {
  const models = {
    anthropic: "claude-sonnet-4-20250514",
    openai: "gpt-4o-mini",
    gemini: "gemini-2.0-flash",
  };
  return models[provider];
}
