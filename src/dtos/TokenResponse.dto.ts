import { z } from "zod";

export const tokenResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional()
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;