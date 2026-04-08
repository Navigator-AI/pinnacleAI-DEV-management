import dotenv from "dotenv";
dotenv.config();

import { DatabaseStorage } from "./storage";
import { users, projects, tasks, portfolios, activities } from "@shared/schema";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, or } from "drizzle-orm";

const avatar = (seed: string, gender: "male" | "female" = "male") => {
  const style = gender === "female" ? "lorelei" : "adventurer";
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

export async function initializeDatabase() {
  try {
    console.log("Initializing database with users...");

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }

    const client = postgres(connectionString);
    const db = drizzle(client);

    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@pinnacle.ai";
    const defaultAdminUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
    const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || "Girish Desai";

    // Create admin user
    const existingAdmin = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(or(eq(users.email, defaultAdminEmail), eq(users.username, defaultAdminUsername)))
      .limit(1);

    if (existingAdmin.length === 0) {
      const adminPassword = await bcrypt.hash(defaultAdminPassword, 10);
      await db.insert(users).values({
        username: defaultAdminUsername,
        password: adminPassword,
        name: defaultAdminName,
        email: defaultAdminEmail,
        role: "admin",
        avatar: avatar(defaultAdminUsername, "male"),
        status: "online",
        lastActiveAt: new Date(),
      });
    } else if (
      existingAdmin[0].name?.trim().toLowerCase() === "administrator" &&
      existingAdmin[0].email === defaultAdminEmail &&
      existingAdmin[0].username === defaultAdminUsername
    ) {
      await db
        .update(users)
        .set({
          name: defaultAdminName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingAdmin[0].id));
    }

    console.log("Database initialized successfully!");
    console.log("Login credentials:");
    console.log(`Admin: ${defaultAdminEmail} / ${defaultAdminPassword}`);

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
