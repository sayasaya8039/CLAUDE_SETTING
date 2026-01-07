import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  GripVertical,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Thread, ThreadPost } from "@/types";

interface ThreadPreviewProps {
  thread: Thread;
  onUpdatePost: (postId: string, content: string) => void;
  onRemovePost: (postId: string) => void;
  onAddPost: (afterPostId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onClear: () => void;
}

export function ThreadPreview({
  thread,
  onUpdatePost,
  onRemovePost,
  onAddPost,
  onReorder,
  onClear,
}: ThreadPreviewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (content: string, postId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = async () => {
    const allContent = thread.posts.map((p) => p.content).join("\n\n---\n\n");
    await navigator.clipboard.writeText(allContent);
    setCopiedId("all");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertToX = (content: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id && (tab.url?.includes("x.com") || tab.url?.includes("twitter.com"))) {
        chrome.tabs.sendMessage(tab.id, {
          type: "INSERT_TO_X",
          payload: { content },
        });
      } else {
        // X.comを新しいタブで開く
        chrome.tabs.create({
          url: `https://x.com/intent/tweet?text=${encodeURIComponent(content)}`,
        });
      }
    });
  };

  const handlePostThread = () => {
    const posts = thread.posts.map((p) => p.content);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id && (tab.url?.includes("x.com") || tab.url?.includes("twitter.com"))) {
        chrome.tabs.sendMessage(tab.id, {
          type: "INSERT_THREAD_TO_X",
          payload: { posts },
        });
      } else {
        // 最初のポストをX.comで開く
        chrome.tabs.create({
          url: `https://x.com/intent/tweet?text=${encodeURIComponent(posts[0])}`,
        });
      }
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-x-black">
          プレビュー ({thread.totalPosts} ポスト)
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyAll}
            className="text-sm text-x-gray hover:text-x-black flex items-center gap-1"
          >
            <Copy className="w-4 h-4" />
            {copiedId === "all" ? "コピー済み" : "全てコピー"}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            クリア
          </button>
        </div>
      </div>

      {/* ポスト一覧 */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {thread.posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            index={index}
            totalPosts={thread.totalPosts}
            isEditing={editingId === post.id}
            isCopied={copiedId === post.id}
            onEdit={() => setEditingId(post.id)}
            onSave={(content) => {
              onUpdatePost(post.id, content);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
            onCopy={() => handleCopy(post.content, post.id)}
            onRemove={() => onRemovePost(post.id)}
            onAddAfter={() => onAddPost(post.id)}
            onMoveUp={() => index > 0 && onReorder(index, index - 1)}
            onMoveDown={() =>
              index < thread.totalPosts - 1 && onReorder(index, index + 1)
            }
            onInsertToX={() => handleInsertToX(post.content)}
          />
        ))}
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={handlePostThread}
          className="flex-1 py-3 bg-x-blue hover:bg-blue-600 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          X.comで投稿
        </button>
        <button
          type="button"
          onClick={() =>
            chrome.tabs.create({ url: "https://x.com/compose/tweet" })
          }
          className="p-3 bg-x-light hover:bg-gray-200 rounded-full transition-colors"
          title="X.comを開く"
        >
          <ExternalLink className="w-5 h-5 text-x-gray" />
        </button>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: ThreadPost;
  index: number;
  totalPosts: number;
  isEditing: boolean;
  isCopied: boolean;
  onEdit: () => void;
  onSave: (content: string) => void;
  onCancel: () => void;
  onCopy: () => void;
  onRemove: () => void;
  onAddAfter: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInsertToX: () => void;
}

function PostCard({
  post,
  index,
  totalPosts,
  isEditing,
  isCopied,
  onEdit,
  onSave,
  onCancel,
  onCopy,
  onRemove,
  onAddAfter,
  onMoveUp,
  onMoveDown,
  onInsertToX,
}: PostCardProps) {
  const [editContent, setEditContent] = useState(post.content);

  const charColor = post.isOverLimit
    ? "text-red-500"
    : post.charCount > 260
      ? "text-yellow-500"
      : "text-x-gray";

  return (
    <div
      className={`relative border rounded-xl p-3 ${
        post.isOverLimit ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
    >
      {/* ハンドル */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab opacity-30 hover:opacity-100">
        <GripVertical className="w-4 h-4 text-x-gray" />
      </div>

      <div className="ml-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-x-gray">
            {index + 1} / {totalPosts}
          </span>
          <span className={`text-xs ${charColor}`}>
            {post.charCount} / 280
          </span>
        </div>

        {/* コンテンツ */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-x-blue"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1 text-sm text-x-gray hover:bg-gray-100 rounded-full"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => onSave(editContent)}
                className="px-3 py-1 text-sm bg-x-blue text-white rounded-full hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-sm text-x-black whitespace-pre-wrap cursor-pointer hover:bg-gray-50 rounded p-1 -m-1"
            onClick={onEdit}
          >
            {post.content}
          </p>
        )}

        {/* アクション */}
        {!isEditing && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onCopy}
              className="p-1.5 hover:bg-gray-100 rounded-full"
              title="コピー"
            >
              <Copy className="w-4 h-4 text-x-gray" />
            </button>
            <button
              type="button"
              onClick={onInsertToX}
              className="p-1.5 hover:bg-gray-100 rounded-full"
              title="X.comに挿入"
            >
              <Send className="w-4 h-4 text-x-gray" />
            </button>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30"
              title="上に移動"
            >
              <ArrowUp className="w-4 h-4 text-x-gray" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === totalPosts - 1}
              className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30"
              title="下に移動"
            >
              <ArrowDown className="w-4 h-4 text-x-gray" />
            </button>
            <button
              type="button"
              onClick={onAddAfter}
              className="p-1.5 hover:bg-gray-100 rounded-full"
              title="ポストを追加"
            >
              <Plus className="w-4 h-4 text-x-gray" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 hover:bg-red-100 rounded-full ml-auto"
              title="削除"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        {/* コピー完了メッセージ */}
        {isCopied && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            コピー済み
          </div>
        )}
      </div>
    </div>
  );
}
