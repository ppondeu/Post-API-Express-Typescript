# express + typescript + pg

### post api authentication access + refresh token using dependency injection design pattern

##### API routes
- ###### Auth
    **POST /api/auth/register** create new user
    **POST /api/auth/login** log user in
    **POST /api/auth/logout** log user out
    **POST /api/auth/refresh-token** fetch refresh token
    **GET /api/auth/me** get current user with verify token

- ###### User
    **GET /api/users** get all users
    **GET /api/users/:id** get user by id
    **GET /api/users/username/:username** get user by username
    **PUT /api/users/:id** update user by id
    **DELETE /api/users/:id** delete user by id
    **GET /api/users/me** get current user
    **PUT /api/users/me** update current user

- ###### Post
    **GET /api/posts** get all posts
    **GET /api/posts/:id** get post by id
    **POST /api/posts/:id** create post by user id
    **PUT /api/posts/:id** update post by id
    **DELETE /api/posts/:id** delete post by id
    **GET /api/posts/me** get all posts by current user
    **POST /api/posts/me** create post with current user
    **PUT /api/posts/me** update post with current user

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
