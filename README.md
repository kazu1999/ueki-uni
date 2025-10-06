# UEKI Unified App (Chat / Call Logs / FAQ)

React 19 + Vite 7 で 3 つのアプリ（チャット、通話ログ、FAQ）を単一 SPA に統合したプロジェクトです。

## セットアップ

1) Node.js を推奨バージョンに更新

```
nvm install 20.19.0
nvm use 20.19.0
```

2) 依存関係インストール

```
npm install
```

3) 環境変数を設定（AWS API を使用）

`unified_app/.env.local` に以下を設定します。

```
VITE_API_BASE_URL=https://so0hxmjon8.execute-api.ap-northeast-1.amazonaws.com
```

（開発プロキシを使う場合は `VITE_API_PROXY_TARGET=http://localhost:8000` を設定し、`VITE_API_BASE_URL` は未設定にします）

4) 開発サーバー起動

```
npm run dev -- --host
```

## ルーティング

- `/chat` チャット
- `/call-logs` 通話ログ可視化
- `/faq` FAQ 管理

左のサイドバーから各ページへ移動できます。

## API 仕様

ベース URL は `VITE_API_BASE_URL`（推奨）または `/api`（開発プロキシ）を使用します。

- `POST /chat`
- `GET /calls`
- `GET /phones`
- `GET /faqs`
- `POST /faq`
- `GET /faq/{question}`
- `PUT /faq/{question}`
- `DELETE /faq/{question}`

詳細は `chat_api/aws.md` を参照してください。

## ディレクトリ

- `src/pages/Chat.tsx`
- `src/pages/CallLogs.tsx`
- `src/pages/Faq.tsx`
- `src/shared/api/*`（共通 API クライアント）
- `src/shared/types/*`（共通型）
- `src/styles/*`（スタイル）

## トラブルシューティング

- Vite が起動するが警告が出る: Node 20.19+ 推奨。`nvm use 20.19.0` へ更新。
- React Router の v7 警告: 絶対パス（`/chat` など）を使用しているため機能影響なし。無視可。
- 500 エラー（`/api/...`）: プロキシ先が未起動。`VITE_API_BASE_URL` を AWS に設定するか、バックエンドを起動。

