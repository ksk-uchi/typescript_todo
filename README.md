# typescript_todo

## backend

### run on WSL2

#### netavark

podman を使う場合は `~/.config/containers/containers.conf` に下記を記載しないと `compose up` 失敗するかも。。。

```conf
[network]
firewall_driver="iptables"
```

### command

以下すべて `./backend` ディレクトリで行う

#### start local dev

```shell
$ podman compose up --build
```

#### run migration

```shell
$ podman compose exec app pnpm exec prisma migrate dev --name (name)
```

#### db connect

```shell
$ podman compose exec db mysql -u root -p
```

#### update local db

```shell
$ podman compose exec db mysqldump --defaults-extra-file=/etc/mysql/conf.d/my.conf todo_db > ./Container/db/db_init/dump.sql
```

#### stop local dev

```shell
$ podman compose down -v
```


