import { z } from "zod";
export const idSchema = z.string().uuid();

export type ID = z.infer<typeof idSchema>