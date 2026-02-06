const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { tasks, users } = require("./shared/schema.ts");

const connectionString = "postgresql://postgres:root@localhost:5500/project-tracker";

async function testTaskCreation() {
  try {
    const client = postgres(connectionString);
    const db = drizzle(client);
    
    console.log("Testing database connection...");
    
    // Check if we have any users
    const allUsers = await db.select().from(users);
    console.log("Users in database:", allUsers.length);
    
    // Check if we have any tasks
    const allTasks = await db.select().from(tasks);
    console.log("Tasks in database:", allTasks.length);
    
    // Create a test task
    const testTask = {
      title: "Test Task",
      description: "This is a test task",
      priority: "medium",
      status: "todo",
      progress: 0
    };
    
    const newTask = await db.insert(tasks).values(testTask).returning();
    console.log("Created test task:", newTask[0]);
    
    // Verify the task was created
    const updatedTasks = await db.select().from(tasks);
    console.log("Total tasks after creation:", updatedTasks.length);
    
    await client.end();
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testTaskCreation();