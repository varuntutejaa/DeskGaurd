import "dotenv/config";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { startTimeoutCron } from "./cron/timeouts.js";
import { prisma } from "./prisma/client.js";

const PORT = Number(process.env.PORT ?? 4000);

async function ensureDemoStudent() {
  const email = "student@muj.manipal.edu";
  const existing = await prisma.student.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash("demo123", 10);
    await prisma.student.create({
      data: {
        name: "Demo Student",
        email,
        studentId: "DEMO001",
        department: "Computer Science",
        year: 2,
        password: hashed,
        addedBy: "system",
      },
    });
    console.log("[db] demo student created");
  }
}

async function main() {
  const app = createApp();

  // Verify DB connectivity before accepting traffic.
  await prisma.$connect();
  console.log("[db] connected");

  await ensureDemoStudent();

  startTimeoutCron();

  app.listen(PORT, () => {
    console.log(`[server] DeskGuard API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start", err);
  process.exit(1);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
