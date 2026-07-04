export type UserRole = 'pm' | 'contractor' | 'admin' | 'homeowner'
export type ProjectStatus = 'draft' | 'open' | 'awarded' | 'work_complete' | 'completed' | 'cancelled'
export type BidStatus = 'submitted' | 'awarded' | 'rejected'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type ProjectType =
  | 'concrete' | 'roofing' | 'plumbing' | 'electrical' | 'hvac'
  | 'drywall' | 'painting' | 'flooring' | 'windows_doors' | 'deck_repair'
  | 'chimney' | 'landscaping' | 'general_repair' | 'restoration' | 'asphalt'
  | 'gutters' | 'other'

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  concrete: 'Concrete',
  roofing: 'Roofing',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  hvac: 'HVAC',
  drywall: 'Drywall',
  painting: 'Painting',
  flooring: 'Flooring',
  windows_doors: 'Windows & Doors',
  deck_repair: 'Deck Repair',
  chimney: 'Chimney',
  landscaping: 'Landscaping',
  general_repair: 'General Repair',
  restoration: 'Restoration',
  asphalt: 'Asphalt',
  gutters: 'Gutters',
  other: 'Other',
}

export type JobCategory =
  | 'work_order'
  | 'capital_project'
  | 'make_ready'
  | 'occupied_unit'
  | 'vacant_turn'
  | 'preventive_maintenance'
  | 'resident_damage'

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  work_order: 'Work Order',
  capital_project: 'Capital Project',
  make_ready: 'Make Ready',
  occupied_unit: 'Occupied Unit',
  vacant_turn: 'Vacant Turn',
  preventive_maintenance: 'Preventive Maintenance',
  resident_damage: 'Resident Damage',
}

export const JOB_CATEGORY_DESCRIPTIONS: Record<JobCategory, string> = {
  work_order: 'Reactive maintenance request from staff or resident',
  capital_project: 'Planned, budgeted improvement or major repair',
  make_ready: 'Light prep between tenants — paint, clean, punch list',
  occupied_unit: 'Work performed while resident is in place',
  vacant_turn: 'Full unit turnover — anything goes',
  preventive_maintenance: 'Scheduled, proactive maintenance',
  resident_damage: 'Damage caused by tenant — liability may apply',
}

export interface Organization {
  id: string
  name: string
  type: 'pm' | 'contractor' | 'homeowner'
  created_at: string
}

export interface UserProfile {
  id: string
  organization_id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  email: string | null
  created_at: string
}

export interface Property {
  id: string
  organization_id: string
  created_by: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  created_at: string
}

export interface Project {
  id: string
  organization_id: string
  property_id: string
  created_by: string
  title: string
  project_type: ProjectType
  job_category: JobCategory | null
  description: string
  budget_min: number | null
  budget_max: number | null
  status: ProjectStatus
  scope_of_work: string | null
  scope_generated_at: string | null
  scope_edited_by: string | null
  created_at: string
  updated_at: string
  properties?: Property
  project_photos?: ProjectPhoto[]
  bids?: Bid[]
}

export interface ProjectPhoto {
  id: string
  project_id: string
  storage_path: string
  public_url: string
  uploaded_by: string
  created_at: string
}

export const US_STATES: { abbr: string; name: string }[] = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' }, { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' }, { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' }, { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' }, { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' },
]

export interface ContractorProfile {
  id: string
  user_id: string
  organization_id: string
  company_name: string
  services: ProjectType[]
  service_states: string[]
  service_zip_codes: string[]
  license_url: string | null
  insurance_url: string | null
  approval_status: ApprovalStatus
  approved_by: string | null
  approved_at: string | null
  created_at: string
  user_profiles?: UserProfile
}

export interface Bid {
  id: string
  project_id: string
  contractor_user_id: string
  contractor_organization_id: string
  amount: number
  timeline_days: number
  notes: string | null
  status: BidStatus
  submitted_at: string
  updated_at: string
  contractor_profiles?: ContractorProfile
  user_profiles?: UserProfile
}
