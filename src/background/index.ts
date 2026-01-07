/**
 * バックグラウンドサービスワーカー
 * 拡張機能のライフサイクル管理とメッセージング
 */

// 拡張機能インストール時
chrome.runtime.onInstalled.addListener((details) => {
  console.log("X Thread Maker installed:", details.reason);

  // 初期設定を保存
  if (details.reason === "install") {
    chrome.storage.local.set({
      x_thread_maker_settings: {
        llmConfig: {
          provider: "anthropic",
          apiKey: "",
          model: "claude-sonnet-4-20250514",
        },
        maxCharsPerPost: 140,
        includeNumbering: true,
        autoAddContinue: true,
      },
    });
  }
});

// コンテキストメニューを作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "x-thread-maker-create",
    title: "X Thread Makerでスレッド作成",
    contexts: ["selection"],
  });
});

// コンテキストメニュークリック時
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "x-thread-maker-create" && info.selectionText) {
    // 選択テキストを保存
    chrome.storage.local.set({
      x_thread_maker_selected_text: info.selectionText,
    });

    // ポップアップを開く（実際にはポップアップは手動で開く必要がある）
    // 代わりに通知を表示
    if (tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showSelectionNotification,
      });
    }
  }
});

/**
 * 選択テキストの通知を表示
 */
function showSelectionNotification(): void {
  const notification = document.createElement("div");
  notification.id = "x-thread-maker-selection-notification";
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#1d9bf0",
    color: "white",
    padding: "12px 16px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: "10000",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "14px",
  });
  notification.textContent = "📋 テキストを保存しました。拡張機能アイコンをクリックしてスレッドを作成";

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// メッセージハンドラ
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "GET_SELECTED_TEXT": {
      chrome.storage.local.get(["x_thread_maker_selected_text"], (result) => {
        sendResponse({ text: result.x_thread_maker_selected_text || "" });
        // 使用後にクリア
        chrome.storage.local.remove("x_thread_maker_selected_text");
      });
      return true;
    }

    case "OPEN_X_COMPOSE": {
      chrome.tabs.create({ url: "https://x.com/compose/tweet" });
      sendResponse({ success: true });
      break;
    }

    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }
  return true;
});

console.log("X Thread Maker: Background service worker started");
