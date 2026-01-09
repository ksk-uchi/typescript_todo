## 2026-01-09

### Yarn Berry (PnP モード) -> pnpm

Yarn Berry の PnP モードを使って開発を進めようと思ったが、
pnpm を使うことにした。

パフォーマンス的にそこまで変わらない (どちらも速い) が、
Yarn Berry PnP モードだといろいろ他のツールとの連携で難しい局面が出てくるかもということだった。
実際 Dockerfile を作っているときに node:25 からは corepack なる yarn のバージョンをよしなに合わせてくれるツールが同梱されなくなり、自前で `npm install corepack` しないと使えなかったり。
