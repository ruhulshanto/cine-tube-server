import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CommentController } from "./comment.controller";
import { createCommentZodSchema, updateCommentZodSchema } from "./comment.validation";

const router = Router();

// Public routes
router.get("/review/:reviewId", CommentController.getCommentsByReview);

// Authenticated user routes
router.post(
  "/",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(createCommentZodSchema),
  CommentController.createComment,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(updateCommentZodSchema),
  CommentController.updateComment,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.USER), CommentController.deleteComment);

export const commentRoutes: Router = router;
