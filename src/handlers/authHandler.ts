import { Request, Response, NextFunction } from "express-serve-static-core";
import { z } from "zod";
import { AuthService } from "../services/authService";
import { ForbiddenException, UnauthorizedException } from "../utils/exception";
import { LoginPayloadSchema } from "../dtos/LoginPayload.dto";
import { CreateUserSchema } from "../dtos/CreateUser.dto";
import { ApiResponse } from "../dtos/ApiResponse.dto";
import { AuthResponse } from "../dtos/AuthResponse.dto";
export class AuthHandler {
    constructor(private readonly authSrv: AuthService) { }

    async login(req: Request, res: Response, next: NextFunction) {
        const loginData = req.body;
        const loginPayload = LoginPayloadSchema.safeParse(loginData);
        if (!loginPayload.success) {
            const errorMessages = loginPayload.error.errors.map((err) => err.message).join(", ");
            return next(new ForbiddenException(errorMessages));
        }

        try {
            const authResponse = await this.authSrv.login(loginPayload.data);
            if (!authResponse.token?.accessToken || !authResponse.token?.refreshToken) return next(new ForbiddenException("Access token not found"));
            res.cookie("accessToken", authResponse.token.accessToken, { httpOnly: true, maxAge: 1000 * 60 });
            res.cookie("refreshToken", authResponse.token.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 });


            return res.status(200).json({ success: true, data: authResponse });
        } catch (err) {
            return next(err);
        }
    }

    async register(req: Request, res: Response<ApiResponse<AuthResponse>>, next: NextFunction) {
        const registerPayload = CreateUserSchema.safeParse(req.body);
        if (!registerPayload.success) {
            const errorMessages = registerPayload.error.errors.map((err) => err.message).join(", ");
            return next(new ForbiddenException(errorMessages));
        }
        console.log("registerPayload", registerPayload.data)

        try {
            const authResponse = await this.authSrv.register(registerPayload.data);
            if (!authResponse.token?.accessToken || !authResponse.token?.refreshToken) return next(new ForbiddenException("Access token not found"));
            res.cookie("accessToken", authResponse.token.accessToken, { httpOnly: true, maxAge: 1000 * 60 });
            res.cookie("refreshToken", authResponse.token.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 });
            return res.status(201).json({ success: true, data: authResponse });
        } catch (err) {
            return next(err);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return next(new UnauthorizedException());

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        try {
            const ok = await this.authSrv.logout(refreshToken);
            if (!ok) return next(new ForbiddenException("Logout failed"));
            return res.status(200).json({ success: true, data: "Logged out successfully" });
        } catch (err) {
            return next(err);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return next(new UnauthorizedException());

        res.clearCookie("accessToken");

        const tokenSchema = z.string().min(1, "refresh token is required");
        const tokenPayload = tokenSchema.safeParse(refreshToken);
        if (!tokenPayload.success) {
            res.clearCookie("refreshToken");
            return next(new ForbiddenException(tokenPayload.error.errors[0].message));
        }

        try {
            const authResponse = await this.authSrv.refreshToken(tokenPayload.data);
            console.log("authResponse", authResponse)
            if (!authResponse.token?.accessToken) return next(new ForbiddenException("Access token not found"));
            res.cookie("accessToken", authResponse.token.accessToken, { httpOnly: true, maxAge: 1000 * 60 });
            return res.status(200).json({ success: true, data: authResponse });
        } catch (err) {
            res.clearCookie("refreshToken");
            return next(err);
        }
    }

    async fetchMe(req: Request, res: Response, next: NextFunction) {
        const userId = req.userID;
        if (!userId) return next(new Error("User ID not found"));

        try {
            const user = await this.authSrv.fetchMe(userId);
            if (!user) return next(new Error("User not found"));
            return res.status(200).json({ success: true, data: user });
        } catch (err) {
            return next(err);
        }
    }
}