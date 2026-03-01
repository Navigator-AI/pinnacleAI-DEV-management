import dotenv from "dotenv";
dotenv.config();

import { DatabaseStorage } from "./storage";
import { users, projects, tasks, portfolios, activities } from "@shared/schema";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export async function initializeDatabase() {
  try {
    console.log("Initializing database with users...");

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }

    const client = postgres(connectionString);
    const db = drizzle(client);

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      name: "Admin User",
      email: "admin@pinnacle.ai",
      role: "admin",
      avatar: avatar("admin"),
      status: "online"
    });

    console.log("Database initialized successfully!");
    console.log("Login credentials:");
    console.log("Admin: admin@pinnacle.ai / admin123");

    await client.end();
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Run initialization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().then(() => {
    console.log("Database initialization completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
}
