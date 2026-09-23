-- Add coverage step to every partner onboarding wizard (same data as Add Operator).
-- Soft-linked LEAD orgs keep their coverage; partner ONBOARDING orgs set their own.

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"documents","label":"Documents"},
  {"key":"fleet","label":"Fleet"},
  {"key":"rates","label":"Rate card"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'GROUND_TRANSPORTATION';

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"documents","label":"Documents"},
  {"key":"aircraft","label":"Aircraft"},
  {"key":"rates","label":"Rate card"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'AVIATION';

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"documents","label":"Documents"},
  {"key":"operatives","label":"Operatives"},
  {"key":"rates","label":"Rate card"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'SECURITY';

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"documents","label":"Documents"},
  {"key":"properties","label":"Properties"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'HOSPITALITY';

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"documents","label":"Documents"},
  {"key":"specialisations","label":"Specialisations"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'CONCIERGE';

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"documents","label":"Documents"},
  {"key":"vessels","label":"Vessels"},
  {"key":"rates","label":"Rate card"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'YACHT';

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"documents","label":"Documents"},
  {"key":"services","label":"Services"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'MEDICAL';

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"documents","label":"Documents"},
  {"key":"capabilities","label":"Capabilities"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'EVENTS';
