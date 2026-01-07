import { useCallback, useState } from "react";
import type { Thread, ThreadPost } from "@/types";
import { summarizeContent } from "@/utils/llmApi";
import { loadSettings } from "@/utils/storage";
import { splitTextToThread } from "@/utils/textSplitter";

interface UseThreadReturn {
  thread: Thread | null;
  isLoading: boolean;
  error: string | null;
  generateThread: (content: string, useLLM?: boolean) => Promise<void>;
  updatePost: (postId: string, newContent: string) => void;
  removePost: (postId: string) => void;
  addPost: (afterPostId: string) => void;
  reorderPosts: (fromIndex: number, toIndex: number) => void;
  clearThread: () => void;
}

export function useThread(): UseThreadReturn {
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateThread = useCallback(
    async (content: string, useLLM = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const settings = await loadSettings();
        let processedContent = content;

        // LLMを使用して要約
        if (useLLM && settings.llmConfig.apiKey) {
          const result = await summarizeContent(content, settings.llmConfig);
          processedContent = result.summary;
        }

        // テキストを分割
        const posts = splitTextToThread(processedContent, settings.maxCharsPerPost, {
          includeNumbering: settings.includeNumbering,
          autoAddContinue: settings.autoAddContinue,
        });

        setThread({
          posts,
          totalPosts: posts.length,
          originalContent: content,
          source: "manual",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updatePost = useCallback((postId: string, newContent: string) => {
    setThread((prev) => {
      if (!prev) return null;

      const updatedPosts = prev.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              content: newContent,
              charCount: newContent.length,
              isOverLimit: newContent.length > 280,
            }
          : post
      );

      return {
        ...prev,
        posts: updatedPosts,
      };
    });
  }, []);

  const removePost = useCallback((postId: string) => {
    setThread((prev) => {
      if (!prev) return null;

      const updatedPosts = prev.posts.filter((post) => post.id !== postId);

      return {
        ...prev,
        posts: updatedPosts,
        totalPosts: updatedPosts.length,
      };
    });
  }, []);

  const addPost = useCallback((afterPostId: string) => {
    setThread((prev) => {
      if (!prev) return null;

      const index = prev.posts.findIndex((p) => p.id === afterPostId);
      const newPost: ThreadPost = {
        id: `post-new-${Date.now()}`,
        content: "",
        charCount: 0,
        isOverLimit: false,
      };

      const updatedPosts = [
        ...prev.posts.slice(0, index + 1),
        newPost,
        ...prev.posts.slice(index + 1),
      ];

      return {
        ...prev,
        posts: updatedPosts,
        totalPosts: updatedPosts.length,
      };
    });
  }, []);

  const reorderPosts = useCallback((fromIndex: number, toIndex: number) => {
    setThread((prev) => {
      if (!prev) return null;

      const posts = [...prev.posts];
      const [movedPost] = posts.splice(fromIndex, 1);
      posts.splice(toIndex, 0, movedPost);

      return {
        ...prev,
        posts,
      };
    });
  }, []);

  const clearThread = useCallback(() => {
    setThread(null);
    setError(null);
  }, []);

  return {
    thread,
    isLoading,
    error,
    generateThread,
    updatePost,
    removePost,
    addPost,
    reorderPosts,
    clearThread,
  };
}
