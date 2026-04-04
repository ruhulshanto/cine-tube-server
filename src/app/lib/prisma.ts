import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Please set it in your environment (e.g. Vercel dashboard).");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
