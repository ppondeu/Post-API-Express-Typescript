import { z } from "zod";

export const updateUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").optional(),
    password: z.string().min(8, "Password must be at least 8 characters long").optional(),
    refresh_token: z.string().nullable().optional(),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;