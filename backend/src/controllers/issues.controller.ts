import type { Request, Response, NextFunction } from "express";
import * as issuesService from "../services/issues.service.js";

export async function listIssues(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(await issuesService.listIssues(status));
  } catch (err) {
    next(err);
  }
}

export async function createIssue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { seatNumber, seatId, issueType, description } = req.body ?? {};
    const issue = await issuesService.createIssue({
      // accept either `seatNumber` or `seatId` (the map uses the seat number as its id)
      seatNumber: seatNumber ?? seatId,
      issueType,
      description,
    });
    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
}
