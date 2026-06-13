import { Router } from "express";
import * as ctrl from "../controllers/issues.controller.js";

const router = Router();

router.get("/", ctrl.listIssues);
router.post("/", ctrl.createIssue);

export default router;
