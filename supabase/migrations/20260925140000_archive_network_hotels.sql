-- Remove hotels from Network (SUPPLIER). Keep London BUYER hotel desks in Bookers.
-- Network = GT / Security / Aviation / Concierge / Events / Yacht / Medical partners only.

DO $$
DECLARE
  archived int := 0;
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT o.id
    FROM public.organizations o
    JOIN public.organization_capabilities oc
      ON oc.organization_id = o.id
     AND oc.capability = 'SUPPLIER'
    LEFT JOIN LATERAL (
      SELECT st.code
      FROM public.offerings off
      JOIN public.service_types st ON st.id = off.service_type_id
      WHERE off.organization_id = o.id
        AND off.archived_at IS NULL
      ORDER BY off.created_at ASC
      LIMIT 1
    ) st ON true
    WHERE o.archived_at IS NULL
      AND coalesce(o.is_test, false) = false
      AND (
        -- Explicit hotel seed / ex-booker hotel desks
        o.notes_public LIKE 'NETWORK_LEAD (ex-booker)%'
        OR o.notes_public LIKE 'BOOKER_DEMAND%'
        -- Any Network HOSPITALITY offering = hotel/venue desk, not partner network
        OR st.code = 'HOSPITALITY'
      )
      -- Never touch London Bookers BUYER desks (they may also have notes BOOKER_DEMAND)
      AND NOT EXISTS (
        SELECT 1
        FROM public.organization_capabilities oc2
        WHERE oc2.organization_id = o.id
          AND oc2.capability = 'BUYER'
      )
  LOOP
    UPDATE public.organizations
    SET
      archived_at = timezone('utc', now()),
      notes_public = CASE
        WHEN coalesce(notes_public, '') = '' THEN 'ARCHIVED_NETWORK_HOTEL'
        WHEN notes_public LIKE 'ARCHIVED_NETWORK_HOTEL%' THEN notes_public
        ELSE 'ARCHIVED_NETWORK_HOTEL | ' || notes_public
      END
    WHERE id = r.id
      AND archived_at IS NULL;
    archived := archived + 1;
  END LOOP;

  RAISE NOTICE 'Archived Network hotel/HOSPITALITY suppliers=%', archived;
END $$;
