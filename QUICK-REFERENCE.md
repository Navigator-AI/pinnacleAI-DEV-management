# 🚀 Quick Reference Guide - New Features

## 📍 Feature 1: Multiple Task Assignees

### Location:
```
Projects → Select Project → Tasks Tab → Create/Edit Task
OR
Tasks Page → Create/Edit Task
```

### What You'll See:
```
┌─────────────────────────────────────┐
│ Assignees                           │
│ ┌─────────────────────────────────┐ │
│ │ ☑ John Doe                      │ │
│ │ ☑ Jane Smith                    │ │
│ │ ☐ Mike Johnson                  │ │
│ │ ☑ Sarah Williams                │ │
│ └─────────────────────────────────┘ │
│ 3 assignees selected                │
└─────────────────────────────────────┘
```

### How to Use:
1. Click checkboxes to select multiple team members
2. All checked members will be assigned to the task
3. Works in both Create and Edit modes
4. Only available for Admin and Manager roles

---

## 📍 Feature 2: Teams Button on Member Cards

### Location:
```
Team Page → Member Cards → Bottom Buttons
```

### What You'll See:
```
┌──────────────────────────────────┐
│  👤 John Doe                     │
│  john@company.com                │
│  ┌─────────┐  ┌─────────┐       │
│  │ 📧 Email│  │ 💬 Teams│       │
│  └─────────┘  └─────────┘       │
└──────────────────────────────────┘
```

### How to Use:
- **Email Button:** Opens email client
- **Teams Button:** Opens Microsoft Teams chat
  - ✅ If Teams username is set → Opens Teams
  - ❌ If not set → Shows error message

---

## 📍 Feature 3: Add Teams Username

### Location:
```
Team Page → Add Member Button → Form
OR
Team Page → Member Card → Menu → Edit Member
```

### What You'll See:
```
┌─────────────────────────────────────┐
│ Add New Member                      │
├─────────────────────────────────────┤
│ Full Name                           │
│ [John Doe                        ]  │
│                                     │
│ Email Address                       │
│ [john@company.com                ]  │
│                                     │
│ Username                            │
│ [johndoe                         ]  │
│                                     │
│ Microsoft Teams Username            │
│ [john.doe@company.com            ]  │
│                                     │
│ Role: [Member ▼]  Status: [Online ▼]│
│                                     │
│ [Cancel]  [Add Member]              │
└─────────────────────────────────────┘
```

### How to Use:
1. Fill in all fields including Teams Username
2. Teams Username is optional but recommended
3. Use the member's Microsoft Teams email
4. This enables the Teams button functionality

---

## 🎯 Complete Workflow Example

### Scenario: Add a new team member and assign them to a task

**Step 1: Add Team Member**
```
1. Go to Team page
2. Click "Add Member"
3. Enter:
   - Name: Sarah Williams
   - Email: sarah@company.com
   - Username: sarahw
   - Teams Username: sarah.williams@company.com
   - Role: Member
4. Click "Add Member"
```

**Step 2: Create Task with Multiple Assignees**
```
1. Go to Projects → Select a project
2. Click "Tasks" tab
3. Click "Add Task"
4. Enter task details
5. In Assignees section, check:
   ☑ John Doe
   ☑ Sarah Williams
   ☑ Mike Johnson
6. Click "Create Task"
```

**Step 3: Contact Team Member via Teams**
```
1. Go to Team page
2. Find Sarah Williams card
3. Click "Teams" button
4. Microsoft Teams opens with chat to Sarah
```

---

## 🔧 Troubleshooting

### Teams Button Not Working?
- **Check:** Is Teams Username set for the member?
- **Fix:** Edit member and add their Teams username

### Can't Select Multiple Assignees?
- **Check:** Are you logged in as Admin or Manager?
- **Fix:** Only Admin and Manager can assign multiple users

### Team Member Not Showing?
- **Check:** Was the member added successfully?
- **Fix:** Refresh the page or check database

---

## 📞 Support

If you encounter any issues:
1. Check the application logs: `docker-compose logs app`
2. Verify database connection: `docker-compose ps`
3. Restart application: `docker-compose restart app`

---

**Application URL:** http://localhost:7855
**Login:** admin@pinnacle.ai / admin123

**Last Updated:** February 6, 2026
