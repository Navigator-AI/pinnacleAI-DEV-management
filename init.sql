-- Complete database initialization script for Pinnacle AI Project Tracker

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
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
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT REFERENCES users(id),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    progress INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'on-track',
    priority TEXT NOT NULL DEFAULT 'medium',
    portfolio_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT REFERENCES users(id),
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'todo',
    start_date TIMESTAMP,
    due_date TIMESTAMP,
    progress INTEGER DEFAULT 0,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT REFERENCES projects(id),
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    target_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'bug',
    severity TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    assignee_id TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create task_updates table
CREATE TABLE IF NOT EXISTS task_updates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT REFERENCES tasks(id) NOT NULL,
    user_id TEXT REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    progress INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT REFERENCES tasks(id) NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT REFERENCES tasks(id) NOT NULL,
    user_id TEXT REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT REFERENCES projects(id) NOT NULL,
    parent_id TEXT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT REFERENCES projects(id) NOT NULL,
    folder_id TEXT REFERENCES folders(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    uploaded_by TEXT REFERENCES users(id) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Insert only the specified users with correct credentials
-- Admin: girish.desai@pinnacle.ai / admin123
-- Users: dinesh@pinnacle.ai, yaswanth@pinnacle.ai, raviteja@pinnacle.ai, eswar@pinnacle.ai / user123
INSERT INTO users (username, password, name, email, role, avatar, status) VALUES
('girish.desai', '$2b$10$SrM3UiGIaXamsVukD8ZrVeugiMTf69WUdRoLiGLkhr14jtZQgMKGe', 'Girish Desai', 'girish.desai@pinnacle.ai', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=girish', 'online'),
('dinesh', '$2b$10$3h0tE1WEV/1CY4DGNUc77ublCnvrtRG56R/9pJVWA57CAIW34KBS.', 'Dinesh', 'dinesh@pinnacle.ai', 'member', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dinesh', 'online'),
('yaswanth', '$2b$10$3h0tE1WEV/1CY4DGNUc77ublCnvrtRG56R/9pJVWA57CAIW34KBS.', 'Yaswanth', 'yaswanth@pinnacle.ai', 'member', 'https://api.dicebear.com/7.x/avataaars/svg?seed=yaswanth', 'online'),
('raviteja', '$2b$10$3h0tE1WEV/1CY4DGNUc77ublCnvrtRG56R/9pJVWA57CAIW34KBS.', 'Ravi Teja', 'raviteja@pinnacle.ai', 'member', 'https://api.dicebear.com/7.x/avataaars/svg?seed=raviteja', 'online'),
('eswar', '$2b$10$3h0tE1WEV/1CY4DGNUc77ublCnvrtRG56R/9pJVWA57CAIW34KBS.', 'Eswar', 'eswar@pinnacle.ai', 'member', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eswar', 'online')
ON CONFLICT (email) DO NOTHING;