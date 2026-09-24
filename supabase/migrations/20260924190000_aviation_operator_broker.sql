-- Aviation operator vs broker onboarding + aviation-specific document types.

insert into public.document_types (code, name, default_scope)
values
  ('AVIATION_INSURANCE', 'Aviation hull / liability insurance', 'ORGANIZATION'),
  ('AIRCRAFT_PHOTOS', 'Aircraft photos', 'ORGANIZATION')
on conflict (code) do update
set name = excluded.name;

update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"aviation_role","label":"Operator or broker"},
  {"key":"coverage","label":"Coverage"},
  {"key":"aircraft","label":"Aircraft"},
  {"key":"rates","label":"Rate card"},
  {"key":"documents","label":"Documents"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'AVIATION';
