import type { Request, Response, NextFunction } from "express";
import * as seatsService from "../services/seats.service.js";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const wrap =
  (fn: (seatNumber: string) => Promise<unknown>): Handler =>
  async (req, res, next) => {
    try {
      const result = await fn(req.params.seatId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

export const getSeats: Handler = async (_req, res, next) => {
  try {
    res.json(await seatsService.getAllSeats());
  } catch (err) {
    next(err);
  }
};

export const checkin = wrap(seatsService.checkIn);
export const away = wrap(seatsService.goAway);
export const confirm = wrap(seatsService.confirm);
export const checkout = wrap(seatsService.checkOut);
