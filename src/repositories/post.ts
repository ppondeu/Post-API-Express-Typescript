import { Pool } from "pg";
import { Post } from "../models/post";
import { ID } from "../dtos/Id.dto";

export interface PostRepository {
    findAll(): Promise<Post[]>;
    findAllByAuthorId(author_id: ID): Promise<Post[]>;
    findOne(id: ID): Promise<Post | null>;
    create(post: Post): Promise<Post>;
    update(queryString: string, updateParams: any[]): Promise<Post | null>
    delete(id: ID): Promise<boolean>;
}

export class PostRepositoryDB implements PostRepository {
    constructor(private readonly db: Pool) { }

    async findAll(): Promise<Post[]> {
        const { rows } = await this.db.query<Post>("SELECT posts.id, posts.content, posts.created_at, posts.updated_at, users.id as author_id, users.username as author_username FROM posts JOIN users ON posts.author_id = users.id");
        return rows;
    }

    async findAllByAuthorId(author_id: ID): Promise<Post[]> {
        const { rows } = await this.db.query<Post>("SELECT posts.id, posts.content, posts.created_at, posts.updated_at, users.id as author_id, users.username as author_username FROM posts JOIN users ON posts.author_id = users.id WHERE author_id = $1", [author_id]);
        return rows;
    }

    async findOne(id: ID): Promise<Post | null> {
        const { rows } = await this.db.query<Post>("SELECT posts.id, posts.content, posts.created_at, posts.updated_at, users.id as author_id, users.username as author_username FROM posts JOIN users ON posts.author_id = users.id WHERE posts.id = $1", [id]);
        return rows[0] || null;
    }

    async create(post: Post): Promise<Post> {
        const { rows } = await this.db.query<Post>("INSERT INTO posts (id, content, author_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *", [post.id, post.content, post.author_id, post.created_at, post.updated_at]);
        return rows[0];
    }

    async update(queryString: string, updateParams: any[]): Promise<Post | null> {
        const { rows } = await this.db.query<Post>(queryString, updateParams)
        return rows[0] || null;
    }

    async delete(id: ID): Promise<boolean> {
        const { rowCount } = await this.db.query("DELETE FROM posts WHERE id = $1", [id]);
        return rowCount === null ? false : true;
    }
}