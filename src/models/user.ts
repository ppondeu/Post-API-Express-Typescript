import { z } from 'zod';

export const userSchema = z.object({
    id: z.string().uuid("id must be a valid UUID"),
    username: z.string().min(3, "username must be at least 3 characters long"),
    email: z.string().email("email must be a valid email address"),
    password: z.string().min(8, "password must be at least 8 characters long"),
    refreshToken: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;