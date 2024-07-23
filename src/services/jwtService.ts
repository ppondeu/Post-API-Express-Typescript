
import jwt, { TokenExpiredError, JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { UnauthorizedException } from "../utils/exception";

export interface JwtService {
    generateToken(payload: { sub: string }, secret: string, expiredIn: string): string
    verifyToken(token: string, secret: string): JwtPayload
}

export class JwtServiceImpl implements JwtService {
    generateToken(payload: { sub: string }, secret: string, expiredIn: string): string {
        return jwt.sign(payload, secret, { expiresIn: expiredIn });
    }

    verifyToken(token: string, secret: string): JwtPayload {
        try {
            const payload = jwt.verify(token, secret) as JwtPayload;
            if (!payload || !payload.sub) throw new UnauthorizedException("Invalid token");
            return payload;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new Error("Token expired");
            } else if (error instanceof JsonWebTokenError) {
                throw new Error("Invalid token");
            } else {
                throw new Error("Invalid token");
            }
        }
    }
}

