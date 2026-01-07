/**
 * note.com 用コンテンツスクリプト
 * 記事の本文を抽出する
 */

// メッセージリスナー
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_NOTE_CONTENT") {
    const result = extractNoteContent();
    sendResponse(result);
  }
  return true;
});

/**
 * note.comの記事本文を抽出
 */
function extractNoteContent(): { content: string; title: string } | null {
  // タイトルを取得
  const titleElement = document.querySelector(
    "h1.o-noteContentHeader__title, h1[class*='noteContentHeader__title'], .p-article__title"
  );
  const title = titleElement?.textContent?.trim() || "";

  // 本文を取得（複数のセレクタを試行）
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

  if (!contentElement) {
    // 記事ページでない場合はnull
    return null;
  }

  // 本文のテキストを抽出
  const content = extractTextContent(contentElement);

  return {
    title,
    content: content.trim(),
  };
}

/**
 * 要素からテキストを抽出（フォーマットを保持）
 */
function extractTextContent(element: Element): string {
  const texts: string[] = [];

  // 子要素を走査
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ALL, {
    acceptNode: (node) => {
      // スクリプトやスタイルは除外
      if (
        node.parentElement?.tagName === "SCRIPT" ||
        node.parentElement?.tagName === "STYLE"
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let previousWasBlock = false;

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        if (previousWasBlock) {
          texts.push("\n\n");
          previousWasBlock = false;
        }
        texts.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      // ブロック要素の場合は改行を追加
      if (
        ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "br", "li"].includes(
          tagName
        )
      ) {
        previousWasBlock = true;
      }

      // 見出しの場合はマーカーを追加
      if (tagName.match(/^h[1-6]$/)) {
        const level = Number.parseInt(tagName[1]);
        texts.push(`\n${"#".repeat(level)} `);
        previousWasBlock = false;
      }

      // リストアイテムの場合
      if (tagName === "li") {
        texts.push("\n• ");
        previousWasBlock = false;
      }
    }
  }

  return texts.join("");
}

console.log("X Thread Maker: note.com content script loaded");
