# Cockroach Janta Party (CJP) Platform - Complete Features Guide

## Overview
The CJP platform is a comprehensive web application for the Cockroach Janta Party's youth movement, featuring user management, voice collection, demand tracking, and admin moderation.

---

## 🎯 User Registration & Profile

### Sign-Up Form Fields (Required)
- **Full Name** - User's complete name
- **Email** - For account authentication
- **Occupation** - Dropdown selection (Student, Employed, Self-Employed, Farmer, Business Owner, Homemaker, Retired, Looking for Work, Other)
- **State** - Dropdown with all 28 Indian states
- **District** - Text input for district name
- **Phone Number** - Optional contact number
- **Age** - Numerical input (13-120 years)
- **Password** - Minimum 6 characters

### Membership Status
- **PENDING** - Default status for new registrations, pending admin approval
- **APPROVED** - Member fully approved
- **REJECTED** - Registration rejected by admin

### Profile Dashboard
- View personal information
- Edit profile details
- Access member card generation
- View submitted voices
- Download membership card

---

## 🗣️ Youth Voice Features

### Submit a Voice
Members can share their demands, ideas, and vision through the voice submission system.

**Voice Submission Fields:**
- **Title** - Main demand or idea (required)
- **Content** - Detailed explanation (required, max 5000 characters)
- **Demographics** (auto-filled from profile):
  - Occupation
  - State
  - District
  - Age
- **Anonymous Option** - Submit without name display (identity visible to admin)

### Voice Status Workflow
1. **PENDING** - Submitted by user, awaiting admin review
2. **APPROVED** - Visible to all members on platform
3. **REJECTED** - Rejected by admin, not displayed publicly
4. **EDITED** - User or admin can edit content anytime (tracked in voice_edits table)

### Voice Features
- ✅ User can edit own voice (before or after approval)
- ✅ Admin can edit any voice for clarity/moderation
- ✅ Anonymous submission option
- ✅ Upvote/comment system on approved voices
- ✅ Edit history tracking
- ✅ Demographic context displayed with each voice

---

## 📋 Party Demands/Agendas

### Complete List of 62 CJP Demands

The platform includes all 62 official CJP demands organized into 8 categories:

1. **Political Reforms (11 demands)**
   - Comprehensive Political System Reform
   - Ethical and Accountable Leadership
   - Ban Criminal Candidates
   - Anti-Defection Law
   - Right to Recall Representatives
   - Age and Term Limits
   - 50% Women Reservation
   - Internal Party Democracy
   - Merit-Based Standards
   - End VIP Culture
   - No Political Appointments After Retirement

2. **Electoral Reforms (5 demands)**
   - Free and Fair Elections
   - Spending Limits
   - Transparent Funding
   - Regulation of Advertising
   - Asset Declaration

3. **Anti-Corruption (5 demands)**
   - Strong Anti-Corruption Framework
   - Independent Institutions
   - Merit-Based Appointments
   - Department Accountability
   - Fast-Track Corruption Courts

4. **Justice (6 demands)**
   - Fast and Efficient Judiciary
   - Constitutional Court
   - Judicial Infrastructure
   - Strong Punishment for Heinous Crimes
   - Juvenile Justice Reform
   - Police Accountability (Body Cameras)

5. **Social Harmony (8 demands)**
   - Ban Religion/Caste-Based Politics
   - Criminalize Hate Discrimination
   - Ban Hate Speech
   - National Unity Programs
   - Superstition Laws
   - Scientific Temper Campaign
   - Equal Law for All
   - Conflict Prevention Commission

6. **Education (7 demands)**
   - Education Governance Reforms
   - Youth Leadership Opportunities
   - Constitutional Education
   - Leader Accountability in Education
   - Tax Relief on Materials
   - IJS/IHS/IES Services
   - Qualification-Based Appointments

7. **Technology & Governance (8 demands)**
   - Digital Governance Systems
   - AI-Based Procurement
   - Smart City Systems
   - Professional Governance
   - Expert Advisory Councils
   - Constitutional Training
   - Minister Performance Reviews
   - Government Employment Expansion

8. **National Development (12 demands)**
   - Reduce Import Dependence
   - Defence & ISRO Investment
   - Territorial Integrity
   - State Innovation Agencies
   - Tourism Development
   - Population Management
   - Cleanliness Mission
   - Addictive Product Ban
   - Indian Digital Platforms
   - Child Digital Safety
   - Journalist Protection
   - Armed Forces Benefits

### Admin Agenda Management
- ✅ Create new agendas
- ✅ Edit existing agendas (only admins)
- ✅ Delete agendas (only admins)
- ✅ View all 62 demands with priority sorting
- ✅ Categorize by policy area
- ✅ Track creator information

---

## 👤 Admin Panel Features

### Admin Access
**Credentials:** `admin@cjp.in` / `AdminCJP@2026`

### Admin Login Page
- Separate login at `/admin/login`
- Admin metadata verification
- Secure session management

### Admin Dashboard (`/admin`)
Shows real-time statistics:
- Total registered members
- Total voices submitted
- Pending voices count
- Approved voices count
- Total agendas

Quick navigation to:
- Voice Moderation
- Agenda Management
- User Management

### Voice Moderation (`/admin/voices`)
**Admin can:**
- ✅ View all pending voices
- ✅ See voice demographic context (state, district, age, occupation)
- ✅ Approve voices (status → APPROVED)
- ✅ Reject voices (status → REJECTED)
- ✅ **Edit voice content** (fix typos, improve clarity)
- ✅ Save edited versions
- ✅ Track all changes

**Voice Edit Interface:**
- Inline editing of title and content
- Save/Cancel buttons
- Automatic history tracking
- Display contributor details (name, email, demographics)

### User Management (`/admin/users`)
**Admin can:**
- ✅ View all registered members
- ✅ See member demographics (state, district, age, occupation, phone)
- ✅ View membership status (PENDING/APPROVED/REJECTED)
- ✅ Approve/Reject registrations
- ✅ Search and filter members
- ✅ Export member lists

### Agenda Management (`/admin/agendas`)
**Admin can:**
- ✅ Create new party demands
- ✅ Edit existing agendas
- ✅ Delete agendas
- ✅ Organize by category
- ✅ Set priority levels
- ✅ View all 62 demands with descriptions

---

## 🎫 Member Card

### Card Features
- ✅ Personalized member card with:
  - CJP official logo
  - Member name
  - Unique membership ID
  - Membership date
  - Membership status
  - Party motto: "Revolution and Youth Demand"
  - Tagline: "United Voice • Equal Rights • Strong Nation"

### Download Options
- 📥 **Download as PNG** - High-resolution digital ID
- 🖨️ **Print** - Physical membership card
- 📱 **Share** - Post on social media
- 💳 **Digital Proof** - Store as digital membership proof

---

## 🔐 Security & Access Control

### Row Level Security (RLS)
- Users can only view/edit their own profiles
- Users can only edit their own voices (before approval)
- Admins have full read/write access
- Approved voices visible to all members
- Pending voices only visible to admins
- Anonymous voices hide user identity from public (visible to admin)

### Authentication
- Supabase Auth with email/password
- Separate admin authentication flow
- Session management with HTTP-only cookies
- Password hashing and security

### Admin-Only Routes
- `/admin/login` - Admin login
- `/admin` - Admin dashboard
- `/admin/voices` - Voice moderation
- `/admin/agendas` - Agenda management
- `/admin/users` - User management

---

## 📊 Database Schema

### Core Tables

**users**
- id (UUID, PK, FK to auth.users)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- occupation (TEXT)
- state (TEXT)
- district (TEXT)
- phone_number (TEXT)
- age (INTEGER)
- membership_status (TEXT: PENDING/APPROVED/REJECTED)
- membership_date (TIMESTAMP)
- created_at, updated_at

**youth_voices**
- id (UUID, PK)
- user_id (UUID, FK)
- title (TEXT)
- content (TEXT)
- occupation, state, district, age (TEXT/INT - demographic context)
- is_anonymous (BOOLEAN)
- status (TEXT: PENDING/APPROVED/REJECTED)
- created_at, updated_at

**agendas**
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- category (TEXT: Political Reforms, Electoral Reforms, etc.)
- priority (INTEGER)
- created_by (UUID, FK, nullable)
- created_at, updated_at

**voice_comments**
- id (UUID, PK)
- voice_id (UUID, FK)
- user_id (UUID, FK)
- content (TEXT)
- created_at, updated_at

**voice_upvotes**
- id (UUID, PK)
- voice_id (UUID, FK)
- user_id (UUID, FK)
- UNIQUE(voice_id, user_id)

**voice_edits** (History Tracking)
- id (UUID, PK)
- voice_id (UUID, FK)
- edited_by (UUID, FK)
- previous_content (TEXT)
- new_content (TEXT)
- edited_at (TIMESTAMP)

**admin_users**
- id (UUID, PK)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- full_name (TEXT)
- created_at, updated_at

---

## 🎨 Color Scheme & Branding

### Colors
- **Primary (Orange):** #ff9500 - Main CJP brand color (saffron)
- **Secondary (Green):** #138808 - Indian flag green
- **Accent (Red-Orange):** #ff6b35 - Energy and revolution
- **Dark Background:** #0f0f0f - Dark theme
- **Light Text:** #f5f5f5 - High contrast

### Typography
- Headings: Bold, larger sizes for impact
- Body: Clear, readable sans-serif
- Emphasis: Primary color for calls-to-action

---

## 🚀 How to Use the Platform

### For Users
1. **Sign Up** - Fill registration with demographics
2. **Join** - Account created with PENDING status
3. **Submit Voice** - Share your demands and ideas
4. **Engage** - Upvote and comment on other voices
5. **Download Card** - Get your membership card
6. **Advocate** - Share your card on social media

### For Admins
1. **Login** - Use admin credentials at `/admin/login`
2. **Review Voices** - Moderate pending submissions
3. **Edit & Approve** - Fix and approve voices
4. **Manage Users** - Approve members
5. **Update Demands** - Modify party agendas
6. **Monitor Stats** - Track platform activity

---

## 📞 Important Credentials

**Admin Account**
- Email: `admin@cjp.in`
- Password: `AdminCJP@2026`
- Access: `/admin/login`

---

## ✅ Complete Feature Checklist

- [x] User registration with demographics
- [x] Profile management
- [x] Youth voice submission with context
- [x] Voice moderation (approve/reject)
- [x] Voice editing (user & admin)
- [x] Comment and upvote system
- [x] Member card generation with logo
- [x] Admin login (separate)
- [x] Admin dashboard with stats
- [x] Voice moderation interface
- [x] User management
- [x] Agenda/demand management
- [x] 62 CJP demands seeded
- [x] Demographic tracking
- [x] Anonymous voice option
- [x] Edit history tracking
- [x] Error handling
- [x] Responsive design
- [x] Dark theme
- [x] CJP branding throughout
- [x] Database RLS security

---

## 🔄 Deployment & Next Steps

1. Connect to Vercel project
2. Set up environment variables
3. Run initial database setup (`/api/admin/setup`)
4. Create admin account
5. Test all features
6. Deploy to Vercel

---

**Platform Ready for Production** ✨
