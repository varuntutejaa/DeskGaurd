import type { Request, Response, NextFunction } from "express";
import * as svc from "../services/students.service.js";

export const listStudents = async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await svc.getAllStudents()); }
  catch (err) { next(err); }
};

export const addStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, studentId, department, year, phone, password, addedBy } =
      req.body as svc.CreateStudentInput;
    if (!name || !email || !studentId || !department || !year || !password || !addedBy) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    res.status(201).json(
      await svc.createStudent({ name, email, studentId, department, year: Number(year), phone, password, addedBy })
    );
  } catch (err) { next(err); }
};

export const removeStudent = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await svc.deleteStudent(req.params.id)); }
  catch (err) { next(err); }
};
