# Login Confirmation Security Feature

## Overview
CricNet sends login confirmation emails via **Resend** when a user logs in from a new device. This is a conditional security feature that only sends emails for new devices, not on every login.

**Email Provider:** Resend (https://resend.com)
**Free Tier:** 100 emails/day
**Billing:** Pay-as-you-go after free tier

## How It Works

### Device Fingerprinting
- Each device is identified by combining the user agent and IP address
- A SHA-256 hash of this combination creates a unique fingerprint
- New devices are detected by comparing against previously recorded fingerprints

## How It Works in Practice

### Scenario 1: New Device Login (First Time)
1. User clicks "Login with Google" on Chrome Desktop
2. Auth callback is triggered with OAuth code
3. Device fingerprint created: SHA-256(Chrome user agent + IP address)
4. System checks `login_sessions` table for this fingerprint
5. **New device detected** → `/api/auth/send-login-confirmation` is called
6. Email sent via Resend with:
   - Device: "Chrome on Windows"
   - Timestamp: "July 1, 2026 11:30 AM"
   - IP Address: "203.0.113.45"
   - Password reset link (if needed)
7. User logs in successfully ✅
8. Session record created in `login_sessions` table

### Scenario 2: Repeat Device Login (Same Device)
1. User logs in again from same Chrome Desktop after 2 days
2. Device fingerprint is identical (same user agent + IP)
3. System finds existing record in `login_sessions`
4. **Known device** → `last_login_at` updated, no email sent
5. User logs in successfully ✅
6. Console logs: "New device login: user@email.com from Chrome on Windows"

### Error Handling
- **Missing RESEND_API_KEY:** Email service gracefully skipped, login still works
- **Email send fails:** Login succeeds, error logged to console
- **Database unavailable:** Session tracking fails safely, login continues
- **Invalid device fingerprint data:** Falls back to "Unknown device"

**Design principle:** Security feature never blocks user login

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
- `supabase/migrations/0005_login_sessions.sql` - Database migration for login_sessions table
- `src/lib/auth/login-session.ts` - Device fingerprinting & session tracking logic
- `src/lib/auth/email-templates.ts` - Email template generation (HTML + plain text)
- `src/app/auth/callback/route.ts` - Updated OAuth callback to track devices and trigger emails
- `src/app/api/auth/send-login-confirmation/route.ts` - API endpoint for sending emails via Resend
- `.env.example` - Updated with RESEND_API_KEY documentation

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
# Supabase configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Resend email service (REQUIRED for emails to work)
RESEND_API_KEY=your-resend-api-key
```

### Setup Instructions

1. **Sign up for Resend:** https://resend.com (free tier available)
2. **Create API key** in Resend dashboard
3. **Add to `.env.local`:** `RESEND_API_KEY=your-key-here`
4. **Add to Vercel:** Settings → Environment Variables → Add `RESEND_API_KEY`
5. **Redeploy** on Vercel

**Note:** `.env.local` is in `.gitignore` and will never be committed to GitHub.

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
