import bcrypt from "bcryptjs";
import { findStudentByEmail } from "./students.service.js";

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@muj.manipal.edu";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "0987654321";

export async function login(email: string, password: string) {
  const normalised = email.trim().toLowerCase();

  if (normalised === ADMIN_EMAIL) {
    if (password !== ADMIN_PASSWORD) return null;
    return { email: normalised, role: "admin" as const };
  }

  const student = await findStudentByEmail(normalised);
  if (!student?.password) return null;
  const match = await bcrypt.compare(password, student.password);
  if (!match) return null;
  return { email: normalised, role: "student" as const };
}
