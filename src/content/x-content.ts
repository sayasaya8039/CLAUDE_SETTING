/**
 * X (Twitter) 用コンテンツスクリプト
 * ポストの挿入と投稿支援を行う
 */

// メッセージリスナー
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "INSERT_TO_X":
      insertToComposer(message.payload.content);
      sendResponse({ success: true });
      break;

    case "INSERT_THREAD_TO_X":
      insertThread(message.payload.posts);
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }
  return true;
});

/**
 * X.comの投稿コンポーザーにテキストを挿入
 */
function insertToComposer(content: string): void {
  // 投稿ボックスを探す（複数のセレクタを試行）
  const selectors = [
    '[data-testid="tweetTextarea_0"]',
    '[data-testid="tweetTextarea"]',
    '[role="textbox"][data-contents="true"]',
    ".public-DraftEditor-content",
    '[contenteditable="true"][role="textbox"]',
  ];

  let composer: Element | null = null;
  for (const selector of selectors) {
    composer = document.querySelector(selector);
    if (composer) break;
  }

  if (!composer) {
    // コンポーザーが見つからない場合、投稿ボタンをクリック
    const composeButton = document.querySelector(
      '[data-testid="SideNav_NewTweet_Button"]'
    );
    if (composeButton) {
      (composeButton as HTMLElement).click();
      // 少し待ってから再試行
      setTimeout(() => insertToComposer(content), 500);
      return;
    }
    console.error("X Thread Maker: コンポーザーが見つかりません");
    return;
  }

  // フォーカスを当ててテキストを挿入
  (composer as HTMLElement).focus();

  // Draft.js のエディタに対応
  if (composer.classList.contains("public-DraftEditor-content")) {
    insertToDraftJs(composer, content);
  } else {
    // 通常のcontenteditable
    insertToContentEditable(composer, content);
  }
}

/**
 * Draft.jsエディタにテキストを挿入
 */
function insertToDraftJs(editor: Element, content: string): void {
  // フォーカス
  (editor as HTMLElement).focus();

  // キーボードイベントをシミュレート
  const inputEvent = new InputEvent("beforeinput", {
    inputType: "insertText",
    data: content,
    bubbles: true,
    cancelable: true,
  });
  editor.dispatchEvent(inputEvent);

  // バックアップ: execCommandを使用
  document.execCommand("insertText", false, content);
}

/**
 * contenteditableにテキストを挿入
 */
function insertToContentEditable(element: Element, content: string): void {
  const htmlElement = element as HTMLElement;
  htmlElement.focus();

  // 選択をクリア
  const selection = window.getSelection();
  if (selection) {
    selection.selectAllChildren(htmlElement);
    selection.collapseToEnd();
  }

  // テキストを挿入
  document.execCommand("insertText", false, content);
}

/**
 * スレッドを順番に投稿（最初の1つを挿入）
 */
function insertThread(posts: string[]): void {
  if (posts.length === 0) return;

  // 最初のポストを挿入
  insertToComposer(posts[0]);

  // 残りのポストをクリップボードに通知
  if (posts.length > 1) {
    showThreadNotification(posts.slice(1));
  }
}

/**
 * 残りのスレッドを通知（安全なDOM操作を使用）
 */
function showThreadNotification(remainingPosts: string[]): void {
  // 既存の通知を削除
  const existing = document.getElementById("x-thread-maker-notification");
  if (existing) existing.remove();

  // コンテナを作成
  const notification = document.createElement("div");
  notification.id = "x-thread-maker-notification";
  Object.assign(notification.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#1d9bf0",
    color: "white",
    padding: "16px 20px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: "10000",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    maxWidth: "300px",
  });

  // タイトル
  const titleDiv = document.createElement("div");
  titleDiv.textContent = "📝 スレッド投稿中";
  Object.assign(titleDiv.style, {
    fontWeight: "bold",
    marginBottom: "8px",
  });
  notification.appendChild(titleDiv);

  // カウント表示
  const countDiv = document.createElement("div");
  countDiv.id = "x-thread-maker-count";
  countDiv.textContent = `残り ${remainingPosts.length} ポスト`;
  Object.assign(countDiv.style, {
    fontSize: "14px",
    marginBottom: "12px",
  });
  notification.appendChild(countDiv);

  // ボタンコンテナ
  const buttonContainer = document.createElement("div");
  Object.assign(buttonContainer.style, {
    display: "flex",
    gap: "8px",
  });

  // 次へボタン
  const nextButton = document.createElement("button");
  nextButton.textContent = "次へ";
  Object.assign(nextButton.style, {
    background: "white",
    color: "#1d9bf0",
    border: "none",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "bold",
    cursor: "pointer",
  });

  // 全てコピーボタン
  const copyAllButton = document.createElement("button");
  copyAllButton.textContent = "全てコピー";
  Object.assign(copyAllButton.style, {
    background: "transparent",
    color: "white",
    border: "1px solid white",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
  });

  // 閉じるボタン
  const closeButton = document.createElement("button");
  closeButton.textContent = "✕";
  Object.assign(closeButton.style, {
    background: "transparent",
    color: "white",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    marginLeft: "auto",
  });

  buttonContainer.appendChild(nextButton);
  buttonContainer.appendChild(copyAllButton);
  buttonContainer.appendChild(closeButton);
  notification.appendChild(buttonContainer);

  document.body.appendChild(notification);

  // イベントハンドラ
  let currentIndex = 0;

  nextButton.addEventListener("click", () => {
    if (currentIndex < remainingPosts.length) {
      insertToComposer(remainingPosts[currentIndex]);
      currentIndex++;
      countDiv.textContent = `残り ${remainingPosts.length - currentIndex} ポスト`;
      if (currentIndex >= remainingPosts.length) {
        notification.remove();
      }
    }
  });

  copyAllButton.addEventListener("click", () => {
    const allText = remainingPosts.join("\n\n---\n\n");
    navigator.clipboard.writeText(allText);
    copyAllButton.textContent = "コピー済み";
  });

  closeButton.addEventListener("click", () => {
    notification.remove();
  });

  // 10分後に自動で消える
  setTimeout(() => {
    notification.remove();
  }, 600000);
}

console.log("X Thread Maker: X.com content script loaded");
