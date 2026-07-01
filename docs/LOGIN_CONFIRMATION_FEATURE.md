# Login Confirmation Security Feature

## Overview
CricNet now sends login confirmation emails when a user logs in from a new device. This is a conditional security feature that only sends emails for new devices, not on every login.

## How It Works

### Device Fingerprinting
- Each device is identified by combining the user agent and IP address
- A SHA-256 hash of this combination creates a unique fingerprint
- New devices are detected by comparing against previously recorded fingerprints

### Email Trigger
Confirmation emails are sent **only when**:
- User logs in from a device that hasn't been used before
- The email includes device name (e.g., "Chrome on Windows"), timestamp, and IP address
- Users can verify the login or reset their password if unauthorized

### Device Recording
- First login from a device: records session and sends email
- Subsequent logins from same device: updates last_login_at, no email sent

## Database Schema

### login_sessions table
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- device_fingerprint: TEXT (SHA-256 hash of user_agent + ip_address)
- ip_address: TEXT (for logging purposes)
- user_agent: TEXT (for logging purposes)
- device_name: TEXT (readable name like "Chrome on Windows")
- last_login_at: TIMESTAMPTZ (updated on each login from this device)
- created_at: TIMESTAMPTZ
```

## Implementation Details

### Files Added/Modified
- `supabase/migrations/0005_login_sessions.sql` - Database migration
- `src/lib/auth/login-session.ts` - Device fingerprinting & session tracking
- `src/lib/auth/email-templates.ts` - Email template generation
- `src/app/auth/callback/route.ts` - Updated to track sessions and trigger emails
- `src/app/api/auth/send-login-confirmation/route.ts` - API endpoint for sending emails

### Key Functions

**generateDeviceFingerprint(userAgent, ipAddress)**
- Creates a SHA-256 hash from user agent + IP
- Used as unique device identifier

**parseDeviceName(userAgent)**
- Parses user agent to extract browser and OS
- Returns readable name like "Safari on iPhone"

**checkAndRecordLoginSession(userId, deviceInfo, supabase)**
- Checks if device is new
- Records session in database
- Returns whether email should be sent

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=https://your-app-url.com (for email links)
```

## Email Content
Users receive an email with:
- Login confirmation message
- Device details (browser, OS)
- Timestamp of login
- IP address (when available)
- Link to reset password if they don't recognize the login

## Future Enhancements
1. Add in-app notification banner showing recent logins
2. Allow users to view all active sessions and revoke devices
3. Detect geographic anomalies (sudden location changes)
4. Add IP-based location lookup for "unusual location" alerts
5. Implement rate limiting on email sends to prevent spam
