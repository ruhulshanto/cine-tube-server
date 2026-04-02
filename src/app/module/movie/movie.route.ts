import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { MovieController } from "./movie.controller";
import { createMovieZodSchema, updateMovieZodSchema } from "./movie.validation";
import { upload } from "../../config/multer.config";

const router = Router();

const movieUploadFields = upload.fields([
  { name: "poster", maxCount: 1 },
  { name: "backdrop", maxCount: 1 },
  { name: "trailer", maxCount: 1 },
  { name: "streaming", maxCount: 1 },
]);

// Public routes
router.get("/", MovieController.getAllMovies);
router.get("/slug/:slug", MovieController.getMovieBySlug);
router.get("/:id", MovieController.getMovieById);

// Admin-only routes
router.post(
  "/",
  checkAuth(Role.ADMIN),
  movieUploadFields,
  validateRequest(createMovieZodSchema),
  MovieController.createMovie,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  movieUploadFields,
  validateRequest(updateMovieZodSchema),
  MovieController.updateMovie,
);

router.delete("/:id", checkAuth(Role.ADMIN), MovieController.deleteMovie);

export const movieRoutes: Router = router;
