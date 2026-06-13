import { prisma } from "../prisma/client.js";
import { conflict, notFound } from "./errors.js";

export interface CreateStudentInput {
  name: string;
  email: string;
  studentId: string;
  department: string;
  year: number;
  phone?: string;
  addedBy: string;
}

export async function getAllStudents() {
  return prisma.student.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createStudent(data: CreateStudentInput) {
  const existing = await prisma.student.findFirst({
    where: { OR: [{ email: data.email }, { studentId: data.studentId }] },
  });
  if (existing) {
    const field = existing.email === data.email ? "Email" : "Student ID";
    throw conflict(`${field} already registered`);
  }
  return prisma.student.create({ data });
}

export async function deleteStudent(id: string) {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw notFound(`Student ${id} not found`);
  await prisma.student.delete({ where: { id } });
  return { deleted: true };
}
