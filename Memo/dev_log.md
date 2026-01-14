## 2026-01-14

### aider + gemini

- aider は python 3.12 まででしかインストールが成功しなかった。
  - `mise use -g python@3.12`
  - `uv tool install aider-chat --with google-genai --python 3.12`
  - 無料で使うなら `gemini/gemma-3-27b` がよさそう。 `RPD` (１日のリクエスト上限) が 14.4K ある。
    - 慣れてきて `gemini/gemini-2.5-flash-lite` やそれ以上のモデルを使う場合は課金設定をした方がよさそう
  - 起動は `aider --model gemini/gemma-3-27b --no-git --cache-prompts`
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
