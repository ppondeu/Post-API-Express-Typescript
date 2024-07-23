import { Request, Response, NextFunction } from "express-serve-static-core";
import { z } from "zod";
import { ApiResponse } from "../dtos/ApiResponse.dto";
import { UserResponse } from "../dtos/UserResponse.dto";
import { UserService } from "../services/userService";
import { handleError } from "../utils/errs";
import { BadRequestException, NotFoundException } from "../utils/exception";
import { updateUserSchema } from "../dtos/UpdateUser.dto";

export class UserHandler {
    constructor(private readonly userSrv: UserService) { }

    async getUsers(_req: Request, res: Response<ApiResponse<UserResponse[]>>, next: NextFunction) {
        try {
            const users = await this.userSrv.getUsers();
            const usersResp = users.map((user) => {
                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                };
            });
            return res.status(200).json({ success: true, data: usersResp });
        } catch (err) {
            handleError(err, "Error getting users");
            next(err);
        }
    }

    async getUser(req: Request, res: Response<ApiResponse<UserResponse>>, next: NextFunction) {
        const userIdSchema = z.string().uuid("id is not a valid uuid");
        const idPayload = userIdSchema.safeParse(req.params.id);
        if (!idPayload.success) {
            console.log("error on user handler get user", idPayload.error.errors[0].message);
            return next(new BadRequestException(idPayload.error.errors[0].message));
        }
        const userId = idPayload.data;

        try {
            const user = await this.userSrv.getUser(userId);
            if (!user) return next(new NotFoundException(`User with id ${userId} not found`));
            const userResp: UserResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
            };
            return res.status(200).json({ success: true, data: userResp });
        } catch (err) {
            handleError(err, "user handler get user by id");
            next(err);
        }
    }

    async getUserByUsername(req: Request, res: Response<ApiResponse<UserResponse>>, next: NextFunction): Promise<any> {
        const usernameSchema = z.string().min(3, "username must be at least 3 characters long");
        const usernamePayload = usernameSchema.safeParse(req.params.username);
        if (!usernamePayload.success) {
            console.log("error on user handler get user by username", usernamePayload.error.errors[0].message);
            return next(new BadRequestException(usernamePayload.error.errors[0].message));
        }
        const username = usernamePayload.data;

        try {
            const user = await this.userSrv.getUserByUsername(username);
            if (!user) return next(new NotFoundException(`User with username ${username} not found`));
            const userResp: UserResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
            };
            return res.status(200).json({ success: true, data: userResp });
        } catch (err) {
            handleError(err, "user handler get user by username");
            next(err);
        }
    }

    async updateUser(req: Request, res: Response<ApiResponse<UserResponse>>, next: NextFunction): Promise<any> {
        const userIdSchema = z.string().uuid("id is not a valid uuid");
        const idPayload = userIdSchema.safeParse(req.params.id);
        if (!idPayload.success) {
            console.log("error on user handler update user", idPayload.error.errors[0].message);
            return next(new BadRequestException(idPayload.error.errors[0].message));
        }

        const updateUserPayload = updateUserSchema.safeParse(req.body);
        if (!updateUserPayload.success) {
            console.log("error on user handler update user", updateUserPayload.error.errors[0].message);
            return next(new BadRequestException(updateUserPayload.error.errors[0].message));
        }

        const updateData = updateUserPayload.data;

        try {
            const user = await this.userSrv.updateUser(idPayload.data, updateData);
            if (!user) return next(new NotFoundException(`User with id ${idPayload.data} not found`));
            const userResp: UserResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
            };
            return res.status(200).json({ success: true, data: userResp });
        } catch (err) {
            handleError(err, "user handler update user");
            next(err);
        }
    }

    async deleteUser(req: Request, res: Response<ApiResponse<undefined>>, next: NextFunction) {
        const userIdSchema = z.string().uuid("id is not a valid uuid");
        const idPayload = userIdSchema.safeParse(req.params.id);
        if (!idPayload.success) {
            console.log("error on user handler delete user", idPayload.error.errors[0].message);
            return next(new BadRequestException(idPayload.error.errors[0].message));
        }
        const userId = idPayload.data;

        try {
            const ok = await this.userSrv.deleteUser(userId);
            if (!ok) return next(new NotFoundException(`User with id ${userId} not found`));
            return res.status(200).json({ success: true, message: "User deleted successfully" });
        } catch (err) {
            handleError(err, "user handler delete user");
            next(err);
        }
    }
}