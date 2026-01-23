## 2026-01-22

### 所感

- `Orders/` ディレクトリを掘って、そこに作業指示をファイルで残すようにしてみた
  - 先に作業内容の仕様をつめてから作業依頼が出せるので前より効率良い
  - 自分の仕様で考えが足りていない箇所を壁打ちできるのでとても良い
- Antigravity 経由で Gemini が応答しなくなった
  - X.com によるとどうやら Google 側の問題らしく、世界的に同様のエラーに遭遇している人が見受けられた
  - 日本人ユーザーも何人かつぶやいてたが、みんな Cursor で続きを検討したり codex で作業継続したりとエラいし慣れてるなぁという印象
    - 自分はまだこのバイブコーディング技術を習得中なのでそこまで対応力ない
      - そもそもそれがどのくらい料金かかるのかとかも分からないので少し怖い
        - Antigravity も連日こんなにコーディングしてくれてるけど無料なのかレート制限があるのか心配しながら使ってる
          - https://www.reddit.com/r/Bard/comments/1p18qbt/antigravitys_rate_limits_are_a_slap_in_the_face/?tl=ja
          - どうやら現時点ではレート制限はなさそう？無料で使い放題なのかも？？

## 2026-01-21

### 所感

- 昨日今日と AI の能力に驚かされっぱなし。Antigravity がすごすぎる。
  - エンジニアとして実装ができるって部分で他の職種と差別化してたけどもう無理そう。
  - AI を使いこなして、爆速で開発していけるようになりたい。
    - 可能であれば並列でタスクこなせるようになりたい。
      - その場合って git commit とかどうするんやろ？並列する数だけリポジトリを clone するんかな？
- 今日は設計力が問われた一日だった。
  - 実装は AI に任せて進められるけど、ディレクトリ構成とかどんなテストを持っておくかとか。
  - ある程度実装が進んだので大きくリファクタリングしたけど、まぁまぁ疲れた。 AI に意図を伝えるのに時間がかかった。
  - もう少し複雑なアプリじゃないとサービス切り出しの違和感がぬぐえない。現状の CRUD ならあまりサービスって感じじゃない。。
- Prisma が返却してくるのが DB との接続が断ち切れた状態のデータっていうのがまだ慣れない。
  - Django だと取得したデータを直接変更して `.save()` みたいにしてたのがまだ感覚として残ってる。
  - 個人的には SQL の結果はデータとして返ってくる Prisma の仕様の方がいいと思ってるので早く慣れないと。

## 2026-01-19

### 所感

- Antigravity は WSL2 上のディレクトリをクイックアクセスにピン止めした状態でファイルを開いたら編集可能になった。
  - remote でファイルを見ているわけではないためシンボリックリンクの参照がうまくいかず、 import 文がエラー表示になる。。
  - VSCode の Gemini Extension の Agent 機能を ON にしたら Antigravity と大差ない開発体験が得られた。
- もっと AI に実装させたい感ある。自分で実装するの禁止で AI による実装のみにした企業ってどこやったっけ？
  - 割と正しい判断な気がする。今更やけど自分が CTO でもそういう判断を下したかも。
    - けどもう少し AI をハンドリングしている感が出る開発手法になってからじゃないと、地に足がついてない感をぬぐえないかも。

## 2026-01-16

### 所感

- Server Side の最低限 CRUD は一応実装した
  - コンテナで動くようにしたしテストも書けるようにしたし、まぁまぁ最低限スタートするのに必要なものはそろえた。。
- `Antigravity` は WSL2 の openSUSE と相性が悪かった。。。
  - remote server をインストールできないというエラーが出る。
- frontend の実装は適当でいいかなって思ってたら Create React App の仕組みが Create React Router とかになってて、また知識更新が必要そう。。。
  - AI がなんでも最新情報をさらってコードに反映してくれたらいいのに。。。
  - frontend は適当に済ませて、はやくこのリポジトリは終わりにして次は golang 勉強しようって思ってたのに。。
    - 自分の持ってる知識にカビが生えてたのを嫌でも思い知る。。

## 2026-01-15

### 所感

- `prettier` と `prettier-plugin-organize-imports` を導入したは良いが、それにより import がアルファベタイズするようになったせいでテストがこけた。
  - Prisma Client をモック化するヘルパーの import を Prisma Client を使っているファイルの import よりも先にしないといけなかった。
- よくよく考えたら Linter を入れてなかったので導入した。
- CRUD API の実装を進めているけど、レスポンスの形をふんわりとしか考えてなかったから後から調整が必要そう。
  - 例えば Todo 1 件の詳細を取得する GET API のレスポンスに `todoStatusId` があるけど、これは展開して `displayName, priority` を返すとか
  - `todoStatusId` と `statusId` が混在しているのも気持ち悪いから `todoStatusId` に統一したいかも。

### Lefthook

- `Lefthook` という git commit hook の仕組みを導入した。
- husky でもよかったが、今後 `backend/` と同階層に `frontend/` も作るし、設定がいろいろ違う可能性も考慮して `Lefthook` にした。
- `pnpm lefthook run pre-commit` としたら手動実行できる

## 2026-01-14

### 所感

- `gemini/gemma-3-27b-it` は gemini 3 程賢くない。。
- vitest でテスト実行するの DB 接続周りがなかなかうまくいかず時間使った。
  - dotenv 使ってたけど、テストとアプリで環境変数変えたいしっていろいろ考えた結果 dotenvx 使うことにした。
    - コマンドの前に環境変数セットするようなのを `dotenvx run -f .env -- command` って感じにできる
    - これでコンテナでテスト実行もローカルでテスト実行も通るようになったけど、実際はどっちの方がメリット大きいんやろ？
- TypeScript の勉強がてらサーバーサイドの実装進めてるけど設定系のファイル多い。。
  - prisma, vitest, zod と見知らぬモジュールにたくさん出会えるのは楽しい
  - tsconfig.json がいまだに難しい。。。あれフロントエンドエンジニアの方々はどうやって基礎を身に着けるんやろ。。
- TypeScript の後は Golang もやりたいな。Golang は Antigravity 使ってもうちょっとモダンな開発スタイルでレビュー多めでやってみよっかな。

### aider + gemini

- aider は python 3.12 まででしかインストールが成功しなかった。
  - `mise use -g python@3.12`
  - `uv tool install aider-chat --with google-genai --python 3.12`
  - 無料で使うなら `gemini/gemma-3-27b-it` がよさそう。 `RPD` (１日のリクエスト上限) が 14.4K ある。
    - 慣れてきて `gemini/gemini-2.5-flash-lite` やそれ以上のモデルを使う場合は課金設定をした方がよさそう
  - 起動は `aider --model gemini/gemma-3-27b-it --no-git --cache-prompts`
    - コミットを作ってもらいたいなら `--no-git` を抜いたらよい

## 2026-01-13

### 躓いた

- `nodemon` を使うとき `TSX_DISABLE_CACHE=1` を与えてなかったのでキャッシュが効いててファイル更新が反映されなかった
- `prisma` の `PrismaMariaDb` を new するときに、　`allowPublicKeyRetrieval: true` を渡していなかったので timeout エラーが出た
- `prisma` で新しいレコードを作成する際、別テーブルのデータを含めるのであれば `connect` を使う
  ```typescript
  const table1Record = await prisma.tableOne.findUniqueOrThrow({
    where: { id: 1 },
  });
  await prisma.tableTwo.create({
    data: {
      table1: {
        connect: {
          id: table1Record.id,
        },
      },
    },
  });
  ```

## 2026-01-12

### prisma 導入

`pnpm prisma init --datasource-provider mysql --output ../generated/prisma` すると
`backend/` に `prisma/` と `prisma.config.ts` というファイルが作られた。
`prisma.config.ts` というファイルには `process` に対する参照があったが、
`tsconfig.json` に記載した `rootDir` は `backend/src/` なので、
`backend/prisma.config.ts` では `@types/node` を認識できず `process` の部分にエラーが出ていた。

これを解決する手段として `rootDir` を `backend/` とする方法と `prisma.config.ts` の先頭に
`/// <reference types="node" />` という一行を入れる方法を考えた。
`prisma.config.ts` の情報は開発中に必要なだけだと判断したため後者を選択した。

## 2026-01-09

### ToDo アプリのテーブルのアイディア

- Category テーブル
  - id
  - display_name
- SubCategory テーブル
  - id
  - display_name
  - color_code
- CategoryRelation テーブル
  - id
  - category_id
  - sub_category_id
    - NULLABLE
  - (category_id, sub_category_id は複合ユニーク)
- TodoStatus テーブル
  - id
  - display_name
  - priority
    - UNIQUE
- Todo テーブル
  - id
  - title
  - description
  - todo_status_id
  - display_order
  - created_at
  - deleted_at
- TodoStatusHistory
  - id
  - todo_id
  - todo_status_id
  - changed_at

### Yarn Berry (PnP モード) -> pnpm

Yarn Berry の PnP モードを使って開発を進めようと思ったが、
pnpm を使うことにした。

パフォーマンス的にそこまで変わらない (どちらも速い) が、
Yarn Berry PnP モードだといろいろ他のツールとの連携で難しい局面が出てくるかもということだった。
実際 Dockerfile を作っているときに node:25 からは corepack なる yarn のバージョンをよしなに合わせてくれるツールが同梱されなくなり、自前で `npm install corepack` しないと使えなかったり。
