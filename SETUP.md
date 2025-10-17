# VidaRise Setup Instructions

## Quick Start Guide

### 1. You're Already Here!
The project structure is already set up at `/Users/lsuarez/Desktop/risevida-app`

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: VidaRise
   - **Database Password**: (create a strong password and save it!)
   - **Region**: Choose closest to you
4. Wait for the project to be created (~2 minutes)

### 3. Configure Your Environment

1. Once your Supabase project is ready:
   - Go to **Project Settings** (gear icon in sidebar)
   - Click **API** in the settings menu
   - Copy the **Project URL** and **anon public** key

2. In your terminal, navigate to the project:
   ```bash
   cd /Users/lsuarez/Desktop/risevida-app
   ```

3. Create your `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Open `.env.local` and paste your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Set Up the Database

1. In your Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New Query**
3. Open the file `supabase/schema.sql` in your project
4. Copy ALL the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press Cmd+Enter)

You should see: ✅ Success. No rows returned

This creates all your tables: profiles, matches, meetings, debriefs, etc.

### 5. Create Your First Admin User

1. In Supabase, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter:
   - **Email**: your email
   - **Password**: create a password
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create user**
5. Copy the User ID (UUID) that appears

6. Go back to **SQL Editor**, create a new query, and run:
   ```sql
   -- Replace 'your-email@example.com' with your actual email
   -- Replace 'your-user-id' with the UUID you just copied

   INSERT INTO profiles (id, email, role, full_name, profile_completed)
   VALUES (
     'your-user-id',
     'your-email@example.com',
     'admin',
     'Your Name',
     true
   );

   INSERT INTO admins (user_id)
   VALUES ('your-user-id');
   ```

### 6. Run the Development Server

```bash
cd /Users/lsuarez/Desktop/risevida-app
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000)

You should see the VidaRise homepage!

## Next Steps

Now that the foundation is set up, we need to build:

1. ✅ Auth pages (login/signup)
2. ✅ Profile creation forms
3. ✅ Admin dashboard
4. ✅ Matching interface

Let Claude Code know you're ready for the next phase!

## Troubleshooting

### "Connection refused" or database errors
- Make sure your `.env.local` has the correct Supabase URL and key
- Check that you ran the schema.sql in Supabase SQL Editor

### Can't log in
- Make sure you created your user in Supabase Authentication
- Make sure you ran the SQL to add yourself to the profiles table

### Port 3000 already in use
- Run: `lsof -ti:3000 | xargs kill` then try `npm run dev` again

## Need Help?
Ask Claude Code! I'm here to help debug and build the next features.
