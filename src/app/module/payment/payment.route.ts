import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { createPaymentZodSchema } from "./payment.validation";

const router: Router = Router();

router.get(
  "/my",
  checkAuth(Role.ADMIN, Role.USER),
  PaymentController.getMyPayments,
);

router.get(
  "/access/:movieId",
  checkAuth(Role.ADMIN, Role.USER),
  PaymentController.checkMovieAccess,
);

router.get(
  "/verify-session/:sessionId",
  checkAuth(Role.ADMIN, Role.USER),
  PaymentController.verifySessionStatus,
);

router.post(
  "/movie-checkout-session",
  checkAuth(Role.ADMIN, Role.USER),
  PaymentController.createMovieCheckoutSession,
);

router.post(
  "/subscription-checkout-session",
  checkAuth(Role.ADMIN, Role.USER),
  PaymentController.createSubscriptionCheckoutSession,
);

router.get("/", checkAuth(Role.ADMIN), PaymentController.getAllPayments);

export const paymentRoutes: Router = router;
