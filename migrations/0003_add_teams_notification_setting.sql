-- Add Teams notification setting to users table
ALTER TABLE users ADD COLUMN teams_notification_enabled BOOLEAN NOT NULL DEFAULT true;
