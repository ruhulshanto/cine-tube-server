import status from "http-status";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { passwordUtils } from "../../utils/password";
import { tokenUtils } from "../../utils/token";
import {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "./auth.validation";
import AppError from "../../errorHelper/AppError";
import { IAuthUser } from "./auth.interface";
import crypto from "crypto";
import { sendEmail } from "../../utils/email";
import { envVars } from "../../config/env";

const registerUser = async (payload: RegisterPayload) => {
  const { firstName, lastName, username, email, password } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  // Hash password
  const hashedPassword = await passwordUtils.hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: "USER",
    },
  });

  // Generate tokens
  const tokenPayload: IAuthUser = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = tokenUtils.getAccessToken(tokenPayload);
  const refreshToken = tokenUtils.getRefreshToken(tokenPayload);

  return {
    message: "User registered successfully",
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  };
};

const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  // Check if user is active
  if (user.status === "SUSPENDED") {
    throw new AppError(status.FORBIDDEN, "Your account has been suspended");
  }

  // Compare password
  const isPasswordValid = await passwordUtils.comparePassword(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  // Generate tokens
  const tokenPayload: IAuthUser = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = tokenUtils.getAccessToken(tokenPayload);
  const refreshToken = tokenUtils.getRefreshToken(tokenPayload);

  return {
    message: "User logged in successfully",
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  // Verify refresh token
  const result = jwtUtils.verifyToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET || "",
  );

  if (!result.success) {
    throw new AppError(status.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  const tokenData = result.data as IAuthUser;

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: tokenData.userId },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // Generate new access token
  const newTokenPayload: IAuthUser = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const newAccessToken = tokenUtils.getAccessToken(newTokenPayload);

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  userId: string,
  payload: ChangePasswordPayload,
) => {
  const { currentPassword, newPassword } = payload;

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // Compare current password
  const isPasswordValid = await passwordUtils.comparePassword(
    currentPassword,
    user.password,
  );

  if (!isPasswordValid) {
    throw new AppError(status.UNAUTHORIZED, "Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await passwordUtils.hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return {
    message: "Password changed successfully",
  };
};

const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      profileImage: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const email = payload.email.toLowerCase().trim();
  const publicMessage = "Your password reset link has been sent.";

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true, lastName: true, status: true, isDeleted: true },
  });

  // Always return success to prevent account enumeration
  if (!user || user.isDeleted || user.status === "SUSPENDED") {
    return { message: publicMessage };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Best-effort: create token (if collision, regenerate once)
  try {
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
  } catch {
    const retryRaw = crypto.randomBytes(32).toString("hex");
    const retryHash = crypto.createHash("sha256").update(retryRaw).digest("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: retryHash,
        expiresAt,
      },
    });
  }

  const clientBase = (envVars.CORS_ORIGIN || "").split(",")[0]?.trim() || "http://localhost:3000";
  const resetUrl = `${clientBase}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  // Email is optional in dev/demo environments; never block the request on SMTP.
  if (envVars.EMAIL_SENDER) {
    void sendEmail({
      to: user.email,
      subject: "Reset your CineTube password",
      templateName: "resetPassword",
      templateData: {
        firstName: user.firstName || "there",
        resetUrl,
        year: new Date().getFullYear(),
      },
    }).catch(() => {
      // Silent by design (prevents "forgot password" UI from leaking infra errors).
      if (envVars.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("[forgot-password] Email sending failed (check SMTP/app password).");
      }
    });
  }

  return { message: publicMessage };
};

const resetPassword = async (payload: ResetPasswordPayload) => {
  const email = payload.email.toLowerCase().trim();
  const rawToken = payload.token.trim();
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true, isDeleted: true },
  });
  if (!user || user.isDeleted || user.status === "SUSPENDED") {
    throw new AppError(status.BAD_REQUEST, "Invalid or expired reset link");
  }

  const tokenRow = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!tokenRow || tokenRow.userId !== user.id) {
    throw new AppError(status.BAD_REQUEST, "Invalid or expired reset link");
  }
  if (tokenRow.usedAt) {
    throw new AppError(status.BAD_REQUEST, "This reset link has already been used");
  }
  if (tokenRow.expiresAt.getTime() < Date.now()) {
    throw new AppError(status.BAD_REQUEST, "Reset link expired. Please request a new one.");
  }

  const hashedPassword = await passwordUtils.hashPassword(payload.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRow.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return { message: "Password reset successful" };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshAccessToken,
  changePassword,
  getUser,
  forgotPassword,
  resetPassword,
};
