# express + typescript + pg

### post api authentication access + refresh token using dependency injection design pattern

###### Create User table
    CREATE TABLE users (
	id TEXT PRIMARY KEY NOT NULL,
	username VARCHAR(30) NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	password TEXT NOT NULL,
	refresh_token TEXT
    );

###### Create Post table
    CREATE TABLE posts (
	id TEXT PRIMARY KEY NOT NULL,
	author_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	content TEXT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

###### Docker Compose With Postgresql + PG Admin
    version: '3.8'

    services:
    db:
        container_name: postgresql_db
        image: postgres:16.3
        restart: always
        environment:
        POSTGRES_USER: root
        POSTGRES_PASSWORD: example
        POSTGRES_DB: mydb
        ports:
        - "5432:5432"
        volumes:
        - db_data:/var/lib/postgresql/data

    pgadmin:
        container_name: pgadmin
        image: dpage/pgadmin4:8.9
        restart: always
        environment:
        PGADMIN_DEFAULT_EMAIL: "root@mail.com"
        PGADMIN_DEFAULT_PASSWORD: "example"
        ports:
        - "5050:80"
        depends_on:
        - db

    volumes:
    db_data:
