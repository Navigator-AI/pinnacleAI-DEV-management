# PinnacleAI Projects

Enterprise-grade project management platform equivalent to Zoho Projects.

**Tagline:** Plan. Execute. Scale — at the Pinnacle of Productivity.

## Overview

PinnacleAI Projects is a modern project management UI featuring:
- Dashboard with project stats and activity feed
- Project management with list and grid views
- Task management with List, Kanban, and Calendar views
- Team workload visualization
- Portfolio management for project groupings
- Reports and analytics dashboards
- Settings and preferences

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Routing:** Wouter
- **State Management:** TanStack React Query
- **Backend:** Express.js
- **Storage:** In-memory (MemStorage)

## Design System

### Colors
- **Primary:** Teal (187 80% 42%) - Electric blue/teal accent
- **Status Colors:**
  - Green (emerald) - On track / Done
  - Amber - At risk / Warning
  - Red - Overdue / Critical
  - Blue - In progress

### Typography
- **Sans:** Inter
- **Mono:** JetBrains Mono

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn components
│   │   ├── app-sidebar.tsx
│   │   ├── global-header.tsx
│   │   ├── kanban-board.tsx
│   │   ├── task-list.tsx
│   │   ├── progress-ring.tsx
│   │   ├── status-badge.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   ├── home.tsx          # Dashboard
│   │   ├── projects.tsx      # Projects list
│   │   ├── project-detail.tsx
│   │   ├── tasks.tsx
│   │   ├── kanban.tsx
│   │   ├── team.tsx
│   │   ├── portfolios.tsx
│   │   ├── reports.tsx
│   │   ├── settings.tsx
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css
server/
├── routes.ts         # API endpoints
├── storage.ts        # In-memory data store
└── index.ts
shared/
└── schema.ts         # TypeScript interfaces
```

## API Endpoints

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/:id/tasks` - Get project tasks
- `GET /api/tasks` - List all tasks
- `GET /api/team` - List team members
- `GET /api/portfolios` - List portfolios
- `GET /api/activities` - List activities

## Features

### Core Modules (Sidebar Navigation)
- Home (Dashboard)
- Portfolios
- Projects
- Tasks
- Kanban
- Timeline (placeholder)
- Calendar (placeholder)
- Timesheets (placeholder)
- Issues (placeholder)
- Documents (placeholder)
- Reports
- Automation (placeholder)
- Team
- Settings

### Dashboard Widgets
- Active Projects Summary
- Task Status Breakdown
- Overdue Alerts
- Team Workload Heatmap
- Recent Activity Feed

### Project Views
- Grid View (cards)
- List View (table)
- Detail View with tabs (Tasks, Kanban, Timeline, Issues, Documents)

### Task Management
- List View with filtering
- Kanban Board with drag-drop ready columns
- Status: To Do, In Progress, Review, Done
- Priority: Low, Medium, High, Critical

## Development

Run with: `npm run dev`

The application starts on port 5000 with both frontend and backend served.
