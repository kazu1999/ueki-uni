# UEKI Unified App (Chat / Call Logs / FAQ / Function Config / DataBase)

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

- `/` ホーム（接続番号案内: +1 231 797 2645）
- `/chat` チャット
- `/call-logs` 通話ログ可視化（セッション毎の「Show logs」でLambdaログ表示）
  - 機能: フィルタ、ページング、JST表示、各ターン削除、セッション一括削除（call_sid）
- `/faq` FAQ 管理
- `/prompt` システムプロンプト編集（Markdownプレビュー）
- `/func-config` Function Calling 設定（JSON整形プレビュー）
- `/tasks` DataBase（Tasks CRUD 管理）
- `/ext-tools` External APIs（外部APIツール設定・JSON整形プレビュー）

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
- `GET /prompt` / `PUT /prompt`
- `GET /func-config` / `PUT /func-config`
- `GET /tasks` / `POST /task` / `GET|PUT|DELETE /task/{name}`
- `GET /chat-logs`（CloudWatch Logs 取得）
- `GET /ext-tools` / `PUT /ext-tools`（外部APIツール定義の取得・保存）

詳細は `chat_api/aws.md` を参照してください。

## チャット操作（ショートカット）

- 改行: Enter / Shift+Enter
- 送信: Cmd+Enter（macOS）または Ctrl+Enter（Windows/Linux）

送信後は入力欄を自動クリアします。

## 表示とデータの正規化

- 時刻表示: 画面上の時刻（セッション最新時刻・各ターン・ログプレビュー）は日本標準時（Asia/Tokyo, `YYYY-MM-DD HH:mm:ss`）で表示します。
- 電話番号の正規化（バックエンド）:
  - `+81xxxxxxxxxx` は `0xxxxxxxxxx` に変換して保存
  - それ以外の `+` は除去。数字以外は除去
  - 同一の実番号で形式差（+有無）があっても同じキーで集約
- チャット履歴の参照: `call_sid` がある場合は同一電話番号かつ同一 `call_sid` のログのみ履歴として参照します。

## プロンプト（Markdown）運用

- システムプロンプトは DynamoDB `ueki-prompts` に Markdown で保存され、`/chat` 呼び出し時に読み込まれます。

例:
```
EP=https://so0hxmjon8.execute-api.ap-northeast-1.amazonaws.com
curl -s "$EP/prompt" | jq .
```

## ディレクトリ

- `src/pages/Chat.tsx`
- `src/pages/CallLogs.tsx`
- `src/pages/Faq.tsx`
- `src/pages/Prompt.tsx`
- `src/pages/FuncConfig.tsx`
- `src/pages/Tasks.tsx`
- `src/pages/ExtTools.tsx`
- `src/shared/api/*`（共通 API クライアント）
- `src/shared/types/*`（共通型）
- `src/styles/*`（スタイル）

## トラブルシューティング

- Vite が起動するが警告が出る: Node 20.19+ 推奨。`nvm use 20.19.0` へ更新。
- React Router の v7 警告: 絶対パス（`/chat` など）を使用しているため機能影響なし。無視可。
- 500 / CORS エラー: `VITE_API_BASE_URL` を AWS に設定。新規エンドポイント（例 `/chat-logs`）追加後は数十秒待機してから再試行。

