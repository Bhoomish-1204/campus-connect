-- CampusConnect Supabase schema
-- Run this in Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

create type public.user_role as enum ('student','admin');
create type public.application_status as enum ('applied','interview','selected','rejected');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  department text,
  year text,
  bio text,
  skills text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  type text not null,
  location text,
  description text,
  skills text,
  deadline date,
  apply_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, opportunity_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status public.application_status not null default 'applied',
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, opportunity_id)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  subject text,
  semester text,
  file_url text not null,
  is_approved boolean not null default false,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  location text,
  event_date timestamptz not null,
  registration_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  user_id uuid references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,event_id)
);

-- Automatically create a profile after email/password or Google signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,full_name,email)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name'),new.email)
  on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.bookmarks enable row level security;
alter table public.applications enable row level security;
alter table public.resources enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- Profiles
create policy "profiles are viewable by authenticated users" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);

-- Public catalogue for signed-in users
create policy "signed in users view opportunities" on public.opportunities for select to authenticated using (true);
create policy "admins manage opportunities" on public.opportunities for all to authenticated using ((select role from public.profiles where id=auth.uid())='admin') with check ((select role from public.profiles where id=auth.uid())='admin');

create policy "users manage own bookmarks" on public.bookmarks for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "users view own applications" on public.applications for select to authenticated using (auth.uid()=user_id);
create policy "users create own applications" on public.applications for insert to authenticated with check (auth.uid()=user_id);
create policy "users update own applications" on public.applications for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy "signed in users view approved resources" on public.resources for select to authenticated using (is_approved=true or uploaded_by=auth.uid() or (select role from public.profiles where id=auth.uid())='admin');
create policy "admins manage resources" on public.resources for all to authenticated using ((select role from public.profiles where id=auth.uid())='admin') with check ((select role from public.profiles where id=auth.uid())='admin');

create policy "signed in users view events" on public.events for select to authenticated using (true);
create policy "admins manage events" on public.events for all to authenticated using ((select role from public.profiles where id=auth.uid())='admin') with check ((select role from public.profiles where id=auth.uid())='admin');
create policy "users manage own registrations" on public.event_registrations for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Seed data. Replace/remove these records if desired.
insert into public.opportunities(title,organization,type,location,description,skills,deadline,apply_url)
select 'Frontend Developer Intern','Campus Labs','Internship','Remote','Build responsive interfaces with a small product team.','React, JavaScript, CSS',current_date + 12,'https://example.com'
where not exists (select 1 from public.opportunities where title='Frontend Developer Intern');
insert into public.opportunities(title,organization,type,location,description,skills,deadline,apply_url)
select 'AI Innovation Challenge','Tech Society','Hackathon','Chennai','Build an AI-powered solution to a real student problem.','Python, AI, Git',current_date + 20,'https://example.com'
where not exists (select 1 from public.opportunities where title='AI Innovation Challenge');
insert into public.opportunities(title,organization,type,location,description,skills,deadline,apply_url)
select 'Backend Engineering Intern','OpenStack Labs','Internship','Remote','Work on APIs, data models and developer tooling.','Python, APIs, SQL',current_date + 28,'https://example.com'
where not exists (select 1 from public.opportunities where title='Backend Engineering Intern');
insert into public.events(title,category,description,location,event_date)
select 'Full-Stack Development Workshop','Workshop','Hands-on session covering modern frontend and backend development.','Seminar Hall',now()+interval '4 days'
where not exists (select 1 from public.events where title='Full-Stack Development Workshop');
insert into public.events(title,category,description,location,event_date)
select 'Campus Hack Night','Hackathon','An evening to build, collaborate and demo projects.','Innovation Lab',now()+interval '10 days'
where not exists (select 1 from public.events where title='Campus Hack Night');
