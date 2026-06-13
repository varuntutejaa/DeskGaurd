import { Router } from "express";
import seatsRoutes from "./seats.routes.js";
import issuesRoutes from "./issues.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import studentsRoutes from "./students.routes.js";

const router = Router();

router.use("/seats",    seatsRoutes);
router.use("/issues",   issuesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/students", studentsRoutes);

export default router;
