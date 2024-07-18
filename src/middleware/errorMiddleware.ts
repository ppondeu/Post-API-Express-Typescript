import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpException } from '../utils/exception';
import { ApiResponse } from '../dtos/ApiResponse.dto';

export const errorMiddleware = (err: unknown, _req: Request, res: Response<ApiResponse<undefined>>, _next: NextFunction) => {
    if (err instanceof HttpException) {
        return res.status(err.status).json({ success: false, error: err.message });
    } else if (err instanceof Error) {
        return res.status(500).json({ success: false, error: err.message });
    } else {
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}
