import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { 
  createReviewZodSchema, 
  updateReviewZodSchema, 
  changeReviewStatusZodSchema 
} from "./review.validation";

import { optionalAuth } from "../../middleware/optionalAuth";

const router: Router = Router();

// Public routes (Optional Auth for filtering)
router.get("/", optionalAuth, ReviewController.getAllReviews);
router.get("/:id", ReviewController.getReviewById);

// Authenticated user routes
router.post(
  "/",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(createReviewZodSchema),
  ReviewController.createReview,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(updateReviewZodSchema),
  ReviewController.updateReview,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.USER), ReviewController.deleteReview);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN),
  validateRequest(changeReviewStatusZodSchema),
  ReviewController.changeReviewStatus,
);

export const reviewRoutes: Router = router;
