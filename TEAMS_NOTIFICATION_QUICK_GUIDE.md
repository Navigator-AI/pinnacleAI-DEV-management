# Teams Notification Feature - Quick Reference

## What Was Added

### 1. UI Button in Reports Page
```
┌─────────────────────────────────────────────────────────────┐
│ Reports & Analytics                                         │
│ Insights and metrics for your projects                      │
│                                                              │
│                    [Export] [Teams] [Custom Report]         │
│                              ↑
│                         NEW BUTTON
└─────────────────────────────────────────────────────────────┘
```

### 2. Teams Notification Dialog
When user clicks "Teams" button:
```
┌──────────────────────────────────────────────────────┐
│ 💬 Teams Notifications                               │
│ Control when daily task updates are sent to Teams    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Daily Task Updates                          ON      │
│ Sent every weekday at 10 PM                         │
│ (except Saturday & Sunday)                          │
│                                                      │
│ When enabled: You'll receive daily task updates     │
│ When disabled: No Teams notifications will be sent  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                    [Turn OFF]  [Turn ON]             │
└──────────────────────────────────────────────────────┘
```

## How It Works

### Notification Schedule
- **When:** Every day at 10 PM
- **Days:** Monday to Friday (weekdays only)
- **Skip:** Saturday and Sunday
- **Content:** Daily task updates summary

### User Control
1. Click "Teams" button in Reports page
2. Dialog shows current status (ON/OFF)
3. Click "Turn ON" to enable notifications
4. Click "Turn OFF" to disable notifications
5. Setting is saved immediately

### Behind the Scenes
- Setting stored in database (`users.teams_notification_enabled`)
- Checked before sending daily report
- If disabled → report is skipped
- If enabled → report is sent to Teams channel

## Files Modified/Created

### New Files
- `migrations/0003_add_teams_notification_setting.sql` - Database migration
- `client/src/components/teams-notification-dialog.tsx` - Dialog component
- `TEAMS_NOTIFICATION_FEATURE.md` - Feature documentation

### Modified Files
- `shared/schema.ts` - Added teamsNotificationEnabled field
- `server/routes.ts` - Added API endpoints
- `client/src/pages/reports.tsx` - Added Teams button and dialog
- `server/daily-teams-report.ts` - Added note about notification check

## API Endpoints

### Get Current Setting
```
GET /api/settings/teams-notification
Response: { teamsNotificationEnabled: boolean }
```

### Update Setting
```
PUT /api/settings/teams-notification
Body: { enabled: boolean }
Response: { success: true, teamsNotificationEnabled: boolean, message: string }
```

## Key Features

✅ Simple ON/OFF toggle
✅ Persistent storage in database
✅ Real-time UI feedback
✅ Respects user preferences
✅ Only affects current user
✅ Default: Enabled (true)
✅ Integrates with existing daily report system
✅ No breaking changes to existing functionality

## Testing Checklist

- [ ] Navigate to Reports page
- [ ] Click "Teams" button
- [ ] Dialog opens showing current status
- [ ] Click "Turn OFF" - notification shows success
- [ ] Click "Teams" button again - shows OFF status
- [ ] Click "Turn ON" - notification shows success
- [ ] Refresh page - setting persists
- [ ] Check database: `SELECT teams_notification_enabled FROM users WHERE id = '<user-id>'`
- [ ] Verify daily report respects the setting

## Deployment Steps

1. Run database migration:
   ```bash
   npm run db:push
   ```

2. Restart the application:
   ```bash
   npm run dev
   # or
   docker-compose up -d --build
   ```

3. Test the feature in Reports page

## Notes

- Each user has their own notification preference
- Default is enabled for all users
- The feature is independent of other settings
- No impact on existing functionality
- Fully backward compatible
