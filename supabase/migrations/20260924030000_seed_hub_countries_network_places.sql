-- Hub countries for Network Places (same behaviour as United States / UK).
insert into public.locations (kind, name, name_normalized, country_code, lat, lng, timezone, is_active)
select v.kind, v.name, v.name_normalized, v.country_code, v.lat, v.lng, v.timezone, true
from (values
  ('COUNTRY'::public.location_kind, 'France', 'france', 'FR', 46.2276, 2.2137, 'Europe/Paris'),
  ('COUNTRY'::public.location_kind, 'Germany', 'germany', 'DE', 51.1657, 10.4515, 'Europe/Berlin'),
  ('COUNTRY'::public.location_kind, 'United Arab Emirates', 'united arab emirates', 'AE', 23.4241, 53.8478, 'Asia/Dubai'),
  ('COUNTRY'::public.location_kind, 'Switzerland', 'switzerland', 'CH', 46.8182, 8.2275, 'Europe/Zurich'),
  ('COUNTRY'::public.location_kind, 'Netherlands', 'netherlands', 'NL', 52.1326, 5.2913, 'Europe/Amsterdam'),
  ('COUNTRY'::public.location_kind, 'Monaco', 'monaco', 'MC', 43.7384, 7.4246, 'Europe/Monaco'),
  ('COUNTRY'::public.location_kind, 'Saudi Arabia', 'saudi arabia', 'SA', 23.8859, 45.0792, 'Asia/Riyadh'),
  ('COUNTRY'::public.location_kind, 'Portugal', 'portugal', 'PT', 39.3999, -8.2245, 'Europe/Lisbon'),
  ('COUNTRY'::public.location_kind, 'Belgium', 'belgium', 'BE', 50.5039, 4.4699, 'Europe/Brussels'),
  ('COUNTRY'::public.location_kind, 'Austria', 'austria', 'AT', 47.5162, 14.5501, 'Europe/Vienna')
) as v(kind, name, name_normalized, country_code, lat, lng, timezone)
where not exists (
  select 1 from public.locations l
  where l.kind = 'COUNTRY' and l.country_code = v.country_code
);
