# Teams Notification Feature - Visual Guide

## UI Layout

### Reports Page - Header Section
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Reports & Analytics                                               │
│  Insights and metrics for your projects                            │
│                                                                     │
│                                                                     │
│                    ┌──────────────────────────────────────────┐    │
│                    │ [📥 Export] [💬 Teams] [➕ Custom Report]│    │
│                    └──────────────────────────────────────────┘    │
│                                    ↑                                │
│                              NEW BUTTON                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Teams Notification Dialog
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  💬 Teams Notifications                                          │
│  Control when daily task updates are sent to your Teams channel  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Daily Task Updates                                    ON   │ │
│  │ Sent every weekday at 10 PM (except Saturday & Sunday)    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  When enabled:                                                   │
│  You'll receive daily task update summaries in Teams             │
│                                                                  │
│  When disabled:                                                  │
│  No Teams notifications will be sent                             │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    [Turn OFF]  [Turn ON]                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## User Workflow

### Scenario 1: Enable Notifications
```
START
  │
  ├─→ User on Reports page
  │
  ├─→ Clicks "Teams" button
  │
  ├─→ Dialog opens
  │   └─→ Shows current status: OFF
  │
  ├─→ User clicks "Turn ON"
  │
  ├─→ API call: PUT /api/settings/teams-notification { enabled: true }
  │
  ├─→ Backend updates database
  │
  ├─→ Response: { success: true, message: "Teams notifications enabled" }
  │
  ├─→ Toast notification: "Teams notifications enabled" ✓
  │
  ├─→ Dialog closes
  │
  └─→ END - Notifications now enabled
```

### Scenario 2: Disable Notifications
```
START
  │
  ├─→ User on Reports page
  │
  ├─→ Clicks "Teams" button
  │
  ├─→ Dialog opens
  │   └─→ Shows current status: ON
  │
  ├─→ User clicks "Turn OFF"
  │
  ├─→ API call: PUT /api/settings/teams-notification { enabled: false }
  │
  ├─→ Backend updates database
  │
  ├─→ Response: { success: true, message: "Teams notifications disabled" }
  │
  ├─→ Toast notification: "Teams notifications disabled" ✓
  │
  ├─→ Dialog closes
  │
  └─→ END - Notifications now disabled
```

## Daily Report Flow

### When Notifications are ENABLED
```
10:00 PM (Scheduler triggers)
  │
  ├─→ Check: Is it a weekday? YES ✓
  │
  ├─→ Check: Already sent today? NO ✓
  │
  ├─→ Check: Teams notifications enabled? YES ✓
  │
  ├─→ Fetch task updates from database
  │
  ├─→ Build Teams message
  │
  ├─→ Send to Teams webhook
  │
  ├─→ Mark report as sent
  │
  └─→ ✓ Report sent successfully
```

### When Notifications are DISABLED
```
10:00 PM (Scheduler triggers)
  │
  ├─→ Check: Is it a weekday? YES ✓
  │
  ├─→ Check: Already sent today? NO ✓
  │
  ├─→ Check: Teams notifications enabled? NO ✗
  │
  └─→ ✗ Report skipped (reason: "Teams notifications are disabled")
```

### When it's a Weekend
```
10:00 PM Saturday (Scheduler triggers)
  │
  ├─→ Check: Is it a weekday? NO ✗
  │
  └─→ ✗ Report skipped (reason: "Weekend skipped")
```

## Component Hierarchy

```
App
├── Routes
│   └── ReportsPage
│       ├── Header
│       │   └── Buttons
│       │       ├── Export Button
│       │       ├── Teams Button ← NEW
│       │       │   └── onClick: setTeamsDialogOpen(true)
│       │       └── Custom Report Button
│       │
│       ├── Stats Cards
│       ├── Report Types
│       └── Charts
│
└── TeamsNotificationDialog ← NEW COMPONENT
    ├── Dialog Header
    ├── Dialog Content
    │   ├── Status Display
    │   └── Information Text
    └── Dialog Footer
        ├── Turn OFF Button
        └── Turn ON Button
```

## State Management

### Dialog State
```
ReportsPage Component
├── State: teamsDialogOpen (boolean)
│   ├── Initial: false
│   ├── Set to true: When user clicks "Teams" button
│   └── Set to false: When dialog closes
│
└── TeamsNotificationDialog Component
    ├── State: isEnabled (boolean)
    │   ├── Fetched from API on dialog open
    │   └── Updated when user toggles
    │
    └── State: isLoading (boolean)
        ├── Set to true: During API call
        └── Set to false: After API response
```

## Data Flow

### Frontend to Backend
```
User clicks "Turn ON"
        ↓
handleToggle(true) called
        ↓
setIsLoading(true)
        ↓
fetch("/api/settings/teams-notification", {
  method: "PUT",
  body: { enabled: true }
})
        ↓
API Response received
        ↓
setIsEnabled(true)
setIsLoading(false)
        ↓
Show toast: "Teams notifications enabled"
```

### Backend to Database
```
PUT /api/settings/teams-notification
        ↓
Extract userId from session
Extract enabled from request body
        ↓
Validate: enabled is boolean
        ↓
Call storage.updateTeamMember(userId, { teamsNotificationEnabled: enabled })
        ↓
Execute SQL: UPDATE users SET teams_notification_enabled = $1 WHERE id = $2
        ↓
Return updated user object
        ↓
Send response: { success: true, teamsNotificationEnabled: true, message: "..." }
```

## Button States

### Teams Button
```
Normal State:
┌─────────────────┐
│ 💬 Teams        │
└─────────────────┘

Hover State:
┌─────────────────┐
│ 💬 Teams        │ (slightly darker background)
└─────────────────┘

Click State:
┌─────────────────┐
│ 💬 Teams        │ (dialog opens)
└─────────────────┘
```

### Dialog Buttons
```
When Status is ON:
┌──────────────┐  ┌──────────────┐
│ Turn OFF     │  │ Turn ON      │
│ (enabled)    │  │ (disabled)   │
└──────────────┘  └──────────────┘

When Status is OFF:
┌──────────────┐  ┌──────────────┐
│ Turn OFF     │  │ Turn ON      │
│ (disabled)   │  │ (enabled)    │
└──────────────┘  └──────────────┘

During Loading:
┌──────────────┐  ┌──────────────┐
│ Turn OFF     │  │ Turn ON      │
│ (disabled)   │  │ (disabled)   │
│ (loading)    │  │ (loading)    │
└──────────────┘  └──────────────┘
```

## Toast Notifications

### Success - Enabled
```
┌─────────────────────────────────────┐
│ ✓ Success                           │
│ Teams notifications enabled         │
└─────────────────────────────────────┘
```

### Success - Disabled
```
┌─────────────────────────────────────┐
│ ✓ Success                           │
│ Teams notifications disabled        │
└─────────────────────────────────────┘
```

### Error
```
┌─────────────────────────────────────┐
│ ✗ Error                             │
│ Failed to update Teams notification │
│ setting                             │
└─────────────────────────────────────┘
```

## Database Schema

### Users Table
```
┌─────────────────────────────────────────────────────┐
│ users                                               │
├─────────────────────────────────────────────────────┤
│ id (UUID)                                           │
│ username (text)                                     │
│ password (text)                                     │
│ name (text)                                         │
│ email (text)                                        │
│ teamsUsername (text)                                │
│ avatar (text)                                       │
│ gender (text)                                       │
│ role (text)                                         │
│ status (text)                                       │
│ mustChangePassword (boolean)                        │
│ teams_notification_enabled (boolean) ← NEW          │
│ createdAt (timestamp)                               │
│ updatedAt (timestamp)                               │
└─────────────────────────────────────────────────────┘
```

## API Response Examples

### GET /api/settings/teams-notification
```json
{
  "teamsNotificationEnabled": true
}
```

### PUT /api/settings/teams-notification (Enable)
```json
{
  "success": true,
  "teamsNotificationEnabled": true,
  "message": "Teams notifications enabled"
}
```

### PUT /api/settings/teams-notification (Disable)
```json
{
  "success": true,
  "teamsNotificationEnabled": false,
  "message": "Teams notifications disabled"
}
```

### Error Response
```json
{
  "error": "Failed to update Teams notification setting"
}
```

## Timeline

### User Interaction Timeline
```
T+0s   User clicks "Teams" button
T+0.1s Dialog opens
T+0.2s API call to fetch current status
T+0.3s Status displayed in dialog
T+5s   User clicks "Turn ON"
T+5.1s API call to update setting
T+5.2s Database updated
T+5.3s Response received
T+5.4s Toast notification shown
T+5.5s Dialog closes
T+6s   Feature complete
```

### Daily Report Timeline
```
T+21:59 Scheduler checks if it's time
T+22:00 Scheduler triggers
T+22:00 Check: Is weekday? YES
T+22:00 Check: Already sent? NO
T+22:00 Check: Notifications enabled? YES
T+22:01 Fetch task updates
T+22:02 Build Teams message
T+22:03 Send to Teams webhook
T+22:04 Mark as sent
T+22:05 Report complete
```

---

This visual guide helps understand the complete flow of the Teams notification feature!
