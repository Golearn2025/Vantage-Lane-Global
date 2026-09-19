-- Harden v_network_organizations: one row per organization (no duplicates from multi-partnership)
-- RLS remains permission-based on base tables (platform.network.read / manage). No open read.

CREATE OR REPLACE VIEW public.v_network_organizations AS
SELECT DISTINCT ON (o.id)
  o.id AS organization_id,
  o.display_name,
  o.legal_name,
  o.legal_country_code,
  o.is_test,
  o.archived_at,
  o.created_at,
  o.google_rating,
  o.google_review_count,
  o.google_reviews_note,
  p.id AS partnership_id,
  p.relationship_status,
  p.status_changed_at AS relationship_status_changed_at,
  off.id AS offering_id,
  off.operational_status,
  st.code AS service_code,
  st.name AS service_name,
  ol.id AS primary_base_id,
  ol.label AS primary_base_label,
  ol.city AS primary_base_city,
  ol.region AS primary_base_region,
  ol.country_code AS primary_base_country_code,
  ol.lat AS primary_base_lat,
  ol.lng AS primary_base_lng,
  (
    SELECT count(*)::integer
    FROM offering_coverages oc
    WHERE oc.organization_id = o.id AND oc.archived_at IS NULL
  ) AS coverage_count,
  (
    SELECT COALESCE(
      array_agg(sub.iata ORDER BY sub.iata) FILTER (WHERE sub.iata IS NOT NULL),
      ARRAY[]::text[]
    )
    FROM (
      SELECT DISTINCT l.iata::text AS iata
      FROM offering_coverages oc
      JOIN locations l ON l.id = oc.location_id
      WHERE oc.organization_id = o.id
        AND oc.archived_at IS NULL
        AND oc.coverage_mode = 'AIRPORT_EXPLICIT'::coverage_mode
        AND l.iata IS NOT NULL
      ORDER BY l.iata::text
      LIMIT 12
    ) sub
  ) AS coverage_airport_iatas
FROM organizations o
LEFT JOIN LATERAL (
  SELECT p1.*
  FROM partnerships p1
  WHERE p1.organization_id = o.id
  ORDER BY p1.status_changed_at DESC NULLS LAST, p1.created_at DESC
  LIMIT 1
) p ON true
LEFT JOIN LATERAL (
  SELECT off1.*
  FROM offerings off1
  WHERE off1.organization_id = o.id AND off1.archived_at IS NULL
  ORDER BY off1.created_at
  LIMIT 1
) off ON true
LEFT JOIN service_types st ON st.id = off.service_type_id
LEFT JOIN LATERAL (
  SELECT ol1.*
  FROM organization_locations ol1
  WHERE ol1.organization_id = o.id AND ol1.archived_at IS NULL
  ORDER BY ol1.is_primary DESC, ol1.created_at
  LIMIT 1
) ol ON true
WHERE o.archived_at IS NULL
ORDER BY o.id, o.display_name;
