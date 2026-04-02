import { Router } from "express";
import { authRoutes } from "../module/auth/auth.route.js";
import { userRoutes } from "../module/user/user.route.js";
import { movieRoutes } from "../module/movie/movie.route.js";
import { reviewRoutes } from "../module/review/review.route.js";
import { commentRoutes } from "../module/comment/comment.route.js";
import { likeRoutes } from "../module/like/like.route.js";
import { watchlistRoutes } from "../module/watchlist/watchlist.route.js";
import { subscriptionRoutes } from "../module/subscription/subscription.route.js";
import { paymentRoutes } from "../module/payment/payment.route.js";
import { analyticsRoutes } from "../module/analytics/analytics.route.js";
import { searchRoutes } from "../module/search/search.route.js";
import { homeCuratedRoutes } from "../module/homeCurated/homeCurated.route.js";

const router: Router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CineTube API is healthy',
    timestamp: new Date().toISOString(),
  })
})

// Module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/movies", movieRoutes);
router.use("/reviews", reviewRoutes);
router.use("/comments", commentRoutes);
router.use("/likes", likeRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/payments", paymentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/search", searchRoutes);
router.use("/home-curated", homeCuratedRoutes);

export default router;
