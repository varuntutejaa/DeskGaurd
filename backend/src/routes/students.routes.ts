import { Router } from "express";
import * as ctrl from "../controllers/students.controller.js";

const router = Router();

router.get("/",        ctrl.listStudents);
router.post("/",       ctrl.addStudent);
router.delete("/:id",  ctrl.removeStudent);

export default router;
