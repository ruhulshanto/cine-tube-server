import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { AnalyticsController } from "./analytics.controller";

const router = Router();

router.get("/dashboard", checkAuth(Role.ADMIN), AnalyticsController.getDashboardStats);
router.get("/movies", checkAuth(Role.ADMIN), AnalyticsController.getMovieStats);
router.get("/users", checkAuth(Role.ADMIN), AnalyticsController.getUserStats);

export const analyticsRoutes: Router = router;
