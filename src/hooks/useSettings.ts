import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type StorageSettings } from "@/types";
import { loadSettings, saveSettings } from "@/utils/storage";

interface UseSettingsReturn {
  settings: StorageSettings;
  isLoading: boolean;
  updateSettings: (updates: Partial<StorageSettings>) => Promise<void>;
  updateApiKey: (apiKey: string) => Promise<void>;
  updateProvider: (
    provider: StorageSettings["llmConfig"]["provider"]
  ) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<StorageSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setIsLoading(false);
    });
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<StorageSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await saveSettings(newSettings);
    },
    [settings]
  );

  const updateApiKey = useCallback(
    async (apiKey: string) => {
      await updateSettings({
        llmConfig: { ...settings.llmConfig, apiKey },
      });
    },
    [settings.llmConfig, updateSettings]
  );

  const updateProvider = useCallback(
    async (provider: StorageSettings["llmConfig"]["provider"]) => {
      const modelMap = {
        anthropic: "claude-sonnet-4-20250514",
        openai: "gpt-4o-mini",
        gemini: "gemini-2.0-flash",
      };

      await updateSettings({
        llmConfig: {
          ...settings.llmConfig,
          provider,
          model: modelMap[provider],
        },
      });
    },
    [settings.llmConfig, updateSettings]
  );

  return {
    settings,
    isLoading,
    updateSettings,
    updateApiKey,
    updateProvider,
  };
}
