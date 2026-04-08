# Teams Notification Feature - Implementation Details

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Reports Page (reports.tsx)                           │  │
│  │ - Displays "Teams" button                            │  │
│  │ - Opens TeamsNotificationDialog on click             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ TeamsNotificationDialog Component                    │  │
│  │ - Shows current status (ON/OFF)                      │  │
│  │ - Provides toggle buttons                            │  │
│  │ - Calls API endpoints                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Routes (routes.ts)                               │  │
│  │ GET  /api/settings/teams-notification                │  │
│  │ PUT  /api/settings/teams-notification                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Storage Layer (storage.ts)                           │  │
│  │ - getTeamMember(userId)                              │  │
│  │ - updateTeamMember(userId, updates)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ users table                                          │  │
│  │ - id (UUID)                                          │  │
│  │ - name (text)                                        │  │
│  │ - email (text)                                       │  │
│  │ - ... other fields ...                               │  │
│  │ - teams_notification_enabled (boolean) ← NEW         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Integration

### Reports Page Integration
```typescript
// client/src/pages/reports.tsx

import { TeamsNotificationDialog } from "@/components/teams-notification-dialog";
import { MessageSquare } from "lucide-react";

export default function ReportsPage() {
  const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);

  return (
    <div>
      {/* Header with buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        {/* NEW: Teams Button */}
        <Button 
          onClick={() => setTeamsDialogOpen(true)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Teams
        </Button>
        
        <Button onClick={handleCreateCustomReport}>
          <Plus className="h-4 w-4 mr-2" />
          Custom Report
        </Button>
      </div>

      {/* Dialog Component */}
      <TeamsNotificationDialog 
        open={teamsDialogOpen}
        onOpenChange={setTeamsDialogOpen}
      />
    </div>
  );
}
```

### Dialog Component Flow
```typescript
// client/src/components/teams-notification-dialog.tsx

export function TeamsNotificationDialog({ open, onOpenChange, onToggle }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch current status when dialog opens
  useEffect(() => {
    if (open) {
      fetchTeamsNotificationStatus();
    }
  }, [open]);

  // 2. Fetch from API
  const fetchTeamsNotificationStatus = async () => {
    const response = await fetch("/api/settings/teams-notification");
    const data = await response.json();
    setIsEnabled(data.teamsNotificationEnabled);
  };

  // 3. Handle toggle
  const handleToggle = async (enabled: boolean) => {
    const response = await fetch("/api/settings/teams-notification", {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    });
    // Update UI and show toast
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialog content with ON/OFF buttons */}
      <Button onClick={() => handleToggle(false)}>Turn OFF</Button>
      <Button onClick={() => handleToggle(true)}>Turn ON</Button>
    </Dialog>
  );
}
```

## API Endpoint Implementation

### GET Endpoint
```typescript
// server/routes.ts

app.get("/api/settings/teams-notification", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const user = await storage.getTeamMember(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      teamsNotificationEnabled: user.teamsNotificationEnabled ?? true 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get Teams notification setting" });
  }
});
```

### PUT Endpoint
```typescript
// server/routes.ts

app.put("/api/settings/teams-notification", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }

    const user = await storage.updateTeamMember(userId, { 
      teamsNotificationEnabled: enabled 
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      success: true, 
      teamsNotificationEnabled: enabled,
      message: enabled 
        ? "Teams notifications enabled" 
        : "Teams notifications disabled"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update Teams notification setting" });
  }
});
```

## Database Schema

### Migration
```sql
-- migrations/0003_add_teams_notification_setting.sql
ALTER TABLE users ADD COLUMN teams_notification_enabled BOOLEAN NOT NULL DEFAULT true;
```

### Schema Definition
```typescript
// shared/schema.ts

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // ... other fields ...
  teamsNotificationEnabled: boolean("teams_notification_enabled")
    .notNull()
    .default(true),  // ← NEW FIELD
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

## Daily Report Integration

### Notification Check
```typescript
// server/daily-teams-report.ts

async function sendDailyTeamsReport(options?: SendReportOptions) {
  // ... existing checks ...

  // NEW: Check if Teams notifications are enabled
  const teamMembers = await storage.getTeamMembers();
  const adminOrManager = teamMembers.find(
    m => m.role === 'admin' || m.role === 'manager'
  );
  
  if (adminOrManager && !adminOrManager.teamsNotificationEnabled) {
    return {
      sent: false,
      reason: "Teams notifications are disabled",
      reportDate,
      totalUpdates: 0,
    };
  }

  // ... continue with sending report ...
}
```

## Data Flow Diagram

### User Enables Notifications
```
User clicks "Teams" button
         ↓
Dialog opens
         ↓
Fetch current status: GET /api/settings/teams-notification
         ↓
Display current status (ON/OFF)
         ↓
User clicks "Turn ON"
         ↓
Send: PUT /api/settings/teams-notification { enabled: true }
         ↓
Backend updates database
         ↓
Return success response
         ↓
Frontend shows toast: "Teams notifications enabled"
         ↓
Dialog closes
```

### Daily Report Sends
```
Scheduler triggers at 10 PM
         ↓
Check if it's a weekday (not Sat/Sun)
         ↓
Check if report already sent today
         ↓
Check if Teams notifications are ENABLED ← NEW CHECK
         ↓
If all checks pass:
  - Fetch task updates
  - Build Teams message
  - Send to Teams webhook
  - Mark report as sent
         ↓
If notifications disabled:
  - Skip sending
  - Log reason: "Teams notifications are disabled"
```

## Error Handling

### Frontend Error Handling
```typescript
try {
  const response = await fetch("/api/settings/teams-notification", {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });

  if (response.ok) {
    // Success
    toast({ title: "Success", description: data.message });
  } else {
    // Error
    toast({ 
      title: "Error", 
      description: "Failed to update Teams notification setting",
      variant: "destructive" 
    });
  }
} catch (error) {
  // Network error
  toast({ 
    title: "Error", 
    description: "Failed to update Teams notification setting",
    variant: "destructive" 
  });
}
```

### Backend Error Handling
```typescript
// Validation
if (typeof enabled !== 'boolean') {
  return res.status(400).json({ error: "enabled must be a boolean" });
}

// User not found
if (!user) {
  return res.status(404).json({ error: "User not found" });
}

// Server error
catch (error) {
  console.error('Update Teams notification setting error:', error);
  res.status(500).json({ error: "Failed to update Teams notification setting" });
}
```

## Testing Scenarios

### Scenario 1: Enable Notifications
1. User has notifications disabled
2. Clicks "Teams" button
3. Dialog shows "OFF"
4. Clicks "Turn ON"
5. API updates database
6. Toast shows "Teams notifications enabled"
7. Dialog closes
8. Next daily report is sent

### Scenario 2: Disable Notifications
1. User has notifications enabled
2. Clicks "Teams" button
3. Dialog shows "ON"
4. Clicks "Turn OFF"
5. API updates database
6. Toast shows "Teams notifications disabled"
7. Dialog closes
8. Next daily report is skipped

### Scenario 3: Persistence
1. User enables notifications
2. Refreshes page
3. Clicks "Teams" button
4. Dialog shows "ON" (setting persisted)

## Performance Considerations

- **Database Query:** Single query to fetch/update user record
- **API Response Time:** < 100ms typically
- **Dialog Load:** Fetches status on open (lazy loading)
- **No Impact:** Existing daily report logic unchanged
- **Scalability:** One boolean field per user, minimal storage

## Security Considerations

- **Authentication:** All endpoints require `requireAuth` middleware
- **Authorization:** Users can only modify their own settings
- **Input Validation:** `enabled` must be boolean
- **Error Messages:** Generic error messages (no info leakage)
- **Database:** Uses parameterized queries (no SQL injection)
