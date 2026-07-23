import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message content is required"),
    language: z.enum(["en", "hi"]).optional().default("en"),
  }),
});
