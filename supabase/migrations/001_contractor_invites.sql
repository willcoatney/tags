-- Contractor invite system
-- PMs invite contractors directly; invited contractors skip admin approval queue

create table contractor_invites (
  id uuid primary key default gen_random_uuid(),
  token text unique not null default encode(gen_random_bytes(24), 'hex'),
  invited_by uuid references user_profiles(id) not null,
  inviting_org_id uuid references organizations(id) not null,
  email text not null,
  name text,
  used_at timestamptz,
  created_at timestamptz default now()
);

alter table contractor_invites enable row level security;

-- Only the inviting PM's org can see their invites
create policy "pm_sees_own_invites" on contractor_invites
  for all using (
    inviting_org_id = (select organization_id from user_profiles where id = auth.uid())
  );
