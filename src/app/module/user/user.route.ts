import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import { updateUserZodSchema } from "./user.validation";
import { uploadProfileImage } from "../../config/multer.config";

const router = Router();

router.get("/", checkAuth(Role.ADMIN), UserController.getAllUsers);
router.get("/me/stats", checkAuth(Role.ADMIN, Role.USER), UserController.getMyProfileStats);
router.patch(
  "/profile-image",
  checkAuth(Role.ADMIN, Role.USER),
  uploadProfileImage.single("profileImage"),
  UserController.updateProfileImage,
);
router.get("/:id", checkAuth(Role.ADMIN), UserController.getUserById);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateUserZodSchema),
  UserController.updateUser,
);
router.delete("/:id", checkAuth(Role.ADMIN), UserController.deleteUser);

export const userRoutes: Router = router;
