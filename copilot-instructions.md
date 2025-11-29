# Copilot Coding Agent 向け指示文

あなたは Next.js 15 (App Router) + TypeScript + Supabase を使った Web アプリの実装を行うコーディングエージェントです。

---

## ゴール

X (旧 Twitter) の投稿を Supabase に保存し、以下のように表示する機能を実装してください。

- トピック例：
  - 「高市早苗」
  - 「生成AI」
  - 「年末セール」
- トピックごとに X API で投稿を収集し、Supabase に保存する
- フロントエンドでは、トピックごとにタイムライン画面を表示する
- 1つの投稿カードには以下を表示する：
  - 投稿者アイコン
  - 表示名
  - @ユーザー名
  - 投稿日時
  - 日本語の原文テキスト（X API から取得したものを改変せずに表示）
  - その下に、英訳テキスト（このアプリによる自動翻訳）
  - X へのリンク（新しいタブで開く）
- タイムラインとは別の領域（右カラムやフッター、ヘッダーなど）に「広告エリア」を用意する
  - 見た目とラベルで「広告」「スポンサーリンク」と明確にわかるようにする
  - X の投稿カードと紛らわしい UI にはしない

---

## 技術スタック

- Next.js 15 (App Router) / TypeScript
- Supabase (PostgreSQL) をバックエンドとして使用
  - すでに以下のテーブルがある前提で実装する（スキーマは後述）：
    - `topics`
    - `posts`
    - `topic_posts`
- Supabase クライアントは supabase-js v2 を使用
- 認証はこのタスクでは深く扱わず、閲覧はすべて匿名ユーザーで OK（Supabase 側で RLS を調整する前提）

---

## データモデル（概要）

### `topics`

- 各トピック（高市早苗 / 生成AI / 年末セール など）を表す
- X 検索クエリ（例: `"高市早苗 lang:ja -is:retweet"`）を `query` カラムに持つ
- インクリメンタル取得用に `latest_twitter_post_id` を持つ（最後に取得したツイート ID）

### `posts`

- X の個々の投稿を表す
- `twitter_post_id`（X 側の ID）で一意になる
- 原文テキスト `original_text` と、英訳 `translated_text_en` を保持する
- 投稿日時 `tweeted_at` と、統計情報（いいね数など）を必要に応じて持つ
- `is_deleted` フラグで X 上で削除／非公開になった投稿をマークする

### `topic_posts`

- 多対多の中間テーブル
- どのトピックにどの投稿が紐づいているかを表す

---

## 実装してほしいもの

### 1. Supabase 用の TypeScript 型定義

- `Database` 型（`supabase` が生成する型を使うか、最低限 topics / posts / topic_posts の型を自前で定義）
- `Topic`, `Post`, `TopicPost` の TypeScript 型

---

### 2. トピック一覧ページ

- パス: `/topics`
- 役割:
  - Supabase から `topics` を取得し、一覧表示する
  - 各トピックをクリックすると `/topics/[slug]` に遷移する
- 実装:
  - App Router の Server Component で Supabase から `select` して表示

---

### 3. トピック別タイムラインページ

- パス: `/topics/[slug]`
- 役割:
  - URL の `[slug]` から `topics.slug` を特定
  - `topics` と `topic_posts` + `posts` を join して、そのトピックのタイムラインを取得
  - `tweeted_at` の降順で並べる
  - ページネーション（`?page=1` / `?page=2` など）をサポート
- UI 要件:
  - 左側: タイムライン（投稿カードのリスト）
  - 右側 or 下部: 広告エリア（ダミーで OK、コンポーネントとして切り出す）
- 投稿カード:
  - 日本語原文と英訳を、以下のような構造で表示する：

    ```text
    [アイコン] 表示名  @handle    X ロゴ
    投稿日: 2025-11-29 12:34  （クリックで X の元ポストへ）

    日本語原文:
    <original_text>

    英訳（自動翻訳）:
    <translated_text_en>
    ```

  - `translated_text_en` が null の場合は、「翻訳がありません」などのメッセージを表示

---

### 4. 同期用 API ルート（サーバー側）

- パス例: `POST /api/admin/topics/[slug]/sync`
- 役割:
  - `[slug]` に対応する `topics` レコードを取得
  - `topic.query` と `topic.latest_twitter_post_id` をもとに X API (Recent Search) を呼び出す
    - 実装では実際の X API 呼び出し部分は以下のような抽象化関数に切り出すこと：
      - `async function fetchTweetsForTopic(topic: Topic): Promise<RawTweet[]>`
  - 取得したツイートを `posts` テーブルに `upsert` する
    - `twitter_post_id` で一意制約
  - 各ツイートとトピックの関係を `topic_posts` に `insert` する（存在チェック付き）
  - 新規取得分については、以下のような翻訳関数を呼び出して `translated_text_en` を保存する：
    - `async function translateToEnglish(text: string): Promise<string>`
    - 実装ではこの関数はモックでよい（呼び出しだけ作り、内部は `return text;` などで OK）
  - 最後に、取得したツイートの中で最も新しい `twitter_post_id` を `topics.latest_twitter_post_id` に保存する
- 注意:
  - 実際の X API キーや翻訳 API キーは、環境変数から受け取る前提で、ハードコードしないこと
  - エラーハンドリングは最低限でもよいが、失敗時は 500 を返す

---

### 5. フロントから同期 API を叩く仕組み

- 管理用の簡易 UI を `/admin/topics` で用意してもよい
  - 各トピックに「同期」ボタンがあり、`/api/admin/topics/[slug]/sync` に POST する
  - 認証・認可はこのタスクでは考慮しなくてよいが、将来的にトークンや Basic 認証を入れられるよう、サーバー側でヘッダチェックを追加しやすい構造にしておく

---

## 非機能要件

- API ルート、Server Component など、Next.js App Router の推奨パターンに従うこと
- TypeScript の型エラーが出ないこと
- Supabase クライアントはサーバー側とクライアント側でインスタンスを分ける（必要なら `lib/supabase/server.ts` / `lib/supabase/client.ts` などを用意）
- X API と翻訳 API は、現時点では「ダミー実装 or 抽象化関数」の形でよい
  - あとから実際の API 実装を差し替えられるようにすること
