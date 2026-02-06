CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO notifications (user_id, title, message, type, read)
SELECT 
    u.id,
    'New task assigned',
    'You have been assigned to "Update dashboard UI"',
    'task',
    false
FROM users u 
WHERE u.email = 'dinesh@pinnacle.ai'
LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, read)
SELECT 
    u.id,
    'Project completed',
    '"Mobile App Redesign" has been completed',
    'project',
    false
FROM users u 
WHERE u.email = 'yaswanth@pinnacle.ai'
LIMIT 1;