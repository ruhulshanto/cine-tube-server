import z from "zod";

export const registerValidationSchema = z.object({
  firstName: z
    .string({ message: "First name is required" })
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string({ message: "Last name is required" })
    .min(2, "Last name must be at least 2 characters"),
  username: z
    .string({ message: "Username is required" })
    .min(3, "Username must be at least 3 characters"),
  email: z
    .string({ message: "Email is required" })
    .email("Please provide a valid email"),
  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginValidationSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Please provide a valid email"),
  password: z.string({ message: "Password is required" }),
});

export const refreshTokenValidationSchema = z.object({
  refreshToken: z.string({ message: "Refresh token is required" }),
});

export const changePasswordValidationSchema = z.object({
  currentPassword: z.string({ message: "Current password is required" }),
  newPassword: z
    .string({ message: "New password is required" })
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const forgotPasswordValidationSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Please provide a valid email"),
});

export const resetPasswordValidationSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Please provide a valid email"),
  token: z.string({ message: "Reset token is required" }).min(10),
  newPassword: z
    .string({ message: "New password is required" })
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterPayload = z.infer<typeof registerValidationSchema>;
export type LoginPayload = z.infer<typeof loginValidationSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenValidationSchema>;
export type ChangePasswordPayload = z.infer<
  typeof changePasswordValidationSchema
>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordValidationSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordValidationSchema>;
