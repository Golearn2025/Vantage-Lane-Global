-- Minimum billable hours for HOURLY (as-directed) rate rules
alter table public.gt_rate_rules
  add column if not exists min_hours numeric;

comment on column public.gt_rate_rules.min_hours is
  'Minimum billable hours for HOURLY hire (as-directed).';
