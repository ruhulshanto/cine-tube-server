import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { upsertHomeCuratedZodSchema } from "./homeCurated.validation";
import { HomeCuratedController } from "./homeCurated.controller";

const router = Router();

// Public reads (homepage)
// REST note: these are read-only curated lists consumed by the public Home page.
router.get("/featured", HomeCuratedController.getFeatured);
router.get("/editors-picks", HomeCuratedController.getEditorsPicks);

// Admin writes
// REST note: using PUT with the full ordered list keeps the operation idempotent.
router.put(
  "/featured",
  checkAuth(Role.ADMIN),
  validateRequest(upsertHomeCuratedZodSchema),
  HomeCuratedController.upsertFeatured,
);
router.put(
  "/editors-picks",
  checkAuth(Role.ADMIN),
  validateRequest(upsertHomeCuratedZodSchema),
  HomeCuratedController.upsertEditorsPicks,
);

export const homeCuratedRoutes: Router = router;

