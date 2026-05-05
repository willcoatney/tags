-- ============================================================
-- TAGS Schema
-- Multi-tenant from day one: every table has organization_id
-- RLS enabled on every table
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now() not null
);

alter table organizations enable row level security;

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  organization_id uuid references organizations(id) on delete cascade not null,
  role text not null check (role in ('pm', 'contractor', 'admin')),
  full_name text,
  phone text,
  created_at timestamptz default now() not null
);

alter table profiles enable row level security;

-- ============================================================
-- PROJECTS
-- ============================================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  created_by uuid references profiles(id) not null,
  title text not null,
  description text not null,
  project_type text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  sow jsonb,                    -- AI-generated Scope of Work
  sow_generated_at timestamptz,
  photos text[],                -- Supabase Storage URLs
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table projects enable row level security;

-- PMs see their org's projects
create policy "PMs see own org projects"
  on projects for select
  using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

-- Contractors see all open projects
create policy "Contractors see open projects"
  on projects for select
  using (
    status = 'open'
    and exists (
      select 1 from profiles where id = auth.uid() and role = 'contractor'
    )
  );

-- PMs can create projects in their org
create policy "PMs can create projects"
  on projects for insert
  with check (
    organization_id = (select organization_id from profiles where id = auth.uid())
    and exists (
      select 1 from profiles where id = auth.uid() and role = 'pm'
    )
  );

-- PMs can update their org's projects
create policy "PMs can update own org projects"
  on projects for update
  using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

-- ============================================================
-- BIDS
-- ============================================================
create table bids (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade not null,
  contractor_id uuid references profiles(id) not null,
  amount numeric(12,2),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table bids enable row level security;

-- Contractors see their own bids
create policy "Contractors see own bids"
  on bids for select
  using (contractor_id = auth.uid());

-- PMs see bids on their org's projects
create policy "PMs see bids on their projects"
  on bids for select
  using (
    organization_id = (select organization_id from profiles where id = auth.uid())
  );

-- Contractors can submit bids
create policy "Contractors can submit bids"
  on bids for insert
  with check (
    contractor_id = auth.uid()
    and exists (
      select 1 from profiles where id = auth.uid() and role = 'contractor'
    )
  );

-- Contractors can update their own bids
create policy "Contractors can update own bids"
  on bids for update
  using (contractor_id = auth.uid());

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

-- ============================================================
-- NEW USER HANDLER
-- Automatically creates a profile when a user signs up
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, organization_id, role, full_name)
  values (
    new.id,
    (new.raw_user_meta_data->>'organization_id')::uuid,
    coalesce(new.raw_user_meta_data->>'role', 'pm'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
