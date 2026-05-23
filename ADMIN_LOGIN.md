# Admin Login Guide

## Admin Credentials

**Email:** `admin@cjp.in`  
**Password:** `AdminCJP@2026`

## How to Access Admin Panel

1. **Login Page:** Navigate to `/admin/login` or click "Admin login" link on the sign-up page
2. **Enter Credentials:** Use the email and password above
3. **Access Dashboard:** After successful login, you'll be redirected to `/admin`

## Admin Dashboard Features

The admin dashboard provides:

### 1. **Dashboard Overview**
   - Total registered members
   - Pending voice submissions
   - Approved voices count
   - System statistics

### 2. **Voice Moderation** (`/admin/voices`)
   - View all pending voice submissions
   - Approve or reject voices
   - Edit voice content (fix typos, improve clarity)
   - View voice metadata (location, age, occupation)

### 3. **Agenda Management** (`/admin/agendas`)
   - View all 62 party demands
   - Create new agendas/demands
   - Edit existing agendas
   - Delete agendas
   - Manage agenda categories and priorities

### 4. **User Management** (`/admin/users`)
   - View all registered members
   - Approve/reject membership requests
   - View member demographic data (state, district, occupation, age)
   - Track membership status

## Account Status

✅ **Account Created:** Yes
✅ **Email Verified:** Yes (auto-confirmed)
✅ **Admin Privileges:** Enabled
✅ **Access Level:** Full platform access

## Troubleshooting

If you encounter login issues:

1. **Clear Browser Cache:** Clear cookies and localStorage
2. **Check URL:** Ensure you're accessing `/admin/login` (not `/auth/login`)
3. **Verify Email:** Make sure you're using `admin@cjp.in` (exact match)
4. **Reset Password:** Contact system administrator if needed

## System Features

The admin system includes:
- Secure Supabase authentication
- Row-level security (RLS) policies
- Admin metadata verification
- Protected admin routes
- Audit logging for actions

---

**Last Updated:** 2026-05-23
**Status:** Production Ready ✅
