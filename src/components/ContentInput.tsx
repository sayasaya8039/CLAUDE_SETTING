import {
  ClipboardPaste,
  FileText,
  Loader2,
  Sparkles,
  Youtube,
} from "lucide-react";
import { useState } from "react";

interface ContentInputProps {
  onGenerate: (content: string, useLLM: boolean) => void;
  isLoading: boolean;
  hasApiKey: boolean;
}

export function ContentInput({
  onGenerate,
  isLoading,
  hasApiKey,
}: ContentInputProps) {
  const [content, setContent] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
    } catch {
      // クリップボードアクセス失敗
    }
  };

  const handleGetFromNote = async () => {
    // note.comからコンテンツを取得
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id && tab.url?.includes("note.com")) {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "GET_NOTE_CONTENT" },
          (response) => {
            if (chrome.runtime.lastError) {
              // content scriptが読み込まれていない場合、直接スクリプトを実行
              injectAndGetNoteContent(tab.id!);
              return;
            }
            if (response?.content) {
              setContent(response.content);
            } else {
              alert("記事の本文が見つかりませんでした。\nnote.comの記事ページを開いているか確認してください。");
            }
          }
        );
      } else {
        alert("note.comのページを開いてください");
      }
    });
  };

  const injectAndGetNoteContent = async (tabId: number) => {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const titleElement = document.querySelector(
            "h1.o-noteContentHeader__title, h1[class*='noteContentHeader__title'], .p-article__title"
          );
          const title = titleElement?.textContent?.trim() || "";

          const contentSelectors = [
            ".note-common-styles__textnote-body",
            ".p-article__content",
            '[class*="noteContentBody"]',
            ".note-body",
            "article .note-common-styles__textnote-body",
          ];

          let contentElement: Element | null = null;
          for (const selector of contentSelectors) {
            contentElement = document.querySelector(selector);
            if (contentElement) break;
          }

          if (!contentElement) return null;

          return {
            title,
            content: (contentElement as HTMLElement).innerText?.trim() || "",
          };
        },
      });

      const result = results[0]?.result;
      if (result?.content) {
        setContent(result.content);
      } else {
        alert("記事の本文が見つかりませんでした。\nnote.comの記事ページを開いているか確認してください。");
      }
    } catch {
      alert("コンテンツの取得に失敗しました。ページを再読み込みしてお試しください。");
    }
  };

  const handleGetFromYouTube = async () => {
    // YouTubeからコンテンツを取得
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id && tab.url?.includes("youtube.com")) {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "GET_YOUTUBE_CONTENT" },
          (response) => {
            if (chrome.runtime.lastError) {
              injectAndGetYouTubeContent(tab.id!);
              return;
            }
            if (response?.content) {
              setContent(response.content);
            } else {
              alert("動画の説明文が見つかりませんでした。\nYouTubeの動画ページを開いているか確認してください。");
            }
          }
        );
      } else {
        alert("YouTubeのページを開いてください");
      }
    });
  };

  const injectAndGetYouTubeContent = async (tabId: number) => {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: async () => {
          // タイトルを取得
          const titleElement = document.querySelector(
            "h1.ytd-video-primary-info-renderer yt-formatted-string, h1.ytd-watch-metadata yt-formatted-string, #title h1 yt-formatted-string"
          );
          const title = titleElement?.textContent?.trim() || "";

          // 説明文を展開（「もっと見る」をクリック）
          const expandButton = document.querySelector(
            "#expand, tp-yt-paper-button#expand"
          ) as HTMLElement | null;
          if (expandButton) {
            expandButton.click();
            await new Promise((resolve) => setTimeout(resolve, 300));
          }

          // 説明文を取得（修正されたセレクタ）
          const descriptionElement = document.querySelector(
            "#description-inline-expander, ytd-text-inline-expander, #description-inner"
          );
          const description = (descriptionElement as HTMLElement)?.innerText?.trim() || "";

          if (!title && !description) return null;

          let content = `【${title}】\n\n`;
          if (description) {
            content += `■ 説明文\n${description}`;
          }

          return { title, content: content.trim() };
        },
      });

      const result = results[0]?.result;
      if (result?.content) {
        setContent(result.content);
      } else {
        alert("動画の説明文が見つかりませんでした。\nYouTubeの動画ページを開いているか確認してください。");
      }
    } catch {
      alert("コンテンツの取得に失敗しました。ページを再読み込みしてお試しください。");
    }
  };

  const handleSubmit = (useLLM: boolean) => {
    if (content.trim()) {
      onGenerate(content, useLLM);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* クイックアクション */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handlePaste}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-x-light hover:bg-gray-200 rounded-full transition-colors"
        >
          <ClipboardPaste className="w-4 h-4" />
          貼り付け
        </button>
        <button
          type="button"
          onClick={handleGetFromNote}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors"
        >
          <FileText className="w-4 h-4" />
          note
        </button>
        <button
          type="button"
          onClick={handleGetFromYouTube}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors"
        >
          <Youtube className="w-4 h-4" />
          YouTube
        </button>
      </div>

      {/* テキスト入力 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="スレッドにしたいテキストを入力またはペースト..."
        className="w-full h-40 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-x-blue focus:border-transparent"
      />

      {/* 文字数表示 */}
      <div className="flex justify-between items-center text-sm text-x-gray">
        <span>{content.length.toLocaleString()} 文字</span>
        <span>
          推定 {Math.max(1, Math.ceil(content.length / 140))} ポスト
        </span>
      </div>

      {/* 生成ボタン */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={!content.trim() || isLoading}
          className="flex-1 py-3 bg-x-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "スレッド生成"
          )}
        </button>

        {hasApiKey && (
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={!content.trim() || isLoading}
            className="py-3 px-4 bg-x-blue hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2"
            title="AI要約を使用"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
