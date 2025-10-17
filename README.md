# VidaRise - Rise in Life

A mentorship platform built to streamline mentorship programs, reducing friction and maximizing effectiveness for both mentors and mentees.

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Vercel account (for deployment)

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Once your project is ready, go to Project Settings > API
   - Copy your project URL and anon/public key

3. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Set up the database**
   - In your Supabase dashboard, go to SQL Editor
   - Run the SQL script from `supabase/schema.sql`
   - This will create all necessary tables and security policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
risevida-app/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── profile/           # Profile management
│   ├── admin/             # Admin panel
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
├── lib/                   # Utilities and helpers
│   └── supabase/         # Supabase client configuration
├── public/               # Static assets
├── supabase/             # Database schemas and migrations
└── README.md
```

## Features Roadmap

### Phase 1: Profile Creation (Current)
- [x] Project setup
- [ ] Auth system (email + Google OAuth)
- [ ] Mentor profile form
- [ ] Mentee profile form
- [ ] Admin view of all profiles

### Phase 2: Matching
- [ ] Admin matching interface
- [ ] View matched pairs
- [ ] Notification system

### Phase 3: Meetings & Debriefs
- [ ] Meeting scheduling
- [ ] Meeting tracking
- [ ] Post-meeting debrief forms

### Phase 4: Admin Dashboard
- [ ] Progress tracking
- [ ] Analytics
- [ ] Report generation

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables from `.env.local`
5. Deploy!

## Support

For issues or questions, contact the development team.

---

**Built with purpose. Designed for growth.**
