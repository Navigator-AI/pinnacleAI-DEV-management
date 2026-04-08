# Forgot Password Feature Setup

## Overview
The forgot password feature has been successfully implemented with the following flow:
1. User clicks "Forgot Password?" on login page
2. User enters their email address
3. System sends a 6-digit verification code to their email
4. User enters the code to verify
5. User creates a new password
6. Password is updated in the database

## Database Migration Required

Run this SQL to create the password reset tokens table:

```sql
-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "used" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_token" ON "password_reset_tokens"("token");
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_user_id" ON "password_reset_tokens"("user_id");
```

You can run this migration using:
```bash
# If using Docker
docker exec -i pinnacle-ai-db psql -U postgres -d project_tracker < migrations/0002_add_password_reset_tokens.sql

# Or connect to your database and run the SQL directly
```

## Email Configuration

### Option 1: Development Mode (No Email Setup)
If you don't configure email settings, the reset codes will be logged to the console. This is perfect for development and testing.

### Option 2: Production Mode (With Email)
Add these environment variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### For Gmail:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `EMAIL_PASS`

#### For Other Email Providers:
- **Outlook/Office365**: `smtp.office365.com` (port 587)
- **Yahoo**: `smtp.mail.yahoo.com` (port 587)
- **Custom SMTP**: Use your provider's SMTP settings

## Testing the Feature

### Development Mode (Console Logging):
1. Click "Forgot Password?" on login page
2. Enter any registered user's email
3. Check the server console for the 6-digit code
4. Enter the code in the dialog
5. Set a new password

### Production Mode (Email):
1. Click "Forgot Password?" on login page
2. Enter your email address
3. Check your email inbox for the verification code
4. Enter the code in the dialog
5. Set a new password

## Security Features

- Reset codes expire after 15 minutes
- Codes can only be used once
- Codes are 6-digit random numbers (100000-999999)
- Email existence is not revealed for security
- Old passwords are properly hashed and replaced

## Files Modified/Created

### New Files:
- `server/email-service.ts` - Email sending service
- `migrations/0002_add_password_reset_tokens.sql` - Database migration

### Modified Files:
- `shared/schema.ts` - Added passwordResetTokens table
- `server/storage.ts` - Added password reset methods
- `server/routes.ts` - Added password reset endpoints
- `client/src/pages/login.tsx` - Added forgot password dialog
- `.env.example` - Added email configuration

## API Endpoints

- `POST /api/auth/forgot-password` - Request reset code
- `POST /api/auth/verify-reset-code` - Verify the code
- `POST /api/auth/reset-password` - Set new password

## Troubleshooting

### Reset code not received in email:
1. Check server console for errors
2. Verify email configuration in `.env`
3. Check spam/junk folder
4. In development, check console for logged code

### "Invalid reset code" error:
- Code may have expired (15 minutes)
- Code may have been used already
- Request a new code

### Email service errors:
- Verify SMTP credentials
- Check firewall/network settings
- Try using app-specific password
- Fall back to console logging for development
