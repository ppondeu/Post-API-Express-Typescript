
import bcrypt from "bcrypt";
import { v4 as uuidv4, validate } from "uuid";
import { z } from "zod";
import { CreateUser } from "../dtos/CreateUser.dto";
import { LoginDTO } from "../dtos/LoginPayload.dto";
import { JwtService } from "./jwtService";
import { UserService } from "./userService";
import { AuthResponse } from "../dtos/AuthResponse.dto";
import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from "../utils/exception";
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN, REFRESH_TOKEN_SECRET } from "../config/config";
import { UserResponse } from "../dtos/UserResponse.dto";

export interface AuthService {
    register: (createUser: CreateUser) => Promise<AuthResponse>
    login: (loginData: LoginDTO) => Promise<AuthResponse>
    logout: (refreshToken: string) => Promise<boolean>
    refreshToken: (refreshToken: string) => Promise<AuthResponse>
    fetchMe: (id: string) => Promise<AuthResponse>
}

export class AuthServiceImpl implements AuthService {
    constructor(
        private readonly userSrv: UserService,
        private readonly jwtSrv: JwtService
    ) { }

    async register(createUser: CreateUser): Promise<AuthResponse> {
        try {
            console.log("createUser", createUser)
            const userId = uuidv4();
            const refreshToken = this.jwtSrv.generateToken({ sub: userId }, REFRESH_TOKEN_SECRET!, REFRESH_TOKEN_EXPIRES_IN!);
            const hashedPassword = await this.hashPassword(createUser.password);
            const userRaw = { ...createUser, id: userId, password: hashedPassword, refreshToken };
            const user = await this.userSrv.createUser(userRaw)
            const accessToken = this.jwtSrv.generateToken({ sub: userId }, ACCESS_TOKEN_SECRET!, ACCESS_TOKEN_EXPIRES_IN!);

            const userResponse: UserResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
            }

            return {
                user: userResponse, token: { accessToken, refreshToken }
            }
        } catch (err) {
            console.log(`error on auth service register: ${err}`);
            throw err;
        }
    }

    async login(loginData: LoginDTO): Promise<AuthResponse> {
        try {
            let user = await this.userSrv.getUserByEmail(loginData.email);
            if (!user) throw new NotFoundException("User not found");

            const ok = await this.comparePassword(loginData.password, user.password);
            if (!ok) throw new BadRequestException("Invalid password");

            const userId = user.id;
            const accessToken = this.jwtSrv.generateToken({ sub: userId }, ACCESS_TOKEN_SECRET!, ACCESS_TOKEN_EXPIRES_IN!);
            const refreshToken = this.jwtSrv.generateToken({ sub: userId }, REFRESH_TOKEN_SECRET!, REFRESH_TOKEN_EXPIRES_IN!);
            user = await this.userSrv.updateUser(userId, { refreshToken });
            if (!user) throw new NotFoundException("User not found");

            const userResponse: UserResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
            }

            return {
                user: userResponse, token: { accessToken, refreshToken }
            }
        } catch (err) {
            console.log(`error on auth service login: ${err}`);
            throw err;
        }
    }

    async logout(refreshToken: string): Promise<boolean> {

        try {
            const user = await this.userSrv.getUserByRefreshToken(refreshToken);
            if (!user) throw new ForbiddenException();
            const userId = user.id;
            const ok = await this.userSrv.updateUser(userId, { refreshToken: null });
            if (!ok) throw new ForbiddenException();
        } catch (err) {
            console.log(`error on auth service logout: ${err}`);
            throw err;
        }
        return true;
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const payload = this.jwtSrv.verifyToken(refreshToken, REFRESH_TOKEN_SECRET!);
            if (!payload || !payload.sub) throw new ForbiddenException();

            const userId = payload.sub;
            const user = await this.userSrv.getUserByRefreshToken(refreshToken);
            if (!user) throw new ForbiddenException();
            console.log(refreshToken);
            console.log("=====================")
            console.log(user.refresh_token);
            if (user.id !== userId || user.refresh_token !== refreshToken) throw new ForbiddenException();

            const accessToken = this.jwtSrv.generateToken({ sub: userId }, ACCESS_TOKEN_SECRET!, ACCESS_TOKEN_EXPIRES_IN!);
            const userResp: UserResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
            }
            return { user: userResp, token: { accessToken } }
        } catch (err) {
            console.log(`error on auth service refresh token: ${err}`);
            throw err;
        }
    }

    async fetchMe(id: string): Promise<AuthResponse> {
        const userIdSchema = z.string().uuid("id is not a valid uuid");
        const idPayload = userIdSchema.safeParse(id);
        if (!idPayload.success) {
            console.log("error on auth service fetch me", idPayload.error.errors[0].message);
            throw new BadRequestException(idPayload.error.errors[0].message);
        }

        try {
            const user = await this.userSrv.getUser(id);
            if (!user) throw new NotFoundException(`User with id ${id} not found`);
            const userResp: UserResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
            }
            return { user: userResp }
        } catch (err) {
            console.log(`error on auth service fetch me: ${err}`);
            throw new InternalServerErrorException();
        }
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10)
    }

    private async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash)
    }

}
