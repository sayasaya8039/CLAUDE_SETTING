/**
 * YouTube 用コンテンツスクリプト
 * 動画の説明文や字幕を抽出する
 */

// メッセージリスナー
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_YOUTUBE_CONTENT") {
    extractYouTubeContent().then(sendResponse);
    return true; // 非同期レスポンスを示す
  }
  return true;
});

/**
 * YouTubeの動画情報を抽出
 */
async function extractYouTubeContent(): Promise<{
  content: string;
  title: string;
} | null> {
  // タイトルを取得
  const titleElement = document.querySelector(
    "h1.ytd-video-primary-info-renderer yt-formatted-string, h1.ytd-watch-metadata yt-formatted-string"
  );
  const title = titleElement?.textContent?.trim() || "";

  // 説明文を取得
  const descriptionElement = document.querySelector(
    "#description-inline-expander yt-attributed-string, ytd-text-inline-expander yt-attributed-string, #description yt-formatted-string"
  );
  const description = descriptionElement?.textContent?.trim() || "";

  // 字幕を取得（可能な場合）
  const transcript = await extractTranscript();

  // コンテンツを組み立て
  let content = `【${title}】\n\n`;

  if (description) {
    content += `■ 説明文\n${description}\n\n`;
  }

  if (transcript) {
    content += `■ 字幕・トランスクリプト\n${transcript}`;
  }

  return {
    title,
    content: content.trim(),
  };
}

/**
 * YouTubeの字幕/トランスクリプトを抽出
 */
async function extractTranscript(): Promise<string | null> {
  // トランスクリプトパネルを探す
  const transcriptButton = document.querySelector(
    'button[aria-label="文字起こしを表示"], button[aria-label="Show transcript"]'
  );

  if (!transcriptButton) {
    // トランスクリプトボタンがない場合は「もっと見る」をクリック
    const moreButton = document.querySelector(
      'tp-yt-paper-button#expand, #description-inline-expander tp-yt-paper-button'
    );
    if (moreButton) {
      (moreButton as HTMLElement).click();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 再度トランスクリプトボタンを探す
    const retryButton = document.querySelector(
      'button[aria-label="文字起こしを表示"], button[aria-label="Show transcript"], ytd-button-renderer:has-text("文字起こし")'
    );
    if (!retryButton) {
      return null;
    }
  }

  // トランスクリプトパネルが既に開いているか確認
  let transcriptPanel = document.querySelector(
    "ytd-transcript-renderer, ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-searchable-transcript']"
  );

  if (!transcriptPanel) {
    // トランスクリプトを開く
    const openButton = document.querySelector(
      'button[aria-label="文字起こしを表示"], button[aria-label="Show transcript"]'
    );
    if (openButton) {
      (openButton as HTMLElement).click();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    transcriptPanel = document.querySelector(
      "ytd-transcript-renderer, ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-searchable-transcript']"
    );
  }

  if (!transcriptPanel) {
    return null;
  }

  // 字幕テキストを抽出
  const segments = transcriptPanel.querySelectorAll(
    "ytd-transcript-segment-renderer, .ytd-transcript-segment-renderer"
  );

  const texts: string[] = [];
  for (const segment of segments) {
    const text = segment.textContent?.trim();
    if (text) {
      texts.push(text);
    }
  }

  return texts.join(" ");
}

console.log("X Thread Maker: YouTube content script loaded");
