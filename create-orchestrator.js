import { PrismaClient } from "./src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createOrchestrator() {
  const email = "aurorasoftwarelabs.io";
  const password = "?pineApple1234";
  const fullName = "Aurora Software Labs";

  try {
    console.log("🔧 Creating orchestrator account...");

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("❌ User with this email already exists!");
      console.log("User ID:", existingUser.id);
      console.log("Role:", existingUser.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create orchestrator user
    const orchestrator = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        role: "ORCHESTRATOR",
        is_active: true,
      },
    });

    console.log("✅ Orchestrator account created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("ID:", orchestrator.id);
    console.log("Email:", orchestrator.email);
    console.log("Full Name:", orchestrator.full_name);
    console.log("Role:", orchestrator.role);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔑 Login Credentials:");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("\n🌐 Login URL: http://localhost:3000/login");
  } catch (error) {
    console.error("❌ Error creating orchestrator:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createOrchestrator();
