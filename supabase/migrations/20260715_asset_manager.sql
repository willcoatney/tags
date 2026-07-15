-- RUN THIS MANUALLY IN THE SUPABASE SQL EDITOR AT https://sdjhnjuyfgwnjubzsfid.supabase.co

-- Add asset_manager to role check
alter table user_profiles drop constraint if exists user_profiles_role_check;
alter table user_profiles add constraint user_profiles_role_check
  check (role in ('pm', 'contractor', 'admin', 'homeowner', 'asset_manager'));

-- Portfolios
create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Which PM orgs are in which portfolio
create table if not exists portfolio_organizations (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(portfolio_id, organization_id)
);

-- Invite tokens for PMs to join a portfolio
create table if not exists portfolio_invites (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios(id) on delete cascade not null,
  token text unique not null default encode(gen_random_bytes(24), 'hex'),
  created_by uuid references user_profiles(id) not null,
  used_by_org_id uuid references organizations(id),
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);

-- RLS
alter table portfolios enable row level security;
alter table portfolio_organizations enable row level security;
alter table portfolio_invites enable row level security;

create policy "portfolio_owner_all" on portfolios for all
  using (owner_id = auth.uid());

create policy "am_read_portfolio_orgs" on portfolio_organizations for all
  using (
    exists (select 1 from portfolios where id = portfolio_id and owner_id = auth.uid())
  );

create policy "am_manage_invites" on portfolio_invites for all
  using (
    exists (select 1 from portfolios where id = portfolio_id and owner_id = auth.uid())
  );

create policy "anyone_read_invite_by_token" on portfolio_invites for select
  using (true);

create policy "am_read_projects" on projects for select
  using (
    exists (
      select 1 from portfolio_organizations po
      join portfolios pf on pf.id = po.portfolio_id
      where po.organization_id = projects.organization_id
      and pf.owner_id = auth.uid()
    )
  );

create policy "am_read_properties" on properties for select
  using (
    exists (
      select 1 from portfolio_organizations po
      join portfolios pf on pf.id = po.portfolio_id
      where po.organization_id = properties.organization_id
      and pf.owner_id = auth.uid()
    )
  );

create policy "am_read_bids" on bids for select
  using (
    exists (
      select 1 from projects proj
      join portfolio_organizations po on po.organization_id = proj.organization_id
      join portfolios pf on pf.id = po.portfolio_id
      where proj.id = bids.project_id
      and pf.owner_id = auth.uid()
    )
  );

create policy "am_read_orgs" on organizations for select
  using (
    exists (
      select 1 from portfolio_organizations po
      join portfolios pf on pf.id = po.portfolio_id
      where po.organization_id = organizations.id
      and pf.owner_id = auth.uid()
    )
  );

create policy "am_read_pm_profiles" on user_profiles for select
  using (
    exists (
      select 1 from portfolio_organizations po
      join portfolios pf on pf.id = po.portfolio_id
      where po.organization_id = (select organization_id from user_profiles up2 where up2.id = user_profiles.id)
      and pf.owner_id = auth.uid()
    )
  );
