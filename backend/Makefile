localdb:
	podman compose exec db mysql -u user -p
dump:
	podman compose exec db mysqldump --defaults-extra-file=/etc/mysql/conf.d/my.conf todo_db > ./Container/db/db_init/dump.sql
migrate:
	pnpm dotenvx run -f .env.local.dev -- pnpm exec prisma migrate dev
migrate-gen:
	pnpm dotenvx run -f .env.local.dev -- pnpm exec prisma migrate dev --name $(name)
prisma-gen:
	pnpm dotenvx run -f .env.local.dev -- pnpm exec prisma generate
