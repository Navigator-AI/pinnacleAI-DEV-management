import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";
import bcrypt from "bcrypt";

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

async function setupDatabase() {
  try {
    console.log("Setting up database manually...");

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }

    const client = postgres(connectionString);

    // Create tables without foreign key constraints first
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        avatar TEXT,
        role TEXT NOT NULL DEFAULT 'member',
        status TEXT NOT NULL DEFAULT 'online',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        progress INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'on-track',
        priority TEXT NOT NULL DEFAULT 'medium',
        portfolio_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        project_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        assignee_id TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'todo',
        start_date TIMESTAMP,
        due_date TIMESTAMP,
        progress INTEGER DEFAULT 0,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        project_id TEXT,
        user_id TEXT,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        target_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        project_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'bug',
        severity TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        assignee_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS task_updates (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        task_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        progress INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log("Tables created successfully!");

    // Add foreign key constraints
    await client`
      ALTER TABLE projects 
      ADD CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
      ADD CONSTRAINT fk_projects_portfolio FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL
    `;

    await client`
      ALTER TABLE tasks 
      ADD CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    `;

    await client`
      ALTER TABLE activities 
      ADD CONSTRAINT fk_activities_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `;

    await client`
      ALTER TABLE issues 
      ADD CONSTRAINT fk_issues_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_issues_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    `;

    await client`
      ALTER TABLE task_updates 
      ADD CONSTRAINT fk_task_updates_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      ADD CONSTRAINT fk_task_updates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `;

    // Create indexes for performance
    await client`CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id)`;
    await client`CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)`;
    await client`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id)`;
    await client`CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id)`;
    await client`CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id)`;
    await client`CREATE INDEX IF NOT EXISTS idx_task_updates_task ON task_updates(task_id)`;

    console.log("Foreign keys and indexes created!");

    // Insert sample users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const users = await client`
      INSERT INTO users (username, password, name, email, role, avatar, status)
      VALUES 
        ('admin', ${adminPassword}, 'Admin User', 'admin@pinnacle.ai', 'admin', ${avatar("admin")}, 'online'),
        ('john_doe', ${userPassword}, 'John Doe', 'john@pinnacle.ai', 'member', ${avatar("john")}, 'online'),
        ('jane_smith', ${userPassword}, 'Jane Smith', 'jane@pinnacle.ai', 'manager', ${avatar("jane")}, 'away')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    `;

    // Insert sample portfolios
    const portfolios = await client`
      INSERT INTO portfolios (name, description)
      VALUES 
        ('AI Development', 'Core AI and machine learning projects'),
        ('Web Platform', 'Frontend and backend web development')
      RETURNING id, name
    `;

    // Insert sample projects
    const adminId = users.find(u => u.email === 'admin@pinnacle.ai')?.id;
    const janeId = users.find(u => u.email === 'jane@pinnacle.ai')?.id;
    const portfolioId = portfolios[0]?.id;

    if (adminId && portfolioId) {
      const projects = await client`
        INSERT INTO projects (name, description, owner_id, portfolio_id, status, priority, progress)
        VALUES 
          ('AI Chat System', 'Develop intelligent chat interface', ${adminId}, ${portfolioId}, 'on-track', 'high', 75),
          ('Data Analytics Dashboard', 'Real-time analytics platform', ${janeId || adminId}, ${portfolioId}, 'on-track', 'medium', 45)
        RETURNING id, name
      `;

      // Insert sample tasks
      const projectId = projects[0]?.id;
      const johnId = users.find(u => u.email === 'john@pinnacle.ai')?.id;

      if (projectId) {
        await client`
          INSERT INTO tasks (project_id, title, description, assignee_id, status, priority, progress)
          VALUES 
            (${projectId}, 'Setup API endpoints', 'Create REST API for chat functionality', ${johnId}, 'in-progress', 'high', 60),
            (${projectId}, 'Design UI components', 'Create reusable chat UI components', ${janeId}, 'todo', 'medium', 0),
            (${projectId}, 'Implement authentication', 'Add user login and session management', ${adminId}, 'done', 'high', 100)
        `;
      }
    }

    console.log("Database setup completed successfully!");
    console.log("Login credentials:");
    console.log("Admin: admin@pinnacle.ai / admin123");
    console.log("User: john@pinnacle.ai / user123");
    console.log("Manager: jane@pinnacle.ai / user123");

    await client.end();
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().then(() => {
    console.log("Database setup completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });
}