---
paths: "**/*.test.*, **/*.spec.*, **/tests/**"
---

# テストルール

テスト作成・実行のガイドライン。

## テストフレームワーク

| 言語 | フレームワーク | コマンド |
|------|---------------|---------|
| TypeScript | Vitest / Bun Test | `bun test` |
| Python | pytest | `pytest` |
| Rust | cargo test | `cargo test` |

## テストファイル配置

```
src/
├── utils/
│   ├── helper.ts
│   └── helper.test.ts    # 同一ディレクトリ
└── __tests__/            # または専用ディレクトリ
    └── helper.test.ts
```

## テスト命名規則

```typescript
// ファイル名: *.test.ts または *.spec.ts

describe("関数名/クラス名", () => {
  it("正常系: 期待する動作", () => {});
  it("異常系: エラーケース", () => {});
  it("境界値: エッジケース", () => {});
});
```

## テストの種類

| 種類 | 目的 | 割合目安 |
|------|------|---------|
| ユニットテスト | 関数単位の動作確認 | 70% |
| 統合テスト | モジュール間連携 | 20% |
| E2Eテスト | ユーザー操作の模擬 | 10% |

## カバレッジ目標

| レベル | カバレッジ | 対象 |
|--------|-----------|------|
| 必須 | 80%+ | ビジネスロジック |
| 推奨 | 60%+ | ユーティリティ |
| 任意 | - | UI/設定ファイル |

## モック・スタブ

```typescript
import { vi, describe, it, expect } from "vitest";

// 関数モック
vi.mock("./api", () => ({
  fetchData: vi.fn().mockResolvedValue({ data: "test" }),
}));

// スパイ
const spy = vi.spyOn(console, "log");
```

## 非同期テスト

```typescript
it("非同期処理", async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

## スナップショットテスト

```typescript
it("UIコンポーネント", () => {
  const component = render(<Button />);
  expect(component).toMatchSnapshot();
});
```

## テスト実行

```bash
# 全テスト
bun test

# 特定ファイル
bun test src/utils/helper.test.ts

# ウォッチモード
bun test --watch

# カバレッジ
bun test --coverage
```

## CI/CD統合

```yaml
# GitHub Actions
- name: Run tests
  run: bun test --coverage
```

## ベストプラクティス

| 項目 | ガイドライン |
|------|-------------|
| 独立性 | テスト間で状態を共有しない |
| 再現性 | 毎回同じ結果になる |
| 速度 | 1テスト100ms以内 |
| 可読性 | テスト名で内容が分かる |

## アンチパターン

| パターン | 問題 |
|----------|------|
| 実装詳細のテスト | リファクタリングで壊れる |
| 過度なモック | 実際の動作と乖離 |
| フレーキーテスト | 不安定で信頼できない |
