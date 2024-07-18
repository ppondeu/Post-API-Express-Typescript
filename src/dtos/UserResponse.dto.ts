import { z } from "zod";

export const userResponseSchema = z.object({
    id: z.string().uuid("id must be a valid UUID"),
    username: z.string().min(3, "name must be at least 3 characters long"),
    email: z.string().email("email must be a valid email address"),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
