import z from "zod";

export const createPaymentZodSchema = z.object({
  subscriptionId: z
    .string({ message: "Subscription ID is required" })
    .uuid("Subscription ID must be a valid UUID"),
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be positive"),
  currency: z.string().max(3).optional(),
  paymentMethod: z.string().optional(),
});

export type CreatePaymentPayload = z.infer<typeof createPaymentZodSchema>;
