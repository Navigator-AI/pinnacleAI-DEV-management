import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { tasks, users } from "../shared/schema.js";

const connectionString = process.env.DATABASE_URL;

async function testDatabase() {
  try {
    console.log("Connecting to:", connectionString);
    const client = postgres(connectionString);
    const db = drizzle(client);
    
    // Test connection
    console.log("Testing database connection...");
    
    // Check users
    const allUsers = await db.select().from(users);
    console.log("Users count:", allUsers.length);
    
    // Check tasks
    const allTasks = await db.select().from(tasks);
    console.log("Tasks count:", allTasks.length);
    
    // Create a simple test task
    const testTask = {
      title: "Test Task " + Date.now(),
      description: "Test description",
      priority: "medium",
      status: "todo",
      progress: 0
    };
    
    console.log("Creating test task...");
    const newTask = await db.insert(tasks).values(testTask).returning();
    console.log("Created task:", newTask[0]);
    
    // Verify task was created
    const updatedTasks = await db.select().from(tasks);
    console.log("Total tasks after creation:", updatedTasks.length);
    
    await client.end();
    console.log("Test completed successfully");
    
  } catch (error) {
    console.error("Database test failed:", error);
  }
}

testDatabase();