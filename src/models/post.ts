import { z } from "zod";

export const postSchema = z.object({
    id: z.string().uuid("id must be a valid UUID"),
    content: z.string().min(1, "content must be at least 1 characters long"),
    author_id: z.string().uuid("authorId must be a valid UUID"),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export type Post = z.infer<typeof postSchema>