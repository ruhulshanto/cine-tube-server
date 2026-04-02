import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { SubscriptionController } from "./subscription.controller";
import { createSubscriptionZodSchema } from "./subscription.validation";

const router = Router();

router.get(
  "/my",
  checkAuth(Role.ADMIN, Role.USER),
  SubscriptionController.getMySubscription,
);

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(createSubscriptionZodSchema),
  SubscriptionController.createSubscription,
);

router.patch(
  "/cancel",
  checkAuth(Role.ADMIN, Role.USER),
  SubscriptionController.cancelSubscription,
);

router.get(
  "/",
  checkAuth(Role.ADMIN),
  SubscriptionController.getAllSubscriptions,
);

export const subscriptionRoutes: Router = router;
