import { z } from "zod";
export const updatePostSchema = z.object({
    content: z.string().min(1),
    updated_at: z.string().datetime(),
})

export type UpdatePost = z.infer<typeof updatePostSchema>