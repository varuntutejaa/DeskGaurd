import { Router } from "express";
import * as ctrl from "../controllers/issues.controller.js";

const router = Router();

router.get("/",                  ctrl.listIssues);
router.post("/",                 ctrl.createIssue);
router.patch("/:id/approve",     ctrl.approveIssue);
router.patch("/:id/dismiss",     ctrl.dismissIssue);

export default router;
