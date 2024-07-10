start_db:
	docker-compose up -d

stop_db:
	docker-compose down

migrate:
	db-migrate up -e dev

rollback:
	db-migrate down

create-transaction-files:
	db-migrate create transactions --sql-file

create-migration:
	db-migrate create $(n) --sql-file

server:
	yarn dev

.PHONY: start_db stop_db server migrate rollback create-migration create-transaction-files
