import z from "zod";

export const createSubscriptionZodSchema = z.object({
  plan: z.enum(["FREE", "MONTHLY", "YEARLY"], {
    message: "Plan must be FREE, MONTHLY, or YEARLY",
  }),
});

export type CreateSubscriptionPayload = z.infer<typeof createSubscriptionZodSchema>;