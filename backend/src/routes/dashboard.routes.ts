import { Router } from "express";
import * as ctrl from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/stats", ctrl.getStats);
router.get("/zones", ctrl.getZones);
router.get("/sessions", ctrl.getSessions);
router.get("/flagged", ctrl.getFlagged);
router.get("/trends", ctrl.getTrends);

export default router;
