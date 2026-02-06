import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

async function resetDatabase() {
  try {
    console.log("Resetting database...");

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }

    const client = postgres(connectionString);

    // Drop all tables with CASCADE to handle foreign key constraints
    await client`DROP SCHEMA public CASCADE`;
    await client`CREATE SCHEMA public`;
    await client`GRANT ALL ON SCHEMA public TO postgres`;
    await client`GRANT ALL ON SCHEMA public TO public`;

    console.log("Database reset completed!");
    await client.end();
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}

// Run reset if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase().then(() => {
    console.log("Database reset completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Database reset failed:", error);
    process.exit(1);
  });
}