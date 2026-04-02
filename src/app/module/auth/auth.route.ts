import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
} from "./auth.validation";
import { Role } from "@prisma/client";

const router = Router();

// Public routes
router.post(
  "/register",
  validateRequest(registerValidationSchema),
  AuthController.register,
);

router.post(
  "/login",
  validateRequest(loginValidationSchema),
  AuthController.login,
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordValidationSchema),
  AuthController.resetPassword,
);

router.post("/refresh-token", AuthController.refreshToken);

// Protected routes
router.get("/me", checkAuth(Role.ADMIN, Role.USER), AuthController.getMe);

router.post(
  "/change-password",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(changePasswordValidationSchema),
  AuthController.changePassword,
);

router.post("/logout", checkAuth(Role.ADMIN, Role.USER), AuthController.logout);

export const authRoutes: Router = router;
