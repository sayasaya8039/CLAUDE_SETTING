# HANDOFF.md - X Thread Maker

## 🔴 絶対遵守ルール（コンテキスト圧縮後も必ず維持）

### Tier 0（最重要）
| ルール | 内容 |
|--------|------|
| **ファイル書き込み** | Write/Edit禁止 → JSスクリプト経由のみ |
| **日本語回答** | 必ず日本語で回答（例外なし） |
| **Gemini協力** | 壁打ち必須、調査はGeminiに委譲 |
| **Git自動コミット** | 更新時は即座にコミット・プッシュ |

### Tier 1（必須）
| ルール | 内容 |
|--------|------|
| **確認なし実行** | Yes/No確認せずタスク完了まで実行 |
| **ビルド完了** | デバッグ・ビルドまで必ず完了 |
| **pnpm優先** | npm → pnpm → bun |
| **Biome使用** | ESLint+Prettier → Biome |
| **バージョン更新** | アプリ更新時は必ずバージョンアップ |
| **最新モデル確認** | AI API実装前にWebSearchで最新モデル名確認 |

---

## プロジェクト: X Thread Maker
- 機能: X（Twitter）スレッド作成Chrome拡張機能
- 技術: React 18 + TypeScript + Vite + Tailwind CSS + Manifest V3
- バージョン: v1.0.0

### 対応LLM
- Claude: claude-sonnet-4-20250514
- OpenAI: gpt-4o-mini
- Gemini: gemini-2.0-flash

---

## Gemini CLI
C:/Users/Owner/AppData/Roaming/npm/gemini.cmd --prompt 質問

### 壁打ち必須場面
- 新タスク開始前
- 複雑な実装前
- エラー発生時
- API/ライブラリ調査時
- コンテキスト圧縮直後

---

## 開発コマンド
- pnpm install - 依存関係インストール
- pnpm dev - 開発モード
- pnpm build - ビルド
- pnpm lint - Biome lint

---

## 禁止事項
- any型の使用
- APIキーハードコード
- 古いモデル名（gpt-3.5-turbo, gpt-4, claude-2等）
- 1000行超ファイル
- Write/Editツール直接使用
- Gemini協力スキップ
- コミット・プッシュ忘れ

---

## チェックリスト（作業開始時）
- [ ] Gemini協力体制を維持
- [ ] ファイル書き込みはJSスクリプト経由
- [ ] 日本語で回答
- [ ] 確認なしで実行
- [ ] バージョン更新を忘れない
