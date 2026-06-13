import "dotenv/config";
import { createApp } from "./app.js";
import { startTimeoutCron } from "./cron/timeouts.js";
import { prisma } from "./prisma/client.js";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  const app = createApp();

  // Verify DB connectivity before accepting traffic.
  await prisma.$connect();
  console.log("[db] connected");

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
