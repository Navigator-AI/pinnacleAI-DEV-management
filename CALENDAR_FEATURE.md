# Calendar Feature

## Overview
A Google Calendar-like feature has been added to the SierraEdge AI Project Management System. This allows users and admins to schedule meetings, events, and important work-related activities.

## Features

### Calendar Views
- **Month View**: Default view showing the entire month with all events
- **Week View**: (Coming soon) Shows a week at a glance
- **Day View**: (Coming soon) Detailed view of a single day

### Event Management
- **Create Events**: Click on any date or use the "Create" button
- **Event Types**: 
  - Event
  - Meeting
  - Task
  - Reminder
- **Event Details**:
  - Title
  - Description
  - Start Date & Time
  - End Date & Time
  - Location
  - Color coding (6 color options)
  - Project linking (optional)

### User Permissions
- **Admin**: Can view and manage all calendar events from all users
- **Manager & Members**: Can only view and manage their own events

### Navigation
- **Today Button**: Quickly jump to today's date
- **Month Navigation**: Use arrow buttons to navigate between months
- **View Selector**: Switch between different calendar views

## Usage

### Creating an Event
1. Click the "Create" button in the top right, or
2. Click on any date in the calendar
3. Fill in the event details:
   - Event title (required)
   - Start and end date/time (required)
   - Event type (event, meeting, task, reminder)
   - Location (optional)
   - Description (optional)
   - Color (choose from 6 colors)
4. Click "Save"

### Viewing Event Details
- Click on any event in the calendar to view its full details
- See event time, location, description, and type

### Deleting an Event
- Open the event details by clicking on it
- Click the X button in the top right of the dialog

## Technical Details

### Database Schema
```sql
calendar_events (
  id: UUID PRIMARY KEY
  title: TEXT NOT NULL
  description: TEXT
  start_time: TIMESTAMP NOT NULL
  end_time: TIMESTAMP NOT NULL
  all_day: BOOLEAN DEFAULT false
  location: TEXT
  user_id: UUID NOT NULL (references users)
  project_id: UUID (references projects)
  type: TEXT DEFAULT 'event'
  color: TEXT DEFAULT '#3b82f6'
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

### API Endpoints
- `GET /api/calendar/events` - Get all events for current user
- `GET /api/calendar/events/:id` - Get specific event
- `POST /api/calendar/events` - Create new event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

### Files Modified/Created
1. **Schema**: `shared/schema.ts` - Added CalendarEvent types
2. **Routes**: `server/routes.ts` - Added calendar API routes
3. **Storage**: `server/storage.ts` - Added calendar database methods
4. **Page**: `client/src/pages/calendar.tsx` - Calendar UI component
5. **App**: `client/src/App.tsx` - Added calendar route
6. **Sidebar**: `client/src/components/app-sidebar.tsx` - Added calendar navigation
7. **Migration**: `migrations/0001_add_calendar_events.sql` - Database migration
8. **Init SQL**: `init-complete.sql` - Updated initialization script

## Setup

### For Existing Installations
Run the migration to add the calendar_events table:
```bash
psql -U postgres -d project-tracker -f migrations/0001_add_calendar_events.sql
```

### For New Installations
The calendar_events table will be created automatically when running:
```bash
docker-compose up -d --build
```

## Access
Navigate to the Calendar section from the sidebar menu. All users (Admin, Manager, Member) have access to the calendar feature.
