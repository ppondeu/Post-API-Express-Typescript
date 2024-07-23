import { z } from "zod";
import { UpdateUser, updateUserSchema } from "../dtos/UpdateUser.dto";
import { User, userSchema } from "../models/user";
import { UserRepository } from "../repositories/user";
import { BadRequestException, NotFoundException } from "../utils/exception";

export interface UserService {
    getUsers(): Promise<User[]>
    getUser(id: string): Promise<User>
    getUserByUsername(username: string): Promise<User>
    getUserByEmail(email: string): Promise<User>
    getUserByRefreshToken(refreshToken: string): Promise<User>
    createUser(user: User): Promise<User>
    updateUser(id: string, user: UpdateUser): Promise<User>
    deleteUser(id: string): Promise<boolean>
}

export class UserServiceImpl implements UserService {
    constructor(private readonly userRepo: UserRepository) { }

    async getUser(id: string): Promise<User> {
        try {
            const user = await this.userRepo.findOne(id);
            if (!user) throw new NotFoundException(`User with id ${id} not found`);
            return user;
        } catch (err) {
            console.log(`error on user service get user: ${err}`);
            throw err;
        }
    }

    async getUserByUsername(username: string): Promise<User> {
        try {
            const user = await this.userRepo.findByUsername(username);
            if (!user) throw new Error(`User with username ${username} not found`);
            return user;
        } catch (err) {
            console.log(`error on user service get user by username: ${err}`);
            throw err;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepo.findByEmail(email);
            console.log(`user`, user);
            if (!user) throw new NotFoundException(`User with email ${email} not found`);
            return user;
        } catch (err) {
            console.log(`error on user service get user by email: ${err}`);
            throw err;
        }
    }

    async getUserByRefreshToken(refreshToken: string): Promise<User> {
        try {
            const user = await this.userRepo.findByRefreshToken(refreshToken);
            if (!user) throw new Error(`User with refresh token ${refreshToken} not found`);
            return user;
        } catch (err) {
            console.log(`error on user service get user by refresh token: ${err}`);
            throw err;
        }
    }

    async getUsers(): Promise<User[]> {
        try {
            const users = await this.userRepo.findAll();
            return users;
        } catch (err) {
            console.log(`error on user service get users: ${err}`);
            throw err;
        }
    }

    async createUser(createUser: User): Promise<User> {
        const userData = userSchema.safeParse(createUser);

        if (!userData.success) {
            console.log(`error on user service create user: ${userData.error.message}`);
            throw new BadRequestException(userData.error.message);
        }

        try {
            const user = await this.userRepo.create(userData.data);
            return user;
        } catch (err) {
            console.log(`error on user service create user: ${err}`);
            if (err instanceof Error && err.message.includes("duplicate key value violates unique constraint")) {
                throw new BadRequestException("Email already taken");
            } else {
                throw err;
            }
        }
    }

    async updateUser(id: string, user: UpdateUser): Promise<User> {
        const userPayload = updateUserSchema.safeParse(user);
        if (!userPayload.success) {
            console.log(`error on user service update user: ${userPayload.error.message}`);
            throw new BadRequestException(userPayload.error.message);
        }
        // pass the user data to the repository as query parameters

        const fields = Object.keys(userPayload.data).filter((key) => key !== "id" && key !== "email");
        const values = Object.values(userPayload.data).filter((value) => value !== undefined);

        if (fields.length === 0 || values.length === 0) {
            console.log(`error on user service update user: no fields to update`);
            throw new Error(`no fields to update`);
        }
        console.log(`fields`, fields);
        console.log(`values`, values);

        let queryString = `UPDATE users SET`;
        const updateParams = [];
        let paramIndex = 1;

        fields.forEach((field, index) => {
            queryString += ` ${field} = $${paramIndex}`;
            updateParams.push(values[index]);
            paramIndex++;

            if (index !== fields.length - 1) {
                queryString += `,`;
            }
        });

        queryString += ` WHERE id = $${paramIndex} RETURNING *`;
        updateParams.push(id);

        console.log(`queryString`, queryString);
        console.log(`updateParams`, updateParams);

        try {
            const user = await this.userRepo.update(queryString, updateParams);
            if (!user) throw new NotFoundException(`User with id ${id} not found`);
            console.log(`user`, user);
            return user;
        } catch (err) {
            console.log(`error on user service update user: ${err}`);
            throw err;
        }
    }

    async deleteUser(id: string): Promise<boolean> {
        const idSchema = z.string().uuid("id must be a valid UUID");
        const idPayload = idSchema.safeParse(id);
        if (!idPayload.success) {
            console.log(`error on user service delete user: ${idPayload.error.message}`);
            throw new Error(idPayload.error.message);
        }
        try {
            const ok = await this.userRepo.delete(idPayload.data);
            if (!ok) throw new Error(`User with id ${id} not found`);
            return ok;
        } catch (err) {
            console.log(`error on user service delete user: ${err}`);
            throw err;
        }
    }
}