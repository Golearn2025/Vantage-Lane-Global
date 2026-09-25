-- VL Bookers R4: additional Greater London mid-upper hotel desks (BUYER demand only)
-- Deduped against existing BOOKER_DEMAND London desks by name + email

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record;
  v_org uuid;
  inserted int := 0;
  skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('Prince Akatoki London Desk','The Prince Akatoki London','GB','https://www.theprinceakatokilondon.com/',NULL,'reservations@theprinceakatokilondon.com','+442077244700',NULL,'Marble Arch','London','England','GB',51.5142,-0.1595,'50 Great Cumberland Place, London W1H 7FD','BOOKER_DEMAND UK Marylebone mid HOSPITALITY Marble Arch',v_hosp),
    ('Holmes Hotel Marylebone Desk','Holmes Hotel London','GB','https://www.holmeshotel.com/',NULL,'reservations@holmeshotel.com','+443334006136',NULL,'Chiltern Street','London','England','GB',51.5215,-0.1558,'83 Chiltern Street, Marylebone, London W1U 6NF','BOOKER_DEMAND UK Marylebone mid HOSPITALITY Baker Street',v_hosp),
    ('The Newman Fitzrovia Desk','The Newman','GB','https://thenewman.com/',NULL,'info@thenewman.com','+442039898100',NULL,'Newman Street','London','England','GB',51.5189,-0.1365,'50 Newman Street, Fitzrovia, London W1T 3EB','BOOKER_DEMAND UK Fitzrovia mid HOSPITALITY',v_hosp),
    ('Magda Fitzrovia Desk','Magda London','GB','https://www.magdalondon.com/',NULL,'info@magdalondon.com','+447437739064',NULL,'Great Titchfield Street','London','England','GB',51.5195,-0.1402,'76 Great Titchfield Street, Fitzrovia, London W1W 5RR','BOOKER_DEMAND UK Fitzrovia mid HOSPITALITY',v_hosp),
    ('Guardsman Westminster Desk','The Guardsman','GB','https://guardsmanhotel.com/',NULL,'reservations@guardsmanhotel.com','+442073099200',NULL,'Vandon Street','London','England','GB',51.4992,-0.1345,'1 Vandon Street, Westminster, London SW1H 0AH','BOOKER_DEMAND UK Westminster mid HOSPITALITY',v_hosp),
    ('Great Scotland Yard Desk','Great Scotland Yard Hotel','GB','https://www.hyatt.com/unbound/en-US/lonub-great-scotland-yard-hotel',NULL,'info@greatscotlandyard.com','+442079254700',NULL,'Whitehall','London','England','GB',51.5062,-0.1265,'3-5 Great Scotland Yard, London SW1A 2HN','BOOKER_DEMAND UK Westminster mid HOSPITALITY Whitehall',v_hosp),
    ('Beaumont Mayfair Desk','The Beaumont Mayfair','GB','https://thebeaumont.com/',NULL,'reservations@thebeaumont.com','+442037287300',NULL,'Brown Hart Gardens','London','England','GB',51.5136,-0.1498,'Brown Hart Gardens, Mayfair, London W1K 6TF','BOOKER_DEMAND UK Mayfair mid HOSPITALITY',v_hosp),
    ('Hazlitt''s Soho Desk','Hazlitt''s','GB','https://www.hazlittshotel.com/',NULL,'reservations@hazlitts.co.uk','+442074341771',NULL,'Frith Street','London','England','GB',51.5134,-0.1318,'6 Frith Street, Soho, London W1D 3JA','BOOKER_DEMAND UK Soho mid HOSPITALITY',v_hosp),
    ('Henrietta Covent Garden Desk','Henrietta Experimental','GB','https://www.henriettahotel.com/',NULL,'sleep@henriettahotel.com','+442037945313',NULL,'Henrietta Street','London','England','GB',51.5115,-0.1235,'14-15 Henrietta Street, Covent Garden, London WC2E 8QH','BOOKER_DEMAND UK Covent Garden mid HOSPITALITY',v_hosp),
    ('Londoner Leicester Square Desk','The Londoner','GB','https://www.thelondoner.com/',NULL,'reservations@thelondoner.com','+442074510101',NULL,'Leicester Square','London','England','GB',51.5102,-0.1308,'38 Leicester Square, London WC2H 7DX','BOOKER_DEMAND UK West End mid HOSPITALITY Leicester Square',v_hosp),
    ('Pan Pacific London City Desk','Pan Pacific London','GB','https://www.panpacific.com/en/hotels-and-resorts/pp-london.html',NULL,'enquiry.pplon@panpacific.com','+442071186888',NULL,'Houndsditch','London','England','GB',51.5155,-0.0795,'80 Houndsditch, London EC3A 7AB','BOOKER_DEMAND UK City mid HOSPITALITY Liverpool Street',v_hosp),
    ('NoMad London Desk','NoMad London','GB','https://www.thenomadhotel.com/london/',NULL,'london@thenomadhotel.com','+442079658888',NULL,'Bow Street','London','England','GB',51.5131,-0.1222,'28 Bow Street, Covent Garden, London WC2E 7AW','BOOKER_DEMAND UK Covent Garden mid HOSPITALITY',v_hosp),
    ('Whitby Hotel Desk','The Whitby Hotel','GB','https://www.firmdalehotels.com/hotels/london/the-whitby-hotel/',NULL,'whitby@firmdale.com','+442079655555',NULL,'Upper Woburn Place','London','England','GB',51.5258,-0.1285,'39 Upper Woburn Place, Bloomsbury, London WC1H 0JN','BOOKER_DEMAND UK Bloomsbury mid HOSPITALITY',v_hosp),
    ('Raffles London OWO Desk','Raffles London at The OWO','GB','https://www.raffles.com/london/',NULL,'reservations.london@raffles.com','+442039199888',NULL,'Whitehall','London','England','GB',51.5055,-0.1262,'57 Whitehall, London SW1A 2HP','BOOKER_DEMAND UK Westminster mid HOSPITALITY OWO',v_hosp),
    ('Emory Knightsbridge Desk','The Emory','GB','https://www.emoryhotel.com/',NULL,'reservations@emoryhotel.com','+442078385555',NULL,'Old Brompton Road','London','England','GB',51.4948,-0.1735,'1 Old Brompton Road, Knightsbridge, London SW7 3HZ','BOOKER_DEMAND UK Knightsbridge mid HOSPITALITY',v_hosp),
    ('Leonardo Royal London City Desk','Leonardo Royal Hotel London City','GB','https://www.leonardohotels.co.uk/london/leonardo-royal-hotel-london-city',NULL,'londoncityreservations@leonardohotels.co.uk','+442078633700',NULL,'Cooper''s Row','London','England','GB',51.5105,-0.0765,'8-14 Cooper''s Row, London EC3N 2BQ','BOOKER_DEMAND UK City mid HOSPITALITY Tower',v_hosp),
    ('Amba Marble Arch Desk','Amba Hotel Marble Arch','GB','https://www.amba-hotel.com/marble-arch/',NULL,'reservations.marblearch@amba-hotel.com','+442077234888',NULL,'Edgware Road','London','England','GB',51.5148,-0.1615,'Bryanston Street, Marble Arch, London W1H 7EH','BOOKER_DEMAND UK Marylebone mid HOSPITALITY Marble Arch',v_hosp),
    ('Churchill Portman Square Desk','Hyatt Regency London The Churchill','GB','https://www.hyatt.com/en-US/hotel/united-kingdom/hyatt-regency-london-the-churchill/lonrc',NULL,'london.churchill@hyatt.com','+442074865000',NULL,'Portman Square','London','England','GB',51.5158,-0.1565,'30 Portman Square, London W1H 7BH','BOOKER_DEMAND UK Marylebone mid HOSPITALITY Portman Square',v_hosp)
  ) AS t(
    display_name, legal_name, country, website_url, website_domain, email, phone, whatsapp,
    base_label, city, region, country_code, lat, lng, formatted_address, note, service_type_id
  )
  LOOP
    IF EXISTS (
      SELECT 1 FROM organizations o WHERE o.archived_at IS NULL AND (
        (lower(o.display_name) = lower(r.display_name) AND o.legal_country_code = r.country)
        OR (r.email IS NOT NULL AND lower(coalesce(o.primary_email, '')) = lower(r.email)
            AND coalesce(o.notes_public, '') LIKE 'BOOKER_DEMAND%')
        OR (
          lower(regexp_replace(regexp_replace(o.display_name, '\s+Desk$', '', 'i'), '[^a-z0-9]', '', 'g'))
          = lower(regexp_replace(regexp_replace(r.display_name, '\s+Desk$', '', 'i'), '[^a-z0-9]', '', 'g'))
          AND o.legal_country_code = r.country
          AND coalesce(o.notes_public, '') LIKE 'BOOKER_DEMAND%'
        )
      )
    ) THEN
      skipped := skipped + 1;
      CONTINUE;
    END IF;

    INSERT INTO organizations (
      display_name, legal_name, legal_country_code, legal_city, legal_region,
      website_url, website_domain, primary_email, primary_phone_e164, primary_whatsapp_e164,
      notes_public, is_test, created_by_user_id
    ) VALUES (
      r.display_name, r.legal_name, r.country, r.city, r.region,
      r.website_url, r.website_domain, r.email, r.phone, COALESCE(r.whatsapp, r.phone),
      r.note, false, v_admin
    ) RETURNING id INTO v_org;

    INSERT INTO organization_capabilities (organization_id, capability)
    VALUES (v_org, 'BUYER') ON CONFLICT DO NOTHING;
    INSERT INTO partnerships (organization_id, relationship_status, status_changed_at)
    VALUES (v_org, 'LEAD', now());
    INSERT INTO offerings (organization_id, service_type_id, operational_status)
    VALUES (v_org, r.service_type_id, 'UNKNOWN');
    INSERT INTO organization_locations (
      organization_id, label, location_kind, city, region, country_code, lat, lng, formatted_address, is_primary
    ) VALUES (v_org, r.base_label, 'OPS_BASE', r.city, r.region, r.country_code, r.lat, r.lng, r.formatted_address, true);
    INSERT INTO organization_contacts (
      organization_id, full_name, contact_type, title, email, phone_e164, is_primary
    ) VALUES (
      v_org, 'Guest / Concierge desk', 'Other', 'Bookings desk', r.email, r.phone, true
    );
    inserted := inserted + 1;
  END LOOP;

  RAISE NOTICE 'London hotels bookers R4: inserted=% skipped=%', inserted, skipped;
END $$;
