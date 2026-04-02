import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { WatchlistController } from "./watchlist.controller";
import { addToWatchlistZodSchema } from "./watchlist.validation";

const router = Router();

router.get("/", checkAuth(Role.ADMIN, Role.USER), WatchlistController.getMyWatchlist);

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(addToWatchlistZodSchema),
  WatchlistController.addToWatchlist,
);

router.delete("/:movieId", checkAuth(Role.ADMIN, Role.USER), WatchlistController.removeFromWatchlist);

export const watchlistRoutes: Router = router;
