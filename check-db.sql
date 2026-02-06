-- Check if tables exist and have data
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'tasks' as table_name, COUNT(*) as count FROM tasks
UNION ALL
SELECT 'projects' as table_name, COUNT(*) as count FROM projects;

-- Show all tasks
SELECT id, title, status, priority, "assigneeId", "createdAt" FROM tasks ORDER BY "createdAt" DESC LIMIT 10;

-- Show all users
SELECT id, name, email, role FROM users;