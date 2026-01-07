import { useState } from "react";
import { ContentInput } from "@/components/ContentInput";
import { Header } from "@/components/Header";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ThreadPreview } from "@/components/ThreadPreview";
import { useSettings } from "@/hooks/useSettings";
import { useThread } from "@/hooks/useThread";

type View = "main" | "settings";

export function App() {
  const [view, setView] = useState<View>("main");
  const { settings, updateSettings } = useSettings();
  const {
    thread,
    isLoading,
    error,
    generateThread,
    updatePost,
    removePost,
    addPost,
    reorderPosts,
    clearThread,
  } = useThread();

  const hasApiKey = Boolean(settings.llmConfig.apiKey);

  if (view === "settings") {
    return (
      <SettingsPanel
        settings={settings}
        onClose={() => setView("main")}
        onUpdateSettings={updateSettings}
      />
    );
  }

  return (
    <div className="min-h-[500px] flex flex-col">
      <Header onSettingsClick={() => setView("settings")} />

      <main className="flex-1 overflow-y-auto">
        {/* エラー表示 */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* スレッドが生成されていない場合は入力画面 */}
        {!thread ? (
          <ContentInput
            onGenerate={generateThread}
            isLoading={isLoading}
            hasApiKey={hasApiKey}
          />
        ) : (
          <ThreadPreview
            thread={thread}
            onUpdatePost={updatePost}
            onRemovePost={removePost}
            onAddPost={addPost}
            onReorder={reorderPosts}
            onClear={clearThread}
          />
        )}
      </main>

      {/* フッター */}
      <footer className="p-2 text-center text-xs text-x-gray border-t border-gray-100">
        {thread ? (
          <button
            type="button"
            onClick={clearThread}
            className="hover:text-x-blue transition-colors"
          >
            ← 新しいスレッドを作成
          </button>
        ) : (
          <span>X Thread Maker v1.0.0</span>
        )}
      </footer>
    </div>
  );
}
