# X Thread Maker

X (Twitter) スレッド作成アシスタント - note記事やYouTube動画の長文を分割してスレッド投稿を支援

## 機能

- **テキスト分割**: 長文を自動的にX (Twitter) の文字数制限に収まるように分割
- **AI要約**: Claude / OpenAI / Gemini APIを使用して長文を要約
- **note.com連携**: note記事の本文を自動取得
- **YouTube連携**: YouTube動画の説明文・字幕を取得
- **スレッドプレビュー**: 投稿前にスレッドを確認・編集
- **X.com投稿支援**: ワンクリックでX.comに挿入

## インストール

### Chrome拡張機能として読み込む

1. Chrome で `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `X_Thread_Maker` フォルダを選択

## 使い方

### 基本的な使い方

1. 拡張機能アイコンをクリックしてポップアップを開く
2. テキストを入力または貼り付け
3. 「スレッド生成」ボタンをクリック
4. プレビューを確認・編集
5. 「X.comで投稿」ボタンをクリック

### note.comから取得

1. note.comの記事ページを開く
2. 拡張機能を開き「note」ボタンをクリック
3. 記事本文が自動的に取得される

### YouTubeから取得

1. YouTubeの動画ページを開く
2. 拡張機能を開き「YouTube」ボタンをクリック
3. 動画の説明文が取得される

### AI要約を使用

1. 設定画面でAPIキーを入力
2. テキスト入力後、⚡ボタンをクリック
3. AIが自動的に要約・分割

## 設定

### 対応LLMプロバイダー

- **Claude** (Anthropic): claude-sonnet-4-20250514
- **OpenAI**: gpt-4o-mini
- **Gemini** (Google): gemini-2.0-flash

### スレッド設定

- **最大文字数**: 100〜280文字（日本語は140字推奨）
- **番号付け**: 1/5, 2/5 のような番号を追加
- **続きマーカー**: 末尾に → を追加

## 開発

```bash
# 依存関係のインストール
pnpm install

# 開発モード
pnpm dev

# ビルド
pnpm build

# リント
pnpm lint
```

## 技術スタック

- React 18 + TypeScript
- Vite + @crxjs/vite-plugin
- Tailwind CSS
- Biome (Linter/Formatter)
- Chrome Extension Manifest V3

## ライセンス

MIT

## バージョン

v1.0.0
