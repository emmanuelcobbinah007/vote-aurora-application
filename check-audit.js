const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

async function checkAudit() {
  try {
    const logs = await prisma.auditTrail.findMany({
      where: { action: "USER_LOGIN" },
      include: { user: true },
      orderBy: { timestamp: "desc" },
      take: 3,
    });

    console.log("Recent USER_LOGIN audit logs:");
    logs.forEach((log) => {
      console.log("\n---");
      console.log("ID:", log.id);
      console.log("User ID:", log.user_id);
      console.log("User Name:", log.user?.full_name || "NULL");
      console.log("Action:", log.action);
      console.log("Timestamp:", log.timestamp);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAudit();
