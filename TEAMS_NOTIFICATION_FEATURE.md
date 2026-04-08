# Teams Notification Toggle Feature - Implementation Summary

## Overview
Added a Teams notification toggle feature that allows users to enable/disable daily task update notifications sent to Teams at 10 PM (Monday-Friday only).

## Changes Made

### 1. Database Schema Update
**File:** `migrations/0003_add_teams_notification_setting.sql`
- Added `teams_notification_enabled` column to the `users` table
- Default value: `true` (notifications enabled by default)

**File:** `shared/schema.ts`
- Updated the `users` table definition to include `teamsNotificationEnabled: boolean`

### 2. Backend API Endpoints
**File:** `server/routes.ts`
Added two new endpoints:

#### GET `/api/settings/teams-notification`
- Retrieves the current Teams notification setting for the authenticated user
- Returns: `{ teamsNotificationEnabled: boolean }`

#### PUT `/api/settings/teams-notification`
- Updates the Teams notification setting for the authenticated user
- Request body: `{ enabled: boolean }`
- Returns: `{ success: true, teamsNotificationEnabled: boolean, message: string }`

### 3. Frontend Components

#### New Component: `TeamsNotificationDialog`
**File:** `client/src/components/teams-notification-dialog.tsx`
- Dialog component for toggling Teams notifications
- Shows current status (ON/OFF)
- Provides ON and OFF buttons
- Displays information about when notifications are sent
- Handles API calls to update settings
- Shows toast notifications for success/error

#### Updated: Reports Page
**File:** `client/src/pages/reports.tsx`
- Added "Teams" button between "Export" and "Custom Report" buttons
- Button opens the TeamsNotificationDialog when clicked
- Uses MessageSquare icon from lucide-react
- Maintains existing functionality

### 4. Daily Report Logic
**File:** `server/daily-teams-report.ts`
- The existing `sendDailyTeamsReport()` function already checks if notifications are enabled
- Only sends reports when:
  - Teams webhook URL is configured
  - It's not a weekend (Saturday/Sunday)
  - Current time is at or after 10 PM
  - Report hasn't already been sent today
  - **NEW:** User has Teams notifications enabled

## How It Works

### User Flow
1. User navigates to Reports & Analytics page
2. Clicks the "Teams" button (between Export and Custom Report)
3. TeamsNotificationDialog opens showing current status
4. User can click "Turn ON" or "Turn OFF" to toggle notifications
5. Setting is saved to database immediately
6. Toast notification confirms the change

### Notification Flow
1. Daily scheduler checks every minute if it's time to send the report (10 PM)
2. Before sending, it verifies:
   - Teams webhook is configured
   - It's not a weekend
   - Report hasn't been sent today
   - **Teams notifications are enabled for the user**
3. If all conditions are met, report is sent to Teams
4. If notifications are disabled, report is skipped with reason "Teams notifications are disabled"

## Features

✅ Toggle Teams notifications ON/OFF from Reports page
✅ Notifications only sent Monday-Friday at 10 PM
✅ Persistent setting stored in database
✅ Real-time UI feedback with toast notifications
✅ Clean, intuitive dialog interface
✅ Respects user preferences

## Testing

### Manual Testing Steps
1. Login to the application
2. Navigate to Reports & Analytics
3. Click the "Teams" button
4. Verify dialog opens showing current status
5. Click "Turn OFF" - should show success message
6. Click "Teams" button again - should show OFF status
7. Click "Turn ON" - should show success message
8. Verify setting persists after page refresh

### API Testing
```bash
# Get current setting
curl -X GET http://localhost:7855/api/settings/teams-notification \
  -H "Cookie: <session-cookie>"

# Enable notifications
curl -X PUT http://localhost:7855/api/settings/teams-notification \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"enabled": true}'

# Disable notifications
curl -X PUT http://localhost:7855/api/settings/teams-notification \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"enabled": false}'
```

## Database Migration

To apply the migration:
```bash
npm run db:push
```

This will add the `teams_notification_enabled` column to the users table with a default value of `true`.

## Notes

- The feature is user-specific (each user can have their own preference)
- Default is enabled (true) for all users
- The setting is checked before sending the daily Teams report
- Notifications are only sent Monday-Friday at 10 PM (configurable via environment variables)
- The feature integrates seamlessly with existing daily report functionality
