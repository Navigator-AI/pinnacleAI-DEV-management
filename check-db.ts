import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { tasks } from './shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  try {
    console.log('Using DATABASE_URL:', connectionString);
    console.log('Inserting test task...');
    
    // Find an admin user to assign the task to
    const adminUsers = await client`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    if (adminUsers.length === 0) {
      console.log('No admin user found. Please run setup-db.ts first.');
      process.exit(1);
    }
    const adminId = adminUsers[0].id;

    const [newTask] = await db.insert(tasks).values({
      title: 'Test Task ' + new Date().toISOString(),
      status: 'todo',
      priority: 'medium',
      assigneeId: adminId,
    }).returning();
    
    console.log('Inserted task:', newTask);

    const allTasks = await db.select().from(tasks);
    console.log('All Tasks in DB count:', allTasks.length);
    console.log('All Tasks in DB:', JSON.stringify(allTasks, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
