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
