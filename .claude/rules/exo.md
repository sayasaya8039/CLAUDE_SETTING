---
paths: "**/exo/**, **/distributed/**"
---

# exo ルール

## 概要

**exo**は家庭のデバイスで分散AIクラスターを構築するフレームワーク。
スマホ、PC、Macを接続して大規模LLMを実行。

GitHub: https://github.com/exo-explore/exo (35,844+ stars)

## 主な特徴

| 特徴 | 説明 |
|------|------|
| P2P分散 | マスター/ワーカーなし |
| 自動検出 | デバイス自動発見 |
| MLX対応 | Apple Silicon最適化 |
| 大規模モデル | 405Bパラメータまで対応 |

## 対応モデル

| カテゴリ | モデル |
|----------|--------|
| LLM | LLaMA 3.3 (3B-405B), Mistral, Qwen, DeepSeek |
| Vision | LLaVA |
| Coding | DeepSeek Coder, Qwen Coder |
| Reasoning | DeepSeek R1 |

## インストール

```bash
pip install exo
```

## 基本使用法

### クラスター起動

```bash
# ノード1（Mac Studio）
exo run

# ノード2（MacBook）- 自動接続
exo run
```

### モデル実行

```bash
# LLaMA 3.3 70Bを実行
exo run llama-3.3-70b

# DeepSeek V3を実行
exo run deepseek-v3
```

## Claude Code連携

### ローカルLLMとしてexoを使用

```bash
# exoをOpenAI互換サーバーとして起動
exo serve --port 8000 --model llama-3.3-70b
```

### Claude Code Routerでexoを使用

```json
{
  "routes": {
    "background": {
      "provider": "openai",
      "model": "llama-3.3-70b",
      "baseUrl": "http://localhost:8000/v1"
    }
  }
}
```

## ハードウェア要件

| モデルサイズ | 最小構成 |
|-------------|---------|
| 3B-7B | 1台のM1/M2 Mac |
| 13B-30B | 2台のM2/M3 Mac |
| 70B | 2-4台のM2 Ultra以上 |
| 405B | 4台のM3 Ultra |

## ユースケース

1. **プライベートLLM** - クラウド不要のローカル推論
2. **コスト削減** - 既存デバイスの活用
3. **低レイテンシ** - ローカルネットワーク内処理
4. **プライバシー** - データが外部に出ない
