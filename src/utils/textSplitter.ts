import type { ThreadPost } from "@/types";

/**
 * テキストを指定文字数で分割してスレッド用のポストを生成
 */
export function splitTextToThread(
  text: string,
  maxChars: number,
  options: {
    includeNumbering: boolean;
    autoAddContinue: boolean;
  }
): ThreadPost[] {
  const { includeNumbering, autoAddContinue } = options;
  const posts: ThreadPost[] = [];

  // 改行や空白で正規化
  const normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 段落ごとに分割
  const paragraphs = normalizedText.split(/\n\n+/);

  let currentPost = "";
  let postIndex = 1;

  for (const paragraph of paragraphs) {
    const sentences = splitIntoSentences(paragraph);

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      // 番号付けと続きマーカーのスペースを考慮
      const reservedChars = calculateReservedChars(
        postIndex,
        includeNumbering,
        autoAddContinue
      );
      const availableChars = maxChars - reservedChars;

      // 現在のポストに追加できるか確認
      const testContent = currentPost
        ? `${currentPost} ${trimmedSentence}`
        : trimmedSentence;

      if (testContent.length <= availableChars) {
        currentPost = testContent;
      } else {
        // 現在のポストを確定
        if (currentPost) {
          posts.push(createThreadPost(currentPost, postIndex, maxChars));
          postIndex++;
        }

        // 文が長すぎる場合は強制分割
        if (trimmedSentence.length > availableChars) {
          const forceSplitPosts = forceSplitText(
            trimmedSentence,
            maxChars,
            postIndex,
            includeNumbering,
            autoAddContinue
          );
          posts.push(...forceSplitPosts);
          postIndex += forceSplitPosts.length;
          currentPost = "";
        } else {
          currentPost = trimmedSentence;
        }
      }
    }
  }

  // 最後のポストを追加
  if (currentPost) {
    posts.push(createThreadPost(currentPost, postIndex, maxChars));
  }

  // 番号付けと続きマーカーを適用
  return applyFormatting(posts, includeNumbering, autoAddContinue);
}

/**
 * 文を分割（日本語と英語に対応）
 */
function splitIntoSentences(text: string): string[] {
  // 日本語の句点、英語のピリオド+スペースで分割
  return text.split(/(?<=[。．.!?！？])\s*/);
}

/**
 * 予約文字数を計算
 */
function calculateReservedChars(
  postIndex: number,
  includeNumbering: boolean,
  autoAddContinue: boolean
): number {
  let reserved = 0;

  if (includeNumbering) {
    // "1/10 " のような形式
    reserved += String(postIndex).length + 5;
  }

  if (autoAddContinue) {
    // "→" は最後のポスト以外に追加
    reserved += 2;
  }

  return reserved;
}

/**
 * ThreadPostオブジェクトを作成
 */
function createThreadPost(
  content: string,
  index: number,
  maxChars: number
): ThreadPost {
  return {
    id: `post-${index}-${Date.now()}`,
    content,
    charCount: content.length,
    isOverLimit: content.length > maxChars,
  };
}

/**
 * 長いテキストを強制的に分割
 */
function forceSplitText(
  text: string,
  maxChars: number,
  startIndex: number,
  includeNumbering: boolean,
  autoAddContinue: boolean
): ThreadPost[] {
  const posts: ThreadPost[] = [];
  let remaining = text;
  let index = startIndex;

  while (remaining.length > 0) {
    const reservedChars = calculateReservedChars(
      index,
      includeNumbering,
      autoAddContinue
    );
    const availableChars = maxChars - reservedChars;

    // 分割位置を探す（単語の途中で切らないように）
    let splitPos = Math.min(remaining.length, availableChars);

    if (splitPos < remaining.length) {
      // 日本語の場合は文字単位で切っても良い
      // 英語の場合はスペースで区切る
      const lastSpace = remaining.lastIndexOf(" ", splitPos);
      if (lastSpace > splitPos * 0.5) {
        splitPos = lastSpace;
      }
    }

    const chunk = remaining.slice(0, splitPos).trim();
    if (chunk) {
      posts.push(createThreadPost(chunk, index, maxChars));
      index++;
    }
    remaining = remaining.slice(splitPos).trim();
  }

  return posts;
}

/**
 * フォーマットを適用（番号付けと続きマーカー）
 */
function applyFormatting(
  posts: ThreadPost[],
  includeNumbering: boolean,
  autoAddContinue: boolean
): ThreadPost[] {
  const totalPosts = posts.length;

  return posts.map((post, index) => {
    let formattedContent = post.content;

    // 番号付け
    if (includeNumbering && totalPosts > 1) {
      formattedContent = `${index + 1}/${totalPosts} ${formattedContent}`;
    }

    // 続きマーカー（最後のポスト以外）
    if (autoAddContinue && index < totalPosts - 1) {
      formattedContent = `${formattedContent} →`;
    }

    return {
      ...post,
      content: formattedContent,
      charCount: formattedContent.length,
      isOverLimit: formattedContent.length > 280,
    };
  });
}

/**
 * 文字数をカウント（日本語・絵文字対応）
 */
export function countCharacters(text: string): number {
  // Twitter/Xの文字数カウントに近い計算
  // 日本語は1文字、英数字は0.5文字としてカウントされるが、
  // 実際の表示上は文字数としてカウント
  return [...text].length;
}
