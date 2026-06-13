import type { Request, Response, NextFunction } from "express";
import { login } from "../services/auth.service.js";

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const user = await login(email, password);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    res.json(user);
  } catch (err) { next(err); }
};
