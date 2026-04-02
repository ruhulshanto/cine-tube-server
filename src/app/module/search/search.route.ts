import { Router } from "express";
import { SearchController } from "./search.controller";

const router = Router();

router.get("/movies", SearchController.searchMovies);

export const searchRoutes: Router = router;
