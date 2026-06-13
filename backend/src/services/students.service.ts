import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client.js";
import { conflict, notFound } from "./errors.js";

export interface CreateStudentInput {
  name: string;
  email: string;
  studentId: string;
  department: string;
  year: number;
  phone?: string;
  password: string;
  addedBy: string;
}

const PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  studentId: true,
  department: true,
  year: true,
  phone: true,
  addedBy: true,
  createdAt: true,
};

export async function getAllStudents() {
  return prisma.student.findMany({
    select: PUBLIC_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

export async function createStudent(data: CreateStudentInput) {
  const existing = await prisma.student.findFirst({
    where: { OR: [{ email: data.email }, { studentId: data.studentId }] },
  });
  if (existing) {
    const field = existing.email === data.email ? "Email" : "Student ID";
    throw conflict(`${field} already registered`);
  }
  const hashed = await bcrypt.hash(data.password, 10);
  return prisma.student.create({
    data: { ...data, password: hashed },
    select: PUBLIC_SELECT,
  });
}

export async function deleteStudent(id: string) {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw notFound(`Student ${id} not found`);
  await prisma.student.delete({ where: { id } });
  return { deleted: true };
}

export async function findStudentByEmail(email: string) {
  return prisma.student.findUnique({ where: { email } });
}
