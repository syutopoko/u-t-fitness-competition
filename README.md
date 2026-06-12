# うさとらコンペ / U&T COMPETITION

U&T Fitness会員向けの体力測定・身体データ・ランキング確認Webアプリです。MVPではGitHub、Vercel、Supabase、Next.jsだけで完結し、Instagram APIやInBodyDialなどの外部連携は使いません。

## 使用技術

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Row Level Security
- Recharts
- Vercel
- GitHub

## 必要な環境変数

`.env.local` を作成してください。

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/xxxxxxxx
```

`SUPABASE_SERVICE_ROLE_KEY` はMVPの画面実行には不要です。使う場合もクライアント側へ絶対に露出しないでください。

## ローカル起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## Supabaseプロジェクト作成手順

1. Supabaseで新規プロジェクトを作成します。
2. Project Settings > API から `Project URL` と `anon public` key を取得します。
3. Authentication > Providers > Email を有効化します。
4. Authentication > Sign In / Providers 付近でメール確認を無効化します。ダミーメール `@usatora.local` を使うため、確認メール必須のままだと登録直後のプロフィール作成ができません。
5. SQL Editorを開きます。
6. [supabase/schema.sql](./supabase/schema.sql) の全文をSQL Editorへ貼り付けて実行します。

## Supabase SQL Editorに貼るSQL

SQLは [supabase/schema.sql](./supabase/schema.sql) にあります。以下を含みます。

- `profiles`
- `fitness_records`
- `body_measurements`
- `announcements`
- `app_settings`
- `approved_rankings` ビュー
- `pending_records` ビュー
- `updated_at` トリガー
- RLSポリシー
- 管理者判定関数

## RLSポリシー設定

[supabase/schema.sql](./supabase/schema.sql) を実行すると、全テーブルでRLSが有効になります。

- 会員は自分の `profiles`、`fitness_records`、`body_measurements` を閲覧・作成・更新できます。
- 会員はランキング表示用に承認済み記録だけを `approved_rankings` ビューから閲覧できます。
- 管理者は全プロフィール、全記録、全身体データ、お知らせ、設定を管理できます。
- お知らせは公開中かつ公開日時を過ぎたものだけ会員に表示されます。
- `profiles.role` の変更はトリガーで管理者のみに制限しています。

## 認証仕様

会員は名前とパスワードだけで登録・ログインします。画面上は「名前」と表示しますが、既存DB互換のため内部カラム名は `instagram_name` のままです。入力された名前は小文字化し、Supabase Auth用のダミーメールを生成します。

```text
名前: usatora_member
内部メール: usatora_member@usatora.local
```

名前は英数字、アンダースコア、ドットのみ許可されます。

## 管理者アカウントの作り方

MVPでは、通常の会員登録画面から管理者用の名前で登録したあと、Supabase SQL Editorで `profiles.role` を `admin` に変更します。

```sql
update profiles
set role = 'admin'
where instagram_name = 'ut_fitness_admin';
```

変更後、一度ログアウトして再ログインすると管理者メニューが使えます。

## ランキング承認フロー

1. 会員が体力テスト記録を入力します。
2. アプリが当月・同種目の承認済み上位3件と比較します。
3. 上位3位以内に入る可能性がある場合は `pending` で保存します。
4. 上位3位に入らない場合は `normal` で保存します。
5. 管理者が `/admin/approvals` で承認すると `approved` になります。
6. 否認すると `rejected` になります。
7. 全体ランキングには `approved` のみ表示されます。

## GitHubへのpush方法

```bash
git init
git add .
git commit -m "Initial U&T Competition MVP"
git branch -M main
git remote add origin git@github.com:YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

## Vercelへのデプロイ方法

1. GitHubへpushします。
2. Vercelで `Add New Project` を選択します。
3. GitHubリポジトリを選びます。
4. Framework Preset は Next.js のままにします。
5. Environment Variables に以下を設定します。
6. Deploy を実行します。

## Vercelに設定する環境変数

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/xxxxxxxx
```

## 実装済みページ

- `/login`
- `/register`
- `/dashboard`
- `/records/new`
- `/body/new`
- `/charts`
- `/rankings`
- `/profile`
- `/admin`
- `/admin/approvals`
- `/admin/announcements`
- `/admin/members`
- `/admin/rankings`

## MVPで実装しないもの

- Instagram APIログイン
- Instagram OAuth
- InBodyDial自動連携
- LINEログイン
- Stripe決済
- メール配信サービス
- 独自サーバー
- Firebase / AWS / GCP
