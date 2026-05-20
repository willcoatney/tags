-- Add homeowner to user_profiles role check
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('pm', 'contractor', 'admin', 'homeowner'));

-- Add homeowner to organizations type check
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_type_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_type_check 
  CHECK (type IN ('pm', 'contractor', 'homeowner'));
