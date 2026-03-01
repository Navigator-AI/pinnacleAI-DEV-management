import dotenv from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

dotenv.config();

function quoteIdent(identifier: string): string {
  return `"${identifier.replace(/"/g, "\"\"")}"`;
}

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const parsed = new URL(databaseUrl);
  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

  if (!dbName) {
    throw new Error("Database name is missing in DATABASE_URL");
  }

  // Connect to maintenance database first so we can create the target DB.
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = "/postgres";

  const adminClient = postgres(adminUrl.toString(), { max: 1 });
  try {
    const exists = await adminClient<{ exists: boolean }[]>`
      select exists(
        select 1 from pg_database where datname = ${dbName}
      ) as exists
    `;

    if (!exists[0]?.exists) {
      await adminClient.unsafe(`create database ${quoteIdent(dbName)}`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database already exists: ${dbName}`);
    }
  } finally {
    await adminClient.end({ timeout: 5 });
  }

  const appClient = postgres(databaseUrl, { max: 1 });
  try {
    const db = drizzle(appClient);
    const migrationTableExists = await appClient<{ exists: boolean }[]>`
      select to_regclass('public.__drizzle_migrations') is not null as exists
    `;

    const appTables = await appClient<{ count: string }[]>`
      select count(*)::text as count
      from information_schema.tables
      where table_schema = 'public'
        and table_name in (
          'users',
          'projects',
          'tasks',
          'activities',
          'issues',
          'portfolios'
        )
    `;

    const hasAppTables = Number(appTables[0]?.count ?? "0") > 0;
    const hasMigrationTable = Boolean(migrationTableExists[0]?.exists);

    if (hasAppTables && !hasMigrationTable) {
      console.log(
        "Existing tables detected without drizzle migration history. Skipping migrate to avoid duplicate table errors."
      );
      console.log(
        "If you want drizzle to manage this schema from scratch, reset DB data and run db:setup again."
      );
      return;
    }

    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations applied successfully");
  } finally {
    await appClient.end({ timeout: 5 });
  }
}

setupDatabase()
  .then(() => {
    console.log("Database setup completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });
