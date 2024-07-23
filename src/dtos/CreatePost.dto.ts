import { z } from "zod";

export const createPostSchema = z.object({
    content: z.string().min(1, "content must be at least 1 character")
})

export type CreatePost = z.infer<typeof createPostSchema>
