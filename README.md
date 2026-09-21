# CampusConnect

A production-style student platform for discovering internships, jobs, hackathons, scholarships, academic resources and campus events.

## Stack

- React + Vite
- Supabase Auth
- Supabase Postgres + Row Level Security
- Supabase JavaScript client
- Lucide icons
- Responsive CSS

## Features

- Email/password authentication
- Google authentication through Supabase Auth
- Student profiles
- Opportunity search and filtering
- Bookmarks
- Application tracking
- Resource library
- Event registration
- Admin opportunity management
- Responsive student dashboard
- RLS policies for user/admin access

## 1. Create Supabase project

Create a project at https://supabase.com/.

Then open **SQL Editor** and run:

`supabase/schema.sql`

## 2. Configure Google authentication

In Supabase:

**Authentication → Providers → Google**

Enable Google and paste the Google OAuth Client ID and Client Secret from Google Cloud Console.

Add your local and production redirect URLs in **Authentication → URL Configuration**, for example:

- `http://localhost:5173`
- your deployed frontend URL

The application calls `supabase.auth.signInWithOAuth({ provider: 'google' })`; the Google secret is never stored in this repository.

## 3. Configure the frontend

Copy `.env.example` to `.env` and fill:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

The anon/publishable key is intended for frontend use when RLS is configured correctly. Never put the Supabase service-role key in this project.

## 4. Run

```bash
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

## 5. Make yourself an admin

After creating your account, open Supabase SQL Editor and run:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_EMAIL';
```

The Admin page will then appear in the sidebar.

## 6. Production deployment

Build with:

```bash
npm run build
```

Deploy the generated `dist` folder to Vercel, Netlify or another static hosting provider. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in the hosting provider.

## Security notes

- Google Client Secret belongs in Supabase's provider configuration, not GitHub.
- Never commit `.env`.
- RLS is enabled on application tables.
- Admin access is controlled by the `profiles.role` column.
