# UEKI Unified App (Chat / Call Logs / FAQ / Function Config / DataBase)

React 19 + Vite 7 で 3 つのアプリ（チャット、通話ログ、FAQ）を単一 SPA に統合したプロジェクトです。
マルチテナントに対応し、AWS Cognito による認証ログインが必要です。

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
これらの値は `chat_api/terraform` の `terraform apply` 結果（output）から取得できます。

```bash
VITE_API_BASE_URL=https://{api_id}.execute-api.{region}.amazonaws.com
VITE_COGNITO_REGION=ap-northeast-1
VITE_COGNITO_USER_POOL_ID=ap-northeast-1_xxxxxx
VITE_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxx
```

4) 開発サーバー起動

```
npm run dev -- --host
```

## 認証とテナント管理

本アプリは **AWS Amplify** を使用した Cognito 認証を実装しています。
API へのリクエストには自動的に認証トークン（JWT）が付与されます。

### ログイン
- ユーザーは管理者（AWSコンソール等）によって作成・招待されます。
- **自己登録（Sign Up）は無効化**されています。
- ログイン時にユーザー属性 `custom:tenant_id` に基づいてテナント（例: `ueki`, `nespe`）が識別され、そのテナントのデータのみが表示・操作可能になります。

## ルーティング

- `/` ホーム（接続番号案内: +1 231 797 2645）
- `/chat` チャット
- `/call-logs` 通話ログ可視化（セッション毎の「Show logs」でLambdaログ表示）
  - 機能: フィルタ、ページング（クライアント側）、JST表示、各ターン削除、セッション一括削除（call_sid）、録音再生（Twilio, 「Show recordings」）
  - 備考: 取得の `limit` はターン（アイテム）件数の上限で、既定は 1000。セッション数ではありません
  - 追加: 録音の文字起こし（OpenAI Whisper, 「Transcribe (Whisper)」）
    - 事前にバックエンド（`ueki-calllogs`）で Secrets Manager の `UEKI_OPENAI_APIKEY` を設定
    - `GET /transcription?recording_sid=RE...` を呼び出してテキストを表示
    - 注意: 同期APIのため、処理時間は約30秒まで（Lambdaタイムアウト30秒）。長尺・高負荷時は失敗することがあります
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
- `GET /recordings`（Twilio録音一覧: `?call_sid=CA...`）
- `GET /recording/{sid}`（Twilio録音ストリーム: `?format=mp3|wav`）
- `GET /transcription`（録音の文字起こし: `?recording_sid=RE...`）

詳細は `chat_api/readme.md`（API詳細）および `chat_api/aws.md` を参照してください。

## Call Logs 操作メモ

- 電話番号を選択 → 「Load Calls」で最新から取得（必要に応じて「Load More」）
- セッション行の「Show turns」で発話の詳細、「Show logs」で Lambda ログ、「Show recordings」で録音を `<audio>` 再生
- 取得の並び順は最新優先（desc）。`limit` はターン件数の上限（既定 1000）。多数ある場合でも画面はページング表示

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

- システムプロンプトは DynamoDB `app-prompts` に Markdown で保存され、`/chat` 呼び出し時に読み込まれます。

例:
```
EP=https://so0hxmjon8.execute-api.ap-northeast-1.amazonaws.com
# 認証ヘッダーが必要
curl -s "$EP/prompt" -H "Authorization: Bearer <ID_TOKEN>" | jq .
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
- `src/shared/auth-fetch.ts`（認証付きフェッチラッパー）

## トラブルシューティング

- Vite が起動するが警告が出る: Node 20.19+ 推奨。`nvm use 20.19.0` へ更新。
- React Router の v7 警告: 絶対パス（`/chat` など）を使用しているため機能影響なし。無視可。
- 500 / CORS エラー: `VITE_API_BASE_URL` を AWS に設定。新規エンドポイント（例 `/chat-logs`）追加後は数十秒待機してから再試行。
- 401 Unauthorized: ログインセッションが切れている可能性があります。ページをリロードして再ログインしてください。
