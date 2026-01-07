import { Settings, Twitter } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-x-black rounded-full flex items-center justify-center">
          <Twitter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-x-black">X Thread Maker</h1>
          <p className="text-xs text-x-gray">v1.0.0</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSettingsClick}
        className="p-2 hover:bg-x-light rounded-full transition-colors"
        aria-label="設定"
      >
        <Settings className="w-5 h-5 text-x-gray" />
      </button>
    </header>
  );
}
