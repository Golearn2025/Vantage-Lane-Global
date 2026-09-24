-- Bookers UK policy: only London. Archive GB BUYER desks outside London.
-- Networking SUPPLIER leads are untouched.

DO $$
DECLARE
  archived int := 0;
  r record;
BEGIN
  FOR r IN
    SELECT o.id
    FROM public.organizations o
    JOIN public.organization_capabilities oc
      ON oc.organization_id = o.id
     AND oc.capability = 'BUYER'
    WHERE o.archived_at IS NULL
      AND o.legal_country_code = 'GB'
      AND lower(trim(coalesce(o.legal_city, ''))) NOT IN ('london')
      AND (
        o.notes_public LIKE 'BOOKER_DEMAND%'
        OR NOT EXISTS (
          SELECT 1
          FROM public.organization_capabilities oc2
          WHERE oc2.organization_id = o.id
            AND oc2.capability = 'SUPPLIER'
        )
      )
  LOOP
    UPDATE public.organizations
    SET archived_at = timezone('utc', now())
    WHERE id = r.id
      AND archived_at IS NULL;
    archived := archived + 1;
  END LOOP;

  RAISE NOTICE 'Bookers UK non-London archived=%', archived;
END $$;
