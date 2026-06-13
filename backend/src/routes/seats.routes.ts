import { Router } from "express";
import * as ctrl from "../controllers/seats.controller.js";

const router = Router();

router.get("/", ctrl.getSeats);
router.post("/:seatId/checkin", ctrl.checkin);
router.post("/:seatId/away", ctrl.away);
router.post("/:seatId/confirm", ctrl.confirm);
router.post("/:seatId/checkout", ctrl.checkout);

export default router;
