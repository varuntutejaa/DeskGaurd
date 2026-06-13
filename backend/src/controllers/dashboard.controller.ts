import type { Request, Response, NextFunction } from "express";
import * as dash from "../services/dashboard.service.js";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const handle =
  (fn: (req: Request) => Promise<unknown>): Handler =>
  async (req, res, next) => {
    try {
      res.json(await fn(req));
    } catch (err) {
      next(err);
    }
  };

export const getStats = handle(() => dash.getStats());
export const getZones = handle(() => dash.getZoneUtilization());
export const getSessions = handle((req) =>
  dash.getRecentSessions(Number(req.query.limit) || 8)
);
export const getFlagged = handle(() => dash.getFlaggedSeats());
export const getTrends = handle((req) =>
  dash.getTrends(Number(req.query.hours) || 12)
);
