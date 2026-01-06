---
paths: "**/*"
---

# pnpm 優先ルール

## 概要

**pnpm**を最優先パッケージマネージャーとして使用。
高速なインストール、ディスク効率、厳格な依存関係管理が特徴。

## 優先順位

| 順位 | ツール | 用途 |
|------|--------|------|
| 1 | **pnpm** | 最優先（デフォルト） |
| 2 | bun | pnpm非対応時 |
| 3 | npm | レガシー互換 |

## コマンド対応表

| npm | pnpm |
|-----|------|
| npm install | pnpm install |
| npm i <pkg> | pnpm add <pkg> |
| npm i -D <pkg> | pnpm add -D <pkg> |
| npm i -g <pkg> | pnpm add -g <pkg> |
| npm run <script> | pnpm <script> |
| npx <cmd> | pnpm dlx <cmd> |
| npm ci | pnpm install --frozen-lockfile |
| npm update | pnpm update |
| npm uninstall | pnpm remove |

## 設定

### .npmrc（推奨設定）

```ini
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

## pnpmを使う場面

| 場面 | 使用 |
|------|------|
| 新規プロジェクト | ✅ pnpm |
| モノレポ | ✅ pnpm workspace |
| CI/CD | ✅ pnpm install --frozen-lockfile |
| グローバルツール | ✅ pnpm add -g |

## bunを使う場面

| 場面 | 使用 |
|------|------|
| pnpm非対応パッケージ | bun |
| TypeScript直接実行 | bun run |
| 高速スクリプト実行 | bun |

## 参照

- [pnpm公式](https://pnpm.io/ja/)
- [pnpm vs npm vs yarn](https://pnpm.io/benchmarks)
