# CJP Platform - Quick Start Guide

## 🚀 Getting Started

### Setup (First Time Only)
1. The platform auto-initializes the admin account on first load
2. Admin account is automatically created: `admin@cjp.in` / `AdminCJP@2026`
3. All 62 CJP demands are pre-seeded in the database

### Environment Requirements
- Node.js 18+
- pnpm (package manager)
- Supabase project connected

---

## 👤 User Flow

### 1. Register as a Member
**URL:** `/auth/sign-up`

**Fill in:**
- Full Name (required)
- Email (required)
- Occupation (dropdown, required)
- State (dropdown, required)
- District (required)
- Phone (optional)
- Age (optional)
- Password (min 6 chars)

**Result:** Account created with PENDING membership status

### 2. Submit Your Voice
**URL:** `/voices/submit`

**Submit:**
- Title - Your demand/idea
- Content - Detailed explanation
- Demographic info auto-fills from profile
- Optional: Submit anonymously

**Result:** Voice saved as PENDING, awaiting admin approval

### 3. View All Voices
**URL:** `/voices`

**See:**
- All approved voices
- Demographic context (who submitted)
- Upvote/comment on voices

### 4. View Party Demands
**URL:** `/demands`

**Explore:**
- All 62 official CJP demands
- Organized by 8 categories
- Filter and sort by category/priority

### 5. Download Member Card
**URL:** `/profile/card`

**Get:**
- Official CJP member card
- Download as PNG
- Print or share on social media

---

## 🔑 Admin Access

### Admin Login
**URL:** `/admin/login`

**Use:**
```
Email: admin@cjp.in
Password: AdminCJP@2026
```

### Admin Dashboard
**URL:** `/admin`

**View:**
- Total members count
- Voices submitted
- Pending voices
- Approved voices
- Total demands

### Moderate Voices
**URL:** `/admin/voices`

**Actions:**
- ✅ Review pending voices
- ✏️ Edit voice content for clarity
- 👍 Approve voice (makes it public)
- ❌ Reject voice (remove from system)

### Manage Users
**URL:** `/admin/users`

**Actions:**
- 👥 View all members
- ✅ Approve registrations
- ❌ Reject registrations
- 👀 View member demographics

### Manage Demands
**URL:** `/admin/agendas`

**Actions:**
- ➕ Add new party demands
- ✏️ Edit existing demands
- ❌ Delete demands
- 🏷️ Organize by category

---

## 📋 Common Tasks

### As a User

**Update My Profile**
1. Go to `/profile`
2. Edit any field
3. Save changes

**Edit My Voice**
1. Go to `/profile`
2. Find your voice
3. Click Edit
4. Update content
5. Save

**Share My Card**
1. Go to `/profile/card`
2. Click "Download Card (PNG)"
3. Share on social media

---

### As an Admin

**Approve a New Member**
1. Go to `/admin/users`
2. Find pending member
3. Click "Approve"
4. Member status changes to APPROVED

**Review and Publish a Voice**
1. Go to `/admin/voices`
2. Read pending voice
3. Click "Approve" to publish
4. Voice becomes visible to all

**Fix Typos in a Voice**
1. Go to `/admin/voices`
2. Click "Edit" on the voice
3. Update title/content
4. Click "Save Changes"
5. Update is applied

**Add a New Party Demand**
1. Go to `/admin/agendas`
2. Click "Add New Agenda"
3. Fill in title, description
4. Select category
5. Set priority
6. Click "Create"

**Create Admin Account** (if needed)
Call the setup endpoint:
```
POST /api/admin/setup
```

---

## 🎨 Key Features at a Glance

| Feature | User | Admin |
|---------|------|-------|
| Register | ✅ | - |
| Submit Voice | ✅ | ✅ (can edit any) |
| Edit Own Voice | ✅ | ✅ (all voices) |
| View Profile | ✅ | - |
| Download Card | ✅ | - |
| See Voices | ✅ (approved) | ✅ (all) |
| Approve Voices | - | ✅ |
| Reject Voices | - | ✅ |
| Manage Users | - | ✅ |
| Manage Demands | - | ✅ |
| View Dashboard | - | ✅ |

---

## 🔐 Security Notes

- **Passwords:** Minimum 6 characters, hashed securely
- **Sessions:** HTTP-only cookies, secure storage
- **Admin Access:** Requires admin credentials
- **Data Privacy:** Anonymous voices hide user identity from public
- **Editing:** Users can only edit own voices; admins can edit all

---

## 🐛 Troubleshooting

### Issue: "Please try again" when submitting voice
**Solution:**
- Check internet connection
- Verify you're logged in
- Ensure voice content is not empty
- Check browser console for errors

### Issue: Can't login as admin
**Solution:**
- Use exact email: `admin@cjp.in`
- Use exact password: `AdminCJP@2026`
- Clear browser cache
- Try incognito/private window

### Issue: Member card download not working
**Solution:**
- Check pop-up blocker
- Use Chrome or Firefox
- Ensure JavaScript is enabled
- Check available storage space

### Issue: Voice not showing in approved list
**Solution:**
- Ask admin to approve it
- Check voice status in `/admin/voices`
- Ensure voice is APPROVED, not PENDING

---

## 📞 Key URLs Reference

```
🏠 Home                    /
📝 Sign Up                 /auth/sign-up
🔓 User Login              /auth/login
🎤 Submit Voice            /voices/submit
🗣️ View Voices             /voices
📋 View Demands            /demands
📖 About                   /about
👤 My Profile              /profile
🎫 Member Card             /profile/card

🔑 Admin Login             /admin/login
📊 Admin Dashboard         /admin
🗣️ Admin Voices            /admin/voices
👥 Admin Users             /admin/users
📋 Admin Agendas           /admin/agendas
```

---

## 💡 Tips & Tricks

1. **Make Your Voice Count**
   - Provide context in your demands
   - Use clear, specific language
   - Include demographic info for insight

2. **Admin Tips**
   - Approve voices quickly to encourage engagement
   - Edit for clarity, not censorship
   - Monitor statistics weekly

3. **Sharing**
   - Download your member card weekly
   - Share on all social media platforms
   - Tell friends about the platform

4. **Best Practices**
   - Keep voices focused on one issue
   - Comment on others' voices
   - Upvote ideas you support

---

## 🚀 Next Steps

1. **Create an account** at `/auth/sign-up`
2. **Submit your first voice** at `/voices/submit`
3. **Download your card** at `/profile/card`
4. **Share and invite** friends to join
5. **View demands** at `/demands`

---

## 📚 Full Documentation

For comprehensive documentation, see:
- `CJP_FEATURES.md` - Complete feature guide
- `ENHANCEMENTS.md` - Implementation details

---

**Welcome to the CJP Movement! 🇮 Revolution and Youth Demand**

Last Updated: May 23, 2026
Status: Ready to Use ✨
