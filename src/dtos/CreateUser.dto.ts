import { z } from "zod"

export const CreateUserSchema = z.object({
    username: z.string({ message: "username must be string" }),
    email: z.string({ message: "email is required" }).email("email must be a valid email"),
    password: z.string({ message: "password is required" }).min(6, "password must be at least 6 characters"),
})

export type CreateUser = z.infer<typeof CreateUserSchema>