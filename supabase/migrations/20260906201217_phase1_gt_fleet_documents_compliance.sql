-- Phase 1.4: GT vehicle categories, fleet declarations/units, documents, scoped compliance

create table public.vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  example_models text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.vehicle_categories (code, name, example_models, sort_order) values
('EXECUTIVE_SEDAN', 'Executive Sedan', 'Mercedes-Benz E-Class; BMW 5 Series / i5; Mercedes EQE', 10),
('LUXURY_SEDAN', 'Luxury Sedan', 'Mercedes-Benz S-Class; BMW 7 Series / i7', 20),
('LUXURY_SUV', 'Luxury SUV', 'Range Rover Autobiography; Cadillac Escalade / Escalade ESV', 30),
('LUXURY_MPV', 'Luxury MPV', 'Mercedes-Benz V-Class', 40),
('EXECUTIVE_VAN', 'Executive Van / Sprinter', 'Mercedes-Benz Sprinter', 50),
('MINIBUS', 'Minibus', null, 60),
('COACH', 'Coach', null, 70);

create table public.gt_fleet_declarations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  offering_id uuid not null references public.offerings (id) on delete cascade,
  vehicle_category_id uuid not null references public.vehicle_categories (id) on delete restrict,
  organization_location_id uuid references public.organization_locations (id) on delete set null,
  make text,
  model_family text,
  year_from int,
  year_to int,
  quantity int not null,
  quantity_verified_units int not null default 0,
  pax_capacity_typical int,
  luggage_capacity_typical int,
  declaration_status public.declaration_status not null default 'DECLARED',
  compliance_status public.compliance_status not null default 'UNKNOWN',
  compliance_notes text,
  source public.fleet_source not null default 'VL_ENTERED',
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint gt_fleet_declarations_quantity_positive check (quantity > 0),
  constraint gt_fleet_declarations_year_range check (year_to is null or year_from is null or year_to >= year_from),
  constraint gt_fleet_declarations_verified_qty check (quantity_verified_units >= 0 and quantity_verified_units <= quantity)
);

create index gt_fleet_declarations_offering_cat_idx on public.gt_fleet_declarations (offering_id, vehicle_category_id);
create index gt_fleet_declarations_org_idx on public.gt_fleet_declarations (organization_id);
create index gt_fleet_declarations_compliance_idx on public.gt_fleet_declarations (compliance_status);

create trigger gt_fleet_declarations_set_updated_at
before update on public.gt_fleet_declarations
for each row execute function public.set_updated_at();

create table public.gt_fleet_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  offering_id uuid not null references public.offerings (id) on delete cascade,
  vehicle_category_id uuid not null references public.vehicle_categories (id) on delete restrict,
  declaration_id uuid references public.gt_fleet_declarations (id) on delete set null,
  organization_location_id uuid references public.organization_locations (id) on delete set null,
  make text,
  model text,
  model_year int,
  registration_plate text,
  vin text,
  color text,
  pax_capacity int,
  luggage_capacity int,
  lifecycle_status public.fleet_lifecycle_status not null default 'ACTIVE',
  verification_status public.verification_status not null default 'UNVERIFIED',
  compliance_status public.compliance_status not null default 'UNKNOWN',
  compliance_notes text,
  verified_at timestamptz,
  verified_by_user_id uuid references public.profiles (id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index gt_fleet_units_org_plate_uq
  on public.gt_fleet_units (organization_id, registration_plate)
  where registration_plate is not null and archived_at is null;

create index gt_fleet_units_offering_cat_idx on public.gt_fleet_units (offering_id, vehicle_category_id);
create index gt_fleet_units_declaration_idx on public.gt_fleet_units (declaration_id);
create index gt_fleet_units_compliance_idx on public.gt_fleet_units (compliance_status);

create trigger gt_fleet_units_set_updated_at
before update on public.gt_fleet_units
for each row execute function public.set_updated_at();

create table public.document_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  default_scope public.document_scope not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.document_types (code, name, default_scope) values
('OPERATOR_LICENCE', 'Operator / private hire licence', 'ORGANIZATION'),
('COMMERCIAL_INSURANCE', 'Commercial / private hire insurance', 'ORGANIZATION'),
('SUPPLIER_AGREEMENT', 'Vantage Lane supplier agreement', 'ORGANIZATION'),
('COMPANY_REGISTRATION', 'Company registration document', 'ORGANIZATION'),
('VEHICLE_REGISTRATION', 'Vehicle registration document', 'VEHICLE_UNIT'),
('VEHICLE_INSURANCE', 'Vehicle-specific insurance', 'VEHICLE_UNIT'),
('FLEET_PHOTO_SET', 'Fleet / vehicle images', 'VEHICLE_DECLARATION'),
('SERVICE_CERTIFICATION', 'Service-specific certification', 'OFFERING');

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_type_id uuid not null references public.document_types (id) on delete restrict,
  scope public.document_scope not null,
  offering_id uuid references public.offerings (id) on delete cascade,
  fleet_unit_id uuid references public.gt_fleet_units (id) on delete cascade,
  fleet_declaration_id uuid references public.gt_fleet_declarations (id) on delete cascade,
  storage_path text not null,
  file_name text,
  mime_type text,
  issued_on date,
  expires_on date,
  verification_status public.document_verification_status not null default 'PENDING',
  verified_at timestamptz,
  verified_by_user_id uuid references public.profiles (id) on delete set null,
  rejection_reason text,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint documents_scope_fks check (
    (scope = 'ORGANIZATION' and offering_id is null and fleet_unit_id is null and fleet_declaration_id is null)
    or (scope = 'OFFERING' and offering_id is not null and fleet_unit_id is null and fleet_declaration_id is null)
    or (scope = 'VEHICLE_UNIT' and fleet_unit_id is not null and offering_id is null and fleet_declaration_id is null)
    or (scope = 'VEHICLE_DECLARATION' and fleet_declaration_id is not null and offering_id is null and fleet_unit_id is null)
  )
);

create index documents_org_idx on public.documents (organization_id);
create index documents_expires_idx on public.documents (expires_on) where archived_at is null;
create index documents_verification_idx on public.documents (verification_status);

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create table public.standard_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  service_type_id uuid references public.service_types (id) on delete set null,
  scope public.standard_scope not null,
  level public.standard_level not null,
  title text not null,
  description text,
  parameters jsonb,
  version int not null default 1,
  is_active boolean not null default true,
  supersedes_id uuid references public.standard_definitions (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (code, version)
);

-- Configurable min vehicle year policy (NOT hard-coded in app logic)
insert into public.standard_definitions (code, service_type_id, scope, level, title, description, parameters, version)
select
  'GT_MIN_VEHICLE_YEAR',
  st.id,
  'VEHICLE',
  'REQUIRED',
  'Minimum vehicle model year',
  'Premium Ground Transportation network minimum vehicle year policy.',
  jsonb_build_object('min_vehicle_year', 2023),
  1
from public.service_types st where st.code = 'GROUND_TRANSPORTATION';

insert into public.standard_definitions (code, service_type_id, scope, level, title, description, version)
select v.code, st.id, v.scope::public.standard_scope, v.level::public.standard_level, v.title, v.description, 1
from public.service_types st
cross join (values
  ('GT_LEGAL_COMPANY', 'ORGANIZATION', 'REQUIRED', 'Legally operating company', 'Supplier must be a legally operating company.'),
  ('GT_OPERATOR_LICENCE', 'ORGANIZATION', 'REQUIRED', 'Operator / licensing documentation', 'Required local operator/licensing documentation where applicable.'),
  ('GT_COMMERCIAL_INSURANCE', 'ORGANIZATION', 'REQUIRED', 'Commercial insurance', 'Valid commercial/private hire insurance where applicable.'),
  ('GT_SUPPLIER_STANDARDS_ACCEPTANCE', 'ORGANIZATION', 'REQUIRED', 'Accept VL Supplier Standards', 'Acceptance of Vantage Lane Supplier Standards.'),
  ('GT_OPERATIONAL_CONTACTS', 'ORGANIZATION', 'REQUIRED', 'Operational contact details', 'Operational contact details must be present.'),
  ('GT_WHATSAPP_CONTACT', 'ORGANIZATION', 'RECOMMENDED', 'WhatsApp contact', 'WhatsApp contact where available.'),
  ('GT_CATEGORY_MATCH', 'OFFERING', 'REQUIRED', 'Vehicle matches booked category', 'Vehicle must match booked category.'),
  ('GT_NO_DOWNGRADE', 'OFFERING', 'REQUIRED', 'No category downgrade without approval', 'No category downgrade without approval.'),
  ('GT_FLEET_INFO', 'OFFERING', 'REQUIRED', 'Real fleet information', 'Real fleet/vehicle information and images.'),
  ('GT_CLEAN_VEHICLE', 'OFFERING', 'REQUIRED', 'Premium clean vehicle', 'Premium clean interior and exterior.'),
  ('GT_BOTTLED_WATER', 'OFFERING', 'RECOMMENDED', 'Premium bottled water', 'Premium bottled water provided.'),
  ('GT_DRIVER_LICENSED', 'OFFERING', 'REQUIRED', 'Drivers legally licensed', 'Drivers legally licensed where required.'),
  ('GT_DRIVER_PRESENTATION', 'OFFERING', 'REQUIRED', 'Professional chauffeur presentation', 'Professional chauffeur presentation and attire.'),
  ('GT_NO_SMOKING', 'OFFERING', 'REQUIRED', 'No smoking in vehicle', 'No smoking in vehicle.'),
  ('GT_NO_UNAUTHORIZED_SUBCONTRACT', 'OFFERING', 'REQUIRED', 'No unauthorized subcontracting', 'No unauthorized subcontracting to unapproved providers.'),
  ('GT_VEHICLE_CAPACITY_DECLARED', 'VEHICLE', 'REQUIRED', 'Passenger and luggage capacity declared', 'Passenger and luggage capacity must be declared.')
) as v(code, scope, level, title, description)
where st.code = 'GROUND_TRANSPORTATION';

create table public.organization_standard_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  standard_definition_id uuid not null references public.standard_definitions (id) on delete restrict,
  status public.assessment_status not null default 'NOT_STARTED',
  evidence_document_id uuid references public.documents (id) on delete set null,
  assessed_at timestamptz,
  assessed_by_user_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, standard_definition_id)
);

create trigger organization_standard_assessments_set_updated_at
before update on public.organization_standard_assessments
for each row execute function public.set_updated_at();

create table public.offering_standard_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  offering_id uuid not null references public.offerings (id) on delete cascade,
  standard_definition_id uuid not null references public.standard_definitions (id) on delete restrict,
  status public.assessment_status not null default 'NOT_STARTED',
  evidence_document_id uuid references public.documents (id) on delete set null,
  assessed_at timestamptz,
  assessed_by_user_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (offering_id, standard_definition_id)
);

create trigger offering_standard_assessments_set_updated_at
before update on public.offering_standard_assessments
for each row execute function public.set_updated_at();

create table public.vehicle_standard_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  standard_definition_id uuid not null references public.standard_definitions (id) on delete restrict,
  fleet_unit_id uuid references public.gt_fleet_units (id) on delete cascade,
  fleet_declaration_id uuid references public.gt_fleet_declarations (id) on delete cascade,
  status public.assessment_status not null default 'NOT_STARTED',
  evidence_document_id uuid references public.documents (id) on delete set null,
  assessed_at timestamptz,
  assessed_by_user_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint vehicle_standard_assessments_target check (
    (fleet_unit_id is not null and fleet_declaration_id is null)
    or (fleet_unit_id is null and fleet_declaration_id is not null)
  )
);

create unique index vehicle_standard_assessments_unit_uq
  on public.vehicle_standard_assessments (fleet_unit_id, standard_definition_id)
  where fleet_unit_id is not null;

create unique index vehicle_standard_assessments_decl_uq
  on public.vehicle_standard_assessments (fleet_declaration_id, standard_definition_id)
  where fleet_declaration_id is not null;

create trigger vehicle_standard_assessments_set_updated_at
before update on public.vehicle_standard_assessments
for each row execute function public.set_updated_at();
