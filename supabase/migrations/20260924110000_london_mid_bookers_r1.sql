-- VL Bookers: mid-upper London desks (Kensington + boroughs)
-- Not ultra-flagship, not budget 3★ — boutique / solid 4★ booking desks

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record;
  v_org uuid;
  inserted int := 0;
  skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- Kensington / South Kensington / Earl's Court
    ('Park City Grand Plaza Kensington Desk','Park City Grand Plaza Kensington','GB','https://www.parkcitylondon.com/',NULL,'reservations@parkcitylondon.co.uk','+442073417090',NULL,'Lexham Gardens','London','England','GB',51.496,-0.192,'18-30 Lexham Gardens, Kensington, London W8 5JE','BOOKER_DEMAND UK London mid HOSPITALITY Kensington',v_hosp),
    ('Gem Strathmore South Kensington Desk','Gem Strathmore Hotel','GB','https://www.gemhotels.com/hotels-london/gem-strathmore-hotel/',NULL,'strathmore@gemhotels.com','+442075840512',NULL,'Queens Gate Gardens','London','England','GB',51.495,-0.184,'41 Queens Gate Gardens, London SW7 5NB','BOOKER_DEMAND UK London mid HOSPITALITY South Kensington',v_hosp),
    ('Merit Kensington Bookings','Merit Kensington Hotel','GB','https://merithotels.co.uk/hotels/merit-kensington-hotel/',NULL,'reservations@merithotels.co.uk','+442045132576',NULL,'Earl''s Court','London','England','GB',51.492,-0.194,'12-24 Penywern Road, London SW5 9ST','BOOKER_DEMAND UK London mid HOSPITALITY Kensington',v_hosp),
    ('Bailey''s Hotel Kensington Desk','The Bailey''s Hotel London Kensington','GB','https://www.millenniumhotels.com/en/london/the-baileys-hotel-london',NULL,'reservations.baileys@millenniumhotels.co.uk','+442073736000',NULL,'Gloucester Road','London','England','GB',51.494,-0.183,'140 Gloucester Road, London SW7 4QH','BOOKER_DEMAND UK London mid HOSPITALITY South Kensington',v_hosp),
    ('The Gore Kensington Concierge','The Gore','GB','https://collezione.starhotels.com/en/our-hotels/the-gore-london/',NULL,'reservations.thegore@starhotels.com','+442075846601',NULL,'Queen''s Gate','London','England','GB',51.500,-0.180,'190 Queen''s Gate, London SW7 5EX','BOOKER_DEMAND UK London mid CONCIERGE Kensington',v_conc),
    ('The Pelham South Kensington Desk','The Pelham','GB','https://collezione.starhotels.com/en/our-hotels/the-pelham-london/',NULL,'reservations.thepelham@starhotels.com','+442075898288',NULL,'Cromwell Place','London','England','GB',51.494,-0.175,'15 Cromwell Place, London SW7 2LA','BOOKER_DEMAND UK London mid HOSPITALITY South Kensington',v_hosp),
    ('The Franklin Knightsbridge Desk','The Franklin','GB','https://collezione.starhotels.com/en/our-hotels/the-franklin-london/',NULL,'thefranklin@starhotels.com','+442075845533',NULL,'Egerton Gardens','London','England','GB',51.496,-0.167,'24 Egerton Gardens, London SW3 2DB','BOOKER_DEMAND UK London mid HOSPITALITY Knightsbridge',v_hosp),
    ('Aster House South Kensington Desk','Aster House','GB','https://www.asterhouse.com/',NULL,'reservations@asterhouse.com','+442075813388',NULL,'Sumner Place','London','England','GB',51.493,-0.175,'3 Sumner Place, London SW7 3EE','BOOKER_DEMAND UK London mid HOSPITALITY South Kensington',v_hosp),
    ('Number Sixteen South Kensington Desk','Number Sixteen','GB','https://www.firmdalehotels.com/hotels/number-sixteen/',NULL,'reservations@numbersixteenhotel.com','+442075895300',NULL,'Sumner Place','London','England','GB',51.493,-0.174,'16 Sumner Place, London SW7 3EG','BOOKER_DEMAND UK London mid HOSPITALITY South Kensington',v_hosp),
    ('K+K Hotel George Kensington Desk','K+K Hotel George','GB','https://www.kkhotels.com/hotels/london-hotel-george/',NULL,'london.george@kkhotels.com','+442073707511',NULL,'Templeton Place','London','England','GB',51.492,-0.197,'1-15 Templeton Place, London SW5 9NB','BOOKER_DEMAND UK London mid HOSPITALITY Kensington',v_hosp),

    -- Chelsea / Belgravia mid
    ('11 Cadogan Gardens Desk','11 Cadogan Gardens','GB','https://www.11cadogangardens.com/',NULL,'reservations@11cadogangardens.com','+442073073300',NULL,'Cadogan Gardens','London','England','GB',51.494,-0.159,'11 Cadogan Gardens, London SW3 2RJ','BOOKER_DEMAND UK London mid HOSPITALITY Chelsea',v_hosp),
    ('Chelsea Harbour Hotel Desk','The Chelsea Harbour Hotel','GB','https://www.millenniumhotels.com/en/london/the-chelsea-harbour-hotel/',NULL,'reservations.chelsea@millenniumhotels.co.uk','+442078230000',NULL,'Chelsea Harbour','London','England','GB',51.476,-0.183,'Chelsea Harbour Drive, London SW10 0XG','BOOKER_DEMAND UK London mid HOSPITALITY Chelsea',v_hosp),
    ('Draycott Hotel Chelsea Desk','The Draycott Hotel','GB','https://www.draycotthotel.com/',NULL,'reservations@draycotthotel.com','+442073006464',NULL,'Cadogan Gardens','London','England','GB',51.494,-0.160,'26 Cadogan Gardens, London SW3 2RP','BOOKER_DEMAND UK London mid HOSPITALITY Chelsea',v_hosp),

    -- Notting Hill / Bayswater / Paddington
    ('The Laslett Notting Hill Desk','The Laslett','GB','https://www.living-rooms.co.uk/the-laslett/',NULL,'reservations@thelaslett.co.uk','+442077926688',NULL,'Pembridge Gardens','London','England','GB',51.511,-0.196,'8 Pembridge Gardens, London W2 4DU','BOOKER_DEMAND UK London mid HOSPITALITY Notting Hill',v_hosp),
    ('Portobello Hotel Notting Hill Desk','The Portobello Hotel','GB','https://www.portobellohotel.com/',NULL,'stay@portobellohotel.com','+442077272777',NULL,'Stanley Gardens','London','England','GB',51.515,-0.204,'22 Stanley Gardens, London W11 2NG','BOOKER_DEMAND UK London mid HOSPITALITY Notting Hill',v_hosp),
    ('The Pilgrm Paddington Desk','The Pilgrm','GB','https://thepilgrm.com/',NULL,'hello@thepilgrm.com','+442074020299',NULL,'London Street','London','England','GB',51.516,-0.176,'25 London Street, London W2 1HH','BOOKER_DEMAND UK London mid HOSPITALITY Paddington',v_hosp),
    ('Inhabit Southwick Street Desk','Inhabit Hotel Southwick Street','GB','https://www.inhabithotels.com/',NULL,'southwickstreet@inhabithotels.com','+442077233131',NULL,'Southwick Street','London','England','GB',51.517,-0.169,'32-34 Southwick Street, London W2 1JR','BOOKER_DEMAND UK London mid HOSPITALITY Paddington',v_hosp),

    -- Marylebone / Fitzrovia / Bloomsbury
    ('Charlotte Street Hotel Desk','Charlotte Street Hotel','GB','https://www.firmdalehotels.com/hotels/charlotte-street-hotel/',NULL,'reservations@charlottestreethotel.com','+442078062000',NULL,'Charlotte Street','London','England','GB',51.519,-0.135,'15-17 Charlotte Street, London W1T 1RJ','BOOKER_DEMAND UK London mid HOSPITALITY Fitzrovia',v_hosp),
    ('Dorset Square Hotel Desk','Dorset Square Hotel','GB','https://www.firmdalehotels.com/hotels/dorset-square-hotel/',NULL,'reservations@dorsetsquarehotel.co.uk','+442077237874',NULL,'Dorset Square','London','England','GB',51.523,-0.161,'39-40 Dorset Square, London NW1 6QN','BOOKER_DEMAND UK London mid HOSPITALITY Marylebone',v_hosp),
    ('Covent Garden Hotel Desk','Covent Garden Hotel','GB','https://www.firmdalehotels.com/hotels/covent-garden-hotel/',NULL,'reservations@coventgardenhotel.co.uk','+442078061000',NULL,'Monmouth Street','London','England','GB',51.514,-0.127,'10 Monmouth Street, London WC2H 9HB','BOOKER_DEMAND UK London mid HOSPITALITY Covent Garden',v_hosp),
    ('The Marylebone Hotel Desk','The Marylebone','GB','https://www.doylecollection.com/hotels/the-marylebone-hotel',NULL,'marylebone@doylecollection.com','+442074869666',NULL,'Welbeck Street','London','England','GB',51.518,-0.148,'47 Welbeck Street, London W1G 8DN','BOOKER_DEMAND UK London mid HOSPITALITY Marylebone',v_hosp),
    ('The Bloomsbury Hotel Desk','The Bloomsbury','GB','https://www.doylecollection.com/hotels/the-bloomsbury-hotel',NULL,'bloomsbury@doylecollection.com','+442073471000',NULL,'Great Russell Street','London','England','GB',51.518,-0.126,'16-22 Great Russell Street, London WC1B 3NN','BOOKER_DEMAND UK London mid HOSPITALITY Bloomsbury',v_hosp),
    ('Kimpton Fitzroy London Desk','Kimpton Fitzroy London','GB','https://www.kimptonfitzroylondon.com/',NULL,'fitzroy.reservations@ihg.com','+442076367222',NULL,'Russell Square','London','England','GB',51.523,-0.125,'1-8 Russell Square, London WC1B 5BE','BOOKER_DEMAND UK London mid HOSPITALITY Bloomsbury',v_hosp),
    ('Zetter Townhouse Marylebone Desk','The Zetter Townhouse Marylebone','GB','https://www.thezetter.com/marylebone',NULL,'marylebone@thezetter.com','+442073246266',NULL,'Seymour Street','London','England','GB',51.515,-0.157,'28-30 Seymour Street, London W1H 7JB','BOOKER_DEMAND UK London mid HOSPITALITY Marylebone',v_hosp),

    -- City / Shoreditch / South Bank / Canary Wharf
    ('South Place Hotel Desk','South Place Hotel','GB','https://www.southplacehotel.com/',NULL,'reservations@southplacehotel.com','+442035018888',NULL,'South Place','London','England','GB',51.519,-0.085,'3 South Place, London EC2M 2AF','BOOKER_DEMAND UK London mid HOSPITALITY City',v_hosp),
    ('The Hoxton Shoreditch Desk','The Hoxton Shoreditch','GB','https://thehoxton.com/london/shoreditch/',NULL,'shoreditch@thehoxton.com','+442075501000',NULL,'Shoreditch','London','England','GB',51.526,-0.081,'81 Great Eastern Street, London EC2A 3HU','BOOKER_DEMAND UK London mid HOSPITALITY Shoreditch',v_hosp),
    ('Sea Containers London Desk','Sea Containers London','GB','https://www.seacontainerslondon.com/',NULL,'reservations.seacontainers@hyatt.com','+442037478000',NULL,'South Bank','London','England','GB',51.506,-0.105,'20 Upper Ground, London SE1 9PD','BOOKER_DEMAND UK London mid HOSPITALITY South Bank',v_hosp),
    ('Canary Riverside Plaza Desk','Canary Riverside Plaza','GB','https://www.canaryriversideplaza.com/',NULL,'reservations@canaryriversideplaza.com','+442077091000',NULL,'Canary Wharf','London','England','GB',51.506,-0.024,'46 Westferry Circus, London E14 8RS','BOOKER_DEMAND UK London mid HOSPITALITY Canary Wharf',v_hosp),
    ('Novotel London Canary Wharf Desk','Novotel London Canary Wharf','GB','https://all.accor.com/hotel/B0Z7/index.en.shtml',NULL,'hb0z7@accor.com','+442077151234',NULL,'Marsh Wall','London','England','GB',51.501,-0.017,'40 Marsh Wall, London E14 9TP','BOOKER_DEMAND UK London mid HOSPITALITY Canary Wharf',v_hosp),

    -- Independent / lifestyle concierge desks (buyer)
    ('Forty Seven Park Street Concierge','47 Park Street','GB','https://www.47parkstreet.com/',NULL,'reservations@47parkstreet.com','+442079156200',NULL,'Mayfair','London','England','GB',51.510,-0.152,'47 Park Street, London W1K 7EB','BOOKER_DEMAND UK London mid CONCIERGE Mayfair residences',v_conc),
    ('Cheval Knightsbridge Concierge','Cheval Knightsbridge','GB','https://www.chevalcollection.com/cheval-knightsbridge/',NULL,'knightsbridge@chevalresidences.com','+442079515555',NULL,'Knightsbridge','London','England','GB',51.500,-0.163,'2 Maule Court, London SW7 1QL','BOOKER_DEMAND UK London mid CONCIERGE Knightsbridge',v_conc)
  ) AS t(
    display_name, legal_name, country, website_url, website_domain, email, phone, whatsapp,
    base_label, city, region, country_code, lat, lng, formatted_address, note, service_type_id
  )
  LOOP
    IF EXISTS (
      SELECT 1 FROM organizations o WHERE o.archived_at IS NULL AND (
        (lower(o.display_name) = lower(r.display_name) AND o.legal_country_code = r.country)
        OR (r.email IS NOT NULL AND lower(coalesce(o.primary_email, '')) = lower(r.email)
            AND o.notes_public LIKE 'BOOKER_DEMAND%')
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
  RAISE NOTICE 'London mid bookers: inserted=% skipped=%', inserted, skipped;
END $$;
