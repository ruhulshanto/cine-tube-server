import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const email =
    process.env.SUPER_ADMIN_EMAIL || "ruhulshanto8082@gmail.com";
  const password =
    process.env.SUPER_ADMIN_PASSWORD || "Shanto1234";
  const username = "ruhulshanto";

  console.log(`🚀 Creating Super Admin: ${email}...`);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        email,
        username,
        firstName: "Ruhul",
        lastName: "Shanto",
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log(`✅ Success! Super Admin '${user.email}' is live.`);
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Failed to create Super Admin:", err.message);
    } else {
      console.error("❌ Failed to create Super Admin:", err);
    }
  }
}

// Run script
createSuperAdmin()
  .catch((err) => {
    if (err instanceof Error) {
      console.error("❌ Unhandled error:", err.message);
    } else {
      console.error("❌ Unhandled error:", err);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });