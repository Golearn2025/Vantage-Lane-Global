-- Backfill coordinates for seeded UK localities / country (map coverage preview).

update public.locations
set lat = 51.5074, lng = -0.1278
where kind = 'LOCALITY'
  and name_normalized = 'london'
  and country_code = 'GB'
  and (lat is null or lng is null);

update public.locations
set lat = 53.4808, lng = -2.2426
where kind = 'LOCALITY'
  and name_normalized = 'manchester'
  and country_code = 'GB'
  and (lat is null or lng is null);

update public.locations
set lat = 54.5, lng = -2.5
where kind = 'COUNTRY'
  and country_code = 'GB'
  and (lat is null or lng is null);
