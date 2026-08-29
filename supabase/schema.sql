-- ============================================================
-- NEXORA PLATFORM — SUPABASE DATABASE SCHEMA
-- PostgreSQL schema for multi-tenant Job Platform (Worker & Employer)
-- Run this script in the Supabase SQL Editor: Dashboard -> SQL Editor
-- ============================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 2. TABLE: profiles
-- Stores both Job Seekers (workers) and Employers
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('worker', 'employer')) default 'worker',
  full_name text not null default '',
  email text not null default '',
  phone text default '',
  location text default 'Jakarta',
  birthday text default '',
  place_of_birth text default '',
  about text default '',
  avatar_url text default '', 
  resume_url text default '',
  skills jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  certificates jsonb default '[]'::jsonb,
  company_name text default '',
  company_description text default '',
  company_website text default '',
  company_logo_url text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------
-- 3. TABLE: jobs
-- Job vacancies posted by employers
-- ------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references auth.users(id) on delete cascade,
  title text not null,
  company text not null,
  company_logo text default '',
  location text not null default 'Jakarta',
  work_mode text not null default 'Hybrid',
  salary text not null default 'Negotiable',
  type text not null default 'Full-time',
  industry text default 'Technology',
  deadline text default '',
  duration text default '',
  description text not null default '',
  requirements jsonb default '[]'::jsonb,
  status text not null default 'Active' check (status in ('Active', 'Draft', 'Closed')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------
-- 4. TABLE: applications
-- Job applications submitted by workers
-- ------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade not null,
  applicant_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'Applied' check (
    status in ('Applied', 'Viewed', 'In Review', 'Shortlisted', 'Interview', 'Accepted', 'Rejected')
  ),
  cover_note text default '',
  resume_url text default '',
  timeline jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(job_id, applicant_id)
);

-- ------------------------------------------------------------
-- 5. TABLE: saved_jobs (Bookmarks)
-- ------------------------------------------------------------
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, job_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;

-- Profiles
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Jobs
drop policy if exists "Anyone can view active jobs" on public.jobs;
create policy "Anyone can view active jobs"
  on public.jobs for select
  using (status = 'Active' or auth.uid() = employer_id);

drop policy if exists "Authenticated employers can insert jobs" on public.jobs;
create policy "Authenticated employers can insert jobs"
  on public.jobs for insert
  to authenticated
  with check (auth.uid() = employer_id);

drop policy if exists "Employers can update their own jobs" on public.jobs;
create policy "Employers can update their own jobs"
  on public.jobs for update
  to authenticated
  using (auth.uid() = employer_id)
  with check (auth.uid() = employer_id);

drop policy if exists "Employers can delete their own jobs" on public.jobs;
create policy "Employers can delete their own jobs"
  on public.jobs for delete
  to authenticated
  using (auth.uid() = employer_id);

-- Applications
drop policy if exists "Applicants can view their own applications" on public.applications;
create policy "Applicants can view their own applications"
  on public.applications for select
  to authenticated
  using (
    auth.uid() = applicant_id
    or auth.uid() in (select employer_id from public.jobs where id = applications.job_id)
  );

drop policy if exists "Workers can apply to jobs" on public.applications;
create policy "Workers can apply to jobs"
  on public.applications for insert
  to authenticated
  with check (auth.uid() = applicant_id);

drop policy if exists "Employers or applicants can update application" on public.applications;
drop policy if exists "Employers can update application status" on public.applications;
create policy "Employers can update application status"
  on public.applications for update
  to authenticated
  using (auth.uid() in (select employer_id from public.jobs where id = applications.job_id))
  with check (auth.uid() in (select employer_id from public.jobs where id = applications.job_id));

-- Saved Jobs
drop policy if exists "Users can view their own saved jobs" on public.saved_jobs;
create policy "Users can view their own saved jobs"
  on public.saved_jobs for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can bookmark jobs" on public.saved_jobs;
create policy "Users can bookmark jobs"
  on public.saved_jobs for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove bookmarks" on public.saved_jobs;
create policy "Users can remove bookmarks"
  on public.saved_jobs for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- AUTH TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'worker'),
    coalesce(new.raw_user_meta_data->>'company_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INITIAL SEED JOBS DATA
-- ============================================================
insert into public.jobs (title, company, location, work_mode, salary, type, industry, deadline, duration, description, requirements, status)
values
(
  'Frontend Developer Intern',
  'Nexora Studio',
  'Jakarta',
  'Hybrid',
  '$800/mo',
  'Internship',
  'Technology',
  '2026-09-12',
  '6 months',
  'Join Nexora Studio as a Frontend Developer Intern. You will work alongside senior engineers building responsive, accessible interfaces for our job platform and employer tools.',
  '["Familiarity with HTML, CSS, and JavaScript", "Basic knowledge of React or other component frameworks", "Good eye for pixel-perfect, design-system-consistent UI", "Portfolio or mini-project demonstrating frontend work"]'::jsonb,
  'Active'
),
(
  'UI/UX Designer Grad',
  'Brightmind Agency',
  'Bandung',
  'On-site',
  '$950/mo',
  'Entry Level',
  'Design',
  '2026-09-05',
  '1 year',
  'Brightmind Agency is looking for a recent graduate UI/UX designer to turn research into polished, high-fidelity interfaces for our product clients.',
  '["Degree or bootcamp in design-related field", "Portfolio with mobile and web case studies", "Proficiency in Figma", "Basic understanding of usability testing"]'::jsonb,
  'Active'
),
(
  'Data Analyst (Entry)',
  'CloudNine Analytics',
  'Jakarta',
  'Remote',
  '$1.1k/mo',
  'Entry Level',
  'Data & Analytics',
  '2026-09-20',
  'Full-time',
  'CloudNine builds analytics products for SME clients. We are hiring a junior analyst to clean data, build reports, and turn numbers into readable insights.',
  '["Working knowledge of SQL and spreadsheets", "Familiarity with a BI tool (Looker Studio, Tableau, or Power BI)", "Strong attention to detail", "Willingness to learn Python basics"]'::jsonb,
  'Active'
),
(
  'Marketing Assistant',
  'Vertex Retail',
  'Surabaya',
  'Hybrid',
  '$700/mo',
  'Entry Level',
  'Marketing',
  '2026-09-08',
  'Full-time',
  'Support the Vertex Retail marketing team across social media, content calendar, and campaign reporting. Great first step into brand marketing.',
  '["Interest in social media and content creation", "Decent writing skills in English", "Comfort with Google Workspace", "Organized and proactive"]'::jsonb,
  'Active'
),
(
  'Backend Developer Intern',
  'Karya Digital Nusantara',
  'Yogyakarta',
  'Remote',
  '$850/mo',
  'Internship',
  'Technology',
  '2026-09-25',
  '6 months',
  'Develop RESTful APIs, optimize PostgreSQL queries, and assist in cloud deployment pipelines for scalable microservices.',
  '["Understanding of Node.js, Python, or Go", "Knowledge of relational databases like PostgreSQL", "Understanding of Git and API design principles", "Problem solving enthusiasm"]'::jsonb,
  'Active'
);

-- ============================================================
-- FUNCTION: RESET PASSWORD BY EMAIL (FOR FORGOT PASSWORD)
-- ============================================================
create or replace function public.reset_password_by_email(user_email text, new_plain_password text)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  update auth.users
  set encrypted_password = extensions.crypt(new_plain_password, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
  where lower(email) = lower(trim(user_email));
  return found;
end;
$$;

-- Keamanan: Hanya service_role yang berhak memanggil fungsi ini dari backend server.
-- Dilarang keras memberikan akses ke anon atau authenticated untuk mencegah Account Takeover.
revoke execute on function public.reset_password_by_email(text, text) from public, anon, authenticated;
grant execute on function public.reset_password_by_email(text, text) to service_role;

-- ============================================================
-- AUTO-CONFIRM ALL NEW USERS (SUPABASE EMAIL CONFIRMATION BYPASS)
-- Karena OTP sudah diverifikasi langsung via Gmail Nodemailer kita
-- ============================================================
create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists auto_confirm_user_trigger on auth.users;
create trigger auto_confirm_user_trigger
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

-- Konfirmasi semua user yang saat ini masih pending email confirmation
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;

