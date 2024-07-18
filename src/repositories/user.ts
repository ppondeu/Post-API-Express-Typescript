import { Pool } from "pg";
import { User } from "../models/user";

export interface UserRepository {
    findOne: (id: string) => Promise<User>
    findByUsername: (username: string) => Promise<User>
    findByEmail: (email: string) => Promise<User>
    findByRefreshToken: (refreshToken: string) => Promise<User>
    findAll: () => Promise<User[]>
    create: (user: User) => Promise<User>
    update: (queryString: string, updateParams: any[]) => Promise<User>
    delete: (id: string) => Promise<boolean>
}

export class UserRepositoryDB implements UserRepository {
    constructor(private readonly db: Pool) { }

    async findOne(id: string): Promise<User> {
        try {
            const { rows } = await this.db.query<User>("SELECT * FROM users WHERE id = $1", [id]);
            return rows[0];
        } catch (err) {
            throw err
        }
    }

    async findByUsername(username: string): Promise<User> {
        try {
            const { rows } = await this.db.query<User>("SELECT * FROM users WHERE username = $1", [username]);
            return rows[0];
        } catch (err) {
            throw err
        }
    }

    async findByEmail(email: string): Promise<User> {
        try {
            const { rows } = await this.db.query<User>("SELECT * FROM users WHERE email = $1", [email]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    }

    async findByRefreshToken(refreshToken: string): Promise<User> {
        try {
            const { rows } = await this.db.query<User>("SELECT * FROM users WHERE refresh_token = $1", [refreshToken]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    }

    async findAll(): Promise<User[]> {
        try {
            const { rows } = await this.db.query<User>("SELECT * FROM users");
            return rows;
        } catch (err) {
            throw err;
        }
    }

    async create(user: User): Promise<User> {
        try {
            const { rows } = await this.db.query<User>("INSERT INTO users (id, username, email, password, refresh_token) VALUES ($1, $2, $3, $4, $5) RETURNING *", [user.id, user.username, user.email, user.password, user.refreshToken]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    }

    async update(queryString: string, updateParams: any[]): Promise<User> {
        try {
            const { rows } = await this.db.query<User>(queryString, updateParams);
            return rows[0];
        } catch (err) {
            throw err;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.db.query("DELETE FROM users WHERE id = $1", [id]);
            return true;
        } catch (err) {
            throw err;
        }
    }
}