---
paths: "**/*"
---

# ファイル書き込みルール（必須）

## ⚠️ 重要：Write/Editツールは直接使用禁止

Write/Editツールを直接使用するとエスケープエラーが頻発し、トークンの無駄になる。
**必ずJavaScript/TypeScriptスクリプト経由でファイルを書き込むこと。**

## 書き込み手順

```
1. 一時JSスクリプトを作成（Writeツール）
   → C:/Users/Owner/.local/bin/temp-write.js

2. nodeコマンドで実行（Bashツール）
   → node C:/Users/Owner/.local/bin/temp-write.js

3. 一時ファイルを削除（Bashツール）
   → rm C:/Users/Owner/.local/bin/temp-write.js
```

## スクリプトテンプレート

```javascript
const fs = require('fs');

const content = \`
ここにファイル内容を記述
バッククォート内なのでエスケープ不要
\`;

fs.writeFileSync('D:/path/to/file.md', content, 'utf8');
console.log('File written successfully');
```

## 複数ファイルの場合

```javascript
const fs = require('fs');

const files = [
  { path: 'file1.md', content: \`内容1\` },
  { path: 'file2.md', content: \`内容2\` },
];

files.forEach(f => {
  fs.writeFileSync(f.path, f.content, 'utf8');
  console.log(\`Written: \${f.path}\`);
});
```

## 例外（Writeツール直接使用可）

| 対象 | 理由 |
|------|------|
| 一時JSスクリプト自体 | 実行後すぐ削除するため |
| 単純な1行ファイル | エスケープ問題が発生しないため |

## 禁止事項

- Editツールでの直接編集
- Writeツールでのマークダウン直接書き込み
- Bashでのcat/echo によるファイル書き込み（エスケープ問題）
- Python -c での長文書き込み（エスケープ問題）
