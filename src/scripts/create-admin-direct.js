import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const { Client } = pg;

async function runDirect() {
  const connectionString = process.env.DATABASE_URL;
  const email = "ruhulshanto8082@gmail.com";
  const password = "Shanto1234";
  const username = "ruhulshanto";

  if (!connectionString) {
    console.error("❌ DATABASE_URL missing!");
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL.");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`🚀 Creating Super Admin: ${email}...`);
    
    // Using ON CONFLICT to act like an upsert
    const query = `
      INSERT INTO users (id, email, username, password, role, "firstName", "lastName", status)
      VALUES ($1, $2, $3, $4, 'ADMIN', 'Ruhul', 'Shanto', 'ACTIVE')
      ON CONFLICT (email) DO UPDATE 
      SET password = $4, role = 'ADMIN', status = 'ACTIVE'
      RETURNING *;
    `;

    const res = await client.query(query, ['shanto-admin', email, username, hashedPassword]);
    console.log(`✅ Success! Super Admin '${res.rows[0].email}' is live.`);

  } catch (err) {
    console.error("❌ Insertion failed:", err.message);
  } finally {
    await client.end();
  }
}

runDirect();
