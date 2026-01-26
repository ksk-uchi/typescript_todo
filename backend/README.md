# typescript_todo backend

## 事前準備

1. `.env.local.sample` から `.env.local` を作成する

   ```shell
   $ cp .env.local.sample .env.local
   ```

2. 必要なテーブルを作成する (コンテナ起動後)

   ```shell
   $ make migrate
   ```

3. Prisma Client を生成する (コンテナ起動後)

   ```shell
   $ make prisma-gen
   ```

## run on WSL2

### netavark

podman を使う場合は `~/.config/containers/containers.conf` に下記を記載しないと `compose up` 失敗するかも。。。

```conf
[network]
firewall_driver="iptables"
```

## command

### start local dev

```shell
$ podman compose up --build
```

### run migration

```shell
$ make migrate
```

### create migration file

```shell
$ make migrate-gen name=(name)
```

### prisma client generate

```shell
$ make prisma-gen
```

### db connect

```shell
$ make localdb
```

### update local db

```shell
$ make dump
```

### stop local dev

```shell
$ podman compose down -v
```

### run test

```shell
$ pnpm test:local
```
