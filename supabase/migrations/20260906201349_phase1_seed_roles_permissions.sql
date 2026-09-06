-- Phase 1.7: seed permissions, roles, role_permissions

insert into public.permissions (code, description, scope) values
('platform.network.read', 'Read global network data', 'PLATFORM'),
('platform.network.manage', 'Manage global network and VL CRM', 'PLATFORM'),
('platform.catalog.manage', 'Manage platform catalogs and seeds', 'PLATFORM'),
('platform.users.manage', 'Manage platform users and role assignments', 'PLATFORM'),
('platform.communications.send', 'Log/send outreach communications', 'PLATFORM'),
('platform.audit.read', 'Read audit logs', 'PLATFORM'),
('platform.audit.write', 'Write audit logs', 'PLATFORM'),
('org.profile.write', 'Edit organization profile, bases, contacts, offerings, coverage', 'ORGANIZATION'),
('org.fleet.write', 'Edit fleet declarations and units', 'ORGANIZATION'),
('org.documents.write', 'Upload/manage organization documents', 'ORGANIZATION'),
('org.pricing.write', 'Edit rate cards (future)', 'ORGANIZATION'),
('org.members.manage', 'Manage org memberships and invitations', 'ORGANIZATION'),
('org.jobs.read', 'Read jobs (future)', 'ORGANIZATION');

insert into public.roles (code, name, scope, is_system) values
('platform_super_admin', 'Super Admin', 'PLATFORM', true),
('platform_admin', 'Platform Admin', 'PLATFORM', true),
('platform_operations', 'Platform Operations', 'PLATFORM', true),
('org_owner', 'Owner', 'ORGANIZATION', true),
('org_admin', 'Admin', 'ORGANIZATION', true),
('org_dispatcher', 'Dispatcher', 'ORGANIZATION', true),
('org_operations', 'Operations', 'ORGANIZATION', true),
('org_finance', 'Finance', 'ORGANIZATION', true),
('org_driver_coordinator', 'Driver Coordinator', 'ORGANIZATION', true),
('org_viewer', 'Viewer', 'ORGANIZATION', true);

-- Super Admin: all platform permissions
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'platform_super_admin' and p.scope = 'PLATFORM';

-- Platform Admin: network + catalog + communications + audit read (no users.manage optional - give network + catalog + comms + audit read)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'platform.network.read',
  'platform.network.manage',
  'platform.catalog.manage',
  'platform.communications.send',
  'platform.audit.read',
  'platform.audit.write'
)
where r.code = 'platform_admin';

-- Platform Operations: network read/manage + communications
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'platform.network.read',
  'platform.network.manage',
  'platform.communications.send',
  'platform.audit.read'
)
where r.code = 'platform_operations';

-- Org Owner / Admin: broad org permissions
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code in ('org_owner', 'org_admin') and p.scope = 'ORGANIZATION';

-- Dispatcher / Operations
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('org.profile.write', 'org.fleet.write', 'org.documents.write', 'org.jobs.read')
where r.code in ('org_dispatcher', 'org_operations');

-- Finance
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('org.pricing.write', 'org.documents.write', 'org.jobs.read')
where r.code = 'org_finance';

-- Driver coordinator
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('org.fleet.write', 'org.jobs.read')
where r.code = 'org_driver_coordinator';

-- Viewer: jobs read only for now (no write)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = 'org.jobs.read'
where r.code = 'org_viewer';
