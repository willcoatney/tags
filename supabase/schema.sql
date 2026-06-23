-- ============================================================
-- TAGS Schema — Full MVP
-- Multi-tenant: every table has organization_id
-- RLS enabled on every table
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('pm', 'contractor')),
  created_at timestamptz default now()
);

-- ============================================================
-- USER PROFILES
-- ============================================================
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  role text not null check (role in ('pm', 'contractor', 'admin')),
  full_name text,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- ============================================================
-- PROPERTIES
-- ============================================================
create table properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  created_by uuid references user_profiles(id),
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  zip text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- PROJECT TYPE ENUM
-- ============================================================
create type project_type as enum (
  'concrete', 'roofing', 'plumbing', 'electrical', 'hvac',
  'drywall', 'painting', 'flooring', 'windows_doors', 'deck_repair',
  'chimney', 'landscaping', 'general_repair', 'restoration', 'asphalt',
  'gutters', 'other'
);

-- ============================================================
-- PROJECTS
-- ============================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  property_id uuid references properties(id) not null,
  created_by uuid references user_profiles(id),
  title text not null,
  project_type project_type not null,
  description text not null,
  budget_min numeric,
  budget_max numeric,
  status text not null default 'draft' check (status in ('draft', 'open', 'awarded', 'completed', 'cancelled')),
  scope_of_work text,
  scope_generated_at timestamptz,
  scope_edited_by uuid references user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PROJECT PHOTOS
-- ============================================================
create table project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  uploaded_by uuid references user_profiles(id),
  created_at timestamptz default now()
);

-- ============================================================
-- CONTRACTOR PROFILES
-- ============================================================
create table contractor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade unique,
  organization_id uuid references organizations(id),
  company_name text not null,
  services project_type[] not null default '{}',
  service_zip_codes text[] not null default '{}',
  license_url text,
  insurance_url text,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_by uuid references user_profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- BIDS
-- ============================================================
create table bids (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  contractor_user_id uuid references user_profiles(id),
  contractor_organization_id uuid references organizations(id),
  amount numeric not null,
  timeline_days integer not null,
  notes text,
  status text not null default 'submitted' check (status in ('submitted', 'awarded', 'rejected')),
  submitted_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, contractor_user_id)
);

-- ============================================================
-- NOTIFICATION LOG
-- ============================================================
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id),
  type text not null,
  channel text not null check (channel in ('sms', 'email')),
  recipient text not null,
  message text not null,
  status text not null default 'sent',
  sent_at timestamptz default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table organizations enable row level security;
alter table user_profiles enable row level security;
alter table properties enable row level security;
alter table projects enable row level security;
alter table project_photos enable row level security;
alter table contractor_profiles enable row level security;
alter table bids enable row level security;
alter table notification_log enable row level security;

create policy "users_own_profile" on user_profiles for all
  using (id = auth.uid());

create policy "pm_org_properties" on properties for all
  using (organization_id = (select organization_id from user_profiles where id = auth.uid()));

create policy "pm_see_own_projects" on projects for all
  using (organization_id = (select organization_id from user_profiles where id = auth.uid()));

create policy "contractors_see_open_projects" on projects for select
  using (
    status = 'open' and
    exists (select 1 from user_profiles where id = auth.uid() and role = 'contractor')
  );

create policy "photos_follow_project" on project_photos for select
  using (
    exists (
      select 1 from projects p
      where p.id = project_id
      and (
        p.organization_id = (select organization_id from user_profiles where id = auth.uid())
        or (p.status = 'open' and (select role from user_profiles where id = auth.uid()) = 'contractor')
      )
    )
  );

create policy "contractor_own_profile" on contractor_profiles for all
  using (user_id = auth.uid());

create policy "contractors_view_approved" on contractor_profiles for select
  using (approval_status = 'approved');

create policy "contractor_own_bids" on bids for all
  using (contractor_user_id = auth.uid());

create policy "pm_sees_bids_on_own_projects" on bids for select
  using (
    exists (
      select 1 from projects p
      where p.id = project_id
      and p.organization_id = (select organization_id from user_profiles where id = auth.uid())
    )
  );

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_projects_updated_at
  before update on projects
  for each row execute function handle_updated_at();

create trigger set_bids_updated_at
  before update on bids
  for each row execute function handle_updated_at();

-- Migration: add photo_type column (run separately if project_photos already exists)
-- ALTER TABLE project_photos ADD COLUMN IF NOT EXISTS photo_type TEXT NOT NULL DEFAULT 'pre_work' CHECK (photo_type IN ('pre_work', 'completion'));
