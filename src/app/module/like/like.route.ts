import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { LikeController } from "./like.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createLikeZodSchema } from "./like.validation";

const router = Router();

router.post(
  "/toggle",
  checkAuth(Role.ADMIN, Role.USER),
  LikeController.toggleLike,
);
router.post("/count", LikeController.getLikesCount);
router.post(
  "/check",
  checkAuth(Role.ADMIN, Role.USER),
  LikeController.checkUserLike,
);
router.post(
  "/toggle",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(createLikeZodSchema),
  LikeController.toggleLike,
);

export const likeRoutes: Router = router;
