DO $$
DECLARE
  v_gt uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
('Precision NY Chauffeur','Precision NY Chauffeur','US','https://precisioncarsny.com/','precisioncarsny.com','reservations@precisioncarsny.com','+12128589757',NULL,'Midtown','New York','NY','US',40.757,-73.982,'1177 Avenue of the Americas, Fl 5, New York, NY 10036',NULL,NULL,'WEB_RESEARCH USA agent'),
('Lux VIP Transportation NYC','Lux VIP Transportation','US','https://luxvipnyc.com/','luxvipnyc.com','Info@luxviptransportation.com','+12125752408',NULL,'Park Avenue','New York','NY','US',40.754,-73.976,'230 Park Ave Unit 405, New York, NY 10169',5.0,NULL,'WEB_RESEARCH USA agent'),
('Noble Black Car Service','Noble Black Car Service','US','https://nobleblackcarservice.com/','nobleblackcarservice.com','info@nobleblackcar.com','+18885034449',NULL,'Plaza District','New York','NY','US',40.763,-73.973,'767 5th Avenue, New York, NY 10153',5.0,150,'WEB_RESEARCH USA agent'),
('VIP NYC Transfers','VIP NYC Transfers LLC','US','https://www.vipnyctransfers.com/','vipnyctransfers.com','concierge@vipnyctransfers.com','+13322805559','+13322805559','Midtown','New York','NY','US',40.755,-73.983,'1136 6th Ave, New York, NY 10036',NULL,NULL,'WEB_RESEARCH USA agent'),
('Elite Executive Limos','Elite Executive Limos','US','https://eliteexecutivelimos.com/','eliteexecutivelimos.com','info@eliteexecutivelimos.com','+13054650400','+13054650400','Biscayne','Miami','FL','US',25.799,-80.189,'2125 Biscayne Blvd, Suite 204, Miami, FL 33137',5.0,NULL,'WEB_RESEARCH USA agent'),
('Miami Elite Transfers','Miami Elite Transfers','US','https://miamielitetransfers.com/','miamielitetransfers.com','info@miamielitetransfers.com','+18002811035','+18002811035','Near MIA','Miami','FL','US',25.778,-80.29,'5501 NW 7th St e309, Miami, FL 33126',4.9,75,'WEB_RESEARCH USA agent'),
('Legacy Car Service Miami','Legacy Car Service Miami','US','https://www.lcsmiami.com/','lcsmiami.com','info@lcsmiami.com','+13053993780','+13053993780','Hialeah','Hialeah','FL','US',25.92,-80.33,'8883 W 35th Way, Hialeah, FL 33018',5.0,203,'WEB_RESEARCH USA agent'),
('Black Car Miami','Black Car Miami','US','https://blackcarmia.com/','blackcarmia.com','reservations@blackcarmia.com','+17866853076',NULL,'Brickell','Miami','FL','US',25.768,-80.198,'735 SW 2nd St, Miami, FL 33130',4.9,128,'WEB_RESEARCH USA agent'),
('LA Private Car Service','LA Private Car Service','US','https://www.laprivatecarservice.com/','laprivatecarservice.com','info@laprivatecarservice.com','+12134712828',NULL,'Westchester','Los Angeles','CA','US',33.958,-118.39,'6060 W Manchester Ave #105, Los Angeles, CA 90045',4.9,300,'WEB_RESEARCH USA agent'),
('MGCLS LAX Car Service','MGCLS','US','https://www.laxcarservicemgcls.com/','laxcarservicemgcls.com','info@mgcls.com','+18552552557',NULL,'Westchester','Los Angeles','CA','US',33.955,-118.375,'8703 S La Tijera Blvd Suite 209, Los Angeles, CA 90045',4.8,179,'WEB_RESEARCH USA agent'),
('LAXfleet Chauffeur Services','LAXfleet','US','https://laxfleet.com/','laxfleet.com','info@laxfleet.com','+17473300077',NULL,'Verdugo','Glendale','CA','US',34.19,-118.23,'1803 Verdugo Loma Dr, Glendale, CA 91208',5.0,NULL,'WEB_RESEARCH USA agent'),
('Black Tie Car','Black Tie Car Service','US','https://www.blacktiecar.com/','blacktiecar.com','reservations@blacktiecar.com','+14243616082','+14243616082','Wilshire','Los Angeles','CA','US',34.058,-118.44,'10880 Wilshire Boulevard, Los Angeles, CA',4.9,NULL,'WEB_RESEARCH USA agent'),
('Ride N Relax','Ride and Relax Shuttle Services LLC','US','https://ridenrelax.com/','ridenrelax.com',NULL,'+13236749020',NULL,'Rancho Cucamonga','Rancho Cucamonga','CA','US',34.106,-117.575,'10808 Foothill Blvd Ste 383, Rancho Cucamonga, CA 91730',4.9,100,'WEB_RESEARCH USA agent'),
('Legendary Private Car','Legendary Private Car','US','https://legendaryprivatecar.com/','legendaryprivatecar.com','reservations@legendaryprivatecar.com','+18478759797',NULL,'Jefferson Park','Chicago','IL','US',41.97,-87.77,'5843 W Strong St, Chicago, IL 60630',4.9,170,'WEB_RESEARCH USA agent'),
('Oreos Limo','Oreos Limo','US','https://oreoslimo.com/','oreoslimo.com','info@oreoslimo.com','+17738007475',NULL,'Westmont','Westmont','IL','US',41.795,-87.975,'825 N Cass Ave #209, Westmont, IL 60559',5.0,239,'WEB_RESEARCH USA agent'),
('Echo Limousine','Echo Limousine','US','https://echolimousine.com/','echolimousine.com','reservations@echolimousine.com','+17737741074',NULL,'Loop','Chicago','IL','US',41.882,-87.628,'1 N State St Suite 1513, Chicago, IL 60602',4.9,774,'WEB_RESEARCH USA agent'),
('Exclusive Drive','Exclusive Drive Inc','US','https://www.exclusivedriveinc.com/','exclusivedriveinc.com','info@exclusivedriveinc.com','+12247170483',NULL,'Belmont','Chicago','IL','US',41.94,-87.73,'4116 W Belmont Ave, Chicago, IL 60641',5.0,NULL,'WEB_RESEARCH USA agent'),
('Earth Limos Buses','Earth Limos and Buses','US','https://earthlimos.com/','earthlimos.com','team@earthlimos.com','+17257773333',NULL,'Hacienda','Las Vegas','NV','US',36.085,-115.185,'3629 W Hacienda Ave, Las Vegas, NV 89118',4.5,406,'WEB_RESEARCH USA agent'),
('Personal Sedan Services','Personal Sedan Services','US','https://psswestcoast.com/','psswestcoast.com','info@psswestcoast.com','+17022487706',NULL,'Summerlin','Las Vegas','NV','US',36.165,-115.285,'221 N Rampart Blvd, Las Vegas, NV 89145',4.8,80,'WEB_RESEARCH USA agent'),
('EmpireLV','EmpireLV LLC','US','https://empirelasvegas.com/','empirelasvegas.com','reservations@EmpireLasVegas.com','+17026757775',NULL,'Valley View','Las Vegas','NV','US',36.1,-115.19,'4740 South Valley View Blvd, Las Vegas, NV 89103',NULL,NULL,'WEB_RESEARCH USA agent'),
('Driven Global Transportation','Driven Global Transportation','US','https://drivenglobal.us/','drivenglobal.us','info@drivenglobal.us','+17025059397',NULL,'Summerlin','Las Vegas','NV','US',36.145,-115.32,'10845 Griffith Peak Dr Suite 200, Las Vegas, NV 89135',NULL,NULL,'WEB_RESEARCH USA agent'),
('Presidential Limousine Las Vegas','Presidential Limousine','US','https://www.presidentiallimolv.com/','presidentiallimolv.com','reservations@presidentiallimolv.com','+17026886060',NULL,'Industrial Rd','Las Vegas','NV','US',36.15,-115.16,'2000 Industrial Rd, Las Vegas, NV 89102',NULL,NULL,'WEB_RESEARCH USA agent'),
('NEXLIMO','NEXLIMO AB','SE','https://nexlimo.com/','nexlimo.com','info@nexlimo.com','+46764150078','+46764150078','Varby','Stockholm',NULL,'SE',59.265,17.885,'Krongardsvagen 2, 143 46 Varby, Stockholm, Sweden',NULL,NULL,'WEB_RESEARCH EU agent'),
('Mr Charles','Mr Charles','SE','https://www.mrcharles.co/','mrcharles.co','sales@mrcharles.co','+46854000650','+46727500690','Strandbergsgatan','Stockholm',NULL,'SE',59.335,18.02,'Strandbergsgatan 12, 6 tr, 112 51 Stockholm, Sweden',NULL,NULL,'WEB_RESEARCH EU agent'),
('Leading Car Service','Leading Car Service Stockholm AB','SE','https://leadingcar.se/','leadingcar.se','info@leadingcar.se','+46841049030',NULL,'Arlandastad','Stockholm',NULL,'SE',59.615,17.87,'Turbingatan 1A, 195 60 Arlandastad, Sweden',NULL,NULL,'WEB_RESEARCH EU agent'),
('Stockholm Limo Service SLS','Stockholm Limo Service','SE','https://stockholmlimoservice.com/','stockholmlimoservice.com','Offer@stockholmlimoservice.com','+46705327256','+46705327256','Marsta','Marsta',NULL,'SE',59.62,17.855,'Stingvallavagen 24 D LGH 1201, 195 35 Marsta, Sweden',NULL,NULL,'WEB_RESEARCH EU agent'),
('Special-Service.dk','Special-Service.dk','DK','https://special-service.dk/','special-service.dk','special-service@live.com','+4529394352','+4529394352','Kobenhavn S','Copenhagen',NULL,'DK',55.65,12.58,'Vestermarksvej 19A, DK-2300 Kobenhavn S, Denmark',NULL,NULL,'WEB_RESEARCH EU agent'),
('Premium Limousine Service DK','Premium Limousine Service','DK','https://premiumlimousineservice.dk/','premiumlimousineservice.dk','info@premiumlimousineservice.dk','+4531177680','+4531177680','Copenhagen S','Copenhagen',NULL,'DK',55.65,12.59,'Erik Eriksens Gade 12, Copenhagen S, Denmark',NULL,NULL,'WEB_RESEARCH EU agent'),
('Nordic Limousine Copenhagen','Nordic Limousine ApS','DK','https://nordiclimousine.dk/','nordiclimousine.dk','contact@nordiclimousine.dk','+4571991515','+4530202827','Kastrup','Kastrup',NULL,'DK',55.63,12.645,'Kongelundsvej 476, 2770 Kastrup, Denmark',NULL,NULL,'WEB_RESEARCH EU agent'),
('Makhens Limousine Concierge','Makhens Limousine Concierge ApS','DK','https://www.makhens.com/','makhens.com','info@makhens.com','+4542321159','+4542321159','Vanlose','Copenhagen',NULL,'DK',55.685,12.485,'Gronnehoj 19 st tv, DK-2720 Vanlose, Denmark',NULL,NULL,'WEB_RESEARCH EU agent'),
('Nordic Drive','Nordic Drive AS','NO','https://nordicdrive.no/','nordicdrive.no','booking@nordicdrive.no','+4722557233',NULL,'Alfaset','Oslo',NULL,'NO',59.93,10.85,'Ole Deviks vei 38, 0668 Oslo, Norway',NULL,NULL,'WEB_RESEARCH EU agent'),
('Oslo Chauffeur Service','Oslo Chauffeur Service AS','NO','https://chauffeurservice.no/','chauffeurservice.no','info@chauffeurservice.no','+4793449669',NULL,'Lilleaker','Oslo',NULL,'NO',59.92,10.64,'Lilleakerveien 41D, 0381 Oslo, Norway',NULL,NULL,'WEB_RESEARCH EU agent'),
('Oslo Prime','Oslo Prime AS','NO','https://www.osloprime.no/en','osloprime.no','booking@osloprime.no','+4792920544',NULL,'Oslo HQ','Oslo',NULL,'NO',59.93,10.8,'Selma Ellefsens vei 6, 0581 Oslo, Norway',NULL,NULL,'WEB_RESEARCH EU agent'),
('Bislet Limousine','Bislet Limousine AS','NO','https://limousine.no/','limousine.no','bislet@limousine.no','+4722672267',NULL,'Grorud','Oslo',NULL,'NO',59.96,10.88,'Ringnesveien 7, 0978 Oslo, Norway',NULL,NULL,'WEB_RESEARCH EU agent'),
('Athens Elite Transfer','Athens Elite Transfer','GR','https://athenselitetransfer.com/','athenselitetransfer.com','info@athenselitetransfer.com','+302106215490','+306937428030','Dirrachiou','Athens',NULL,'GR',37.99,23.71,'Dirrachiou 72, Athens 10443, Greece',NULL,NULL,'WEB_RESEARCH EU agent'),
('Airport Limos Greece','Airport Limos Greece','GR','https://airportlimos.gr/','airportlimos.gr','reservations@airportlimos.gr','+302117106782',NULL,'Syntagma','Athens',NULL,'GR',37.975,23.735,'Othonos 4, Syntagma Square, 10557 Athens, Greece',NULL,NULL,'WEB_RESEARCH EU agent'),
('Athens Private Cars','Athens Private Cars','GR','https://www.athensprivatecars.com/','athensprivatecars.com','info@athensprivatecars.com','+306944294320','+306944294320','Voula','Athens',NULL,'GR',37.845,23.775,'Kalimnou 48, Voula 16673, Athens, Greece',NULL,NULL,'WEB_RESEARCH EU agent'),
('Exclusive Driver Greece','Exclusive Driver Greece','GR','https://exclusivedriver.gr/','exclusivedriver.gr','info@exclusivedriver.gr','+306982124795','+306982124795','Athens','Athens',NULL,'GR',37.9838,23.7275,'Athens, Attica, Greece',NULL,NULL,'WEB_RESEARCH EU agent'),
('Primus Trans','Primus Trans SRL','RO','https://primustrans.com/','primustrans.com','office@primustrans.com','+40314327289',NULL,'Sector 3','Bucharest',NULL,'RO',44.42,26.14,'Bd. 1 Decembrie 1918 nr. 30, Sector 3, Bucuresti, Romania',4.7,6,'WEB_RESEARCH EU agent'),
('Bucharest by Car','Bucharest by Car','RO','https://bucharestbycar.com/','bucharestbycar.com','office@bucharestbycar.com','+40734299299','+40734299299','Voluntari','Voluntari',NULL,'RO',44.49,26.16,'Emil Garleanu 7A, 077191 Voluntari, Ilfov, Romania',NULL,NULL,'WEB_RESEARCH EU agent'),
('Elegance Taxi Bucuresti','Elegance Car Taxi SRL','RO','https://elegancetaxi.ro/','elegancetaxi.ro','contact@elegancetaxi.ro','+40788553322','+40788553322','Sector 6','Bucharest',NULL,'RO',44.43,26.05,'Str. Valea Calugareasca nr. 9, Sector 6, Bucuresti, Romania',NULL,NULL,'WEB_RESEARCH EU agent'),
('Contesi Chauffeurs','AXALL GROUP SRL','RO','https://contesi-chauffeurs.com/','contesi-chauffeurs.com','office@contesi-chauffeurs.com','+40748460596',NULL,'Cluj','Cluj-Napoca',NULL,'RO',46.7712,23.6236,'Cluj-Napoca, Romania',NULL,NULL,'WEB_RESEARCH EU agent'),
('Pickup Hungary','Pickup Hungary','HU','https://pickuphungary.com/','pickuphungary.com','info@pickuphungary.com','+36707177656','+36707177656','Budapest XII','Budapest',NULL,'HU',47.49,19.02,'1124 Budapest, Kiss Janos altabornagy utca 55-59., Hungary',NULL,NULL,'WEB_RESEARCH EU agent'),
('Black Limousine HU','Black Limousine Kft.','HU','https://blacklimousine.hu/','blacklimousine.hu','info@blacklimousine.hu','+36702181818','+36702181818','Budapest XIV','Budapest',NULL,'HU',47.51,19.1,'1143 Budapest, Stefania ut 81, III. em. 3., Hungary',NULL,NULL,'WEB_RESEARCH EU agent'),
('VanBudapest','Eva Szoke Kuklane E.V.','HU','https://vanbudapest.com/','vanbudapest.com','info@vanbudapest.com','+36707536333','+36707536333','Budapest XIV','Budapest',NULL,'HU',47.505,19.12,'Ond vezer utja 36, 1144 Budapest, Hungary',NULL,NULL,'WEB_RESEARCH EU agent'),
('AirBudapest','ATB Taxi Minibus Limousine Service Kft.','HU','https://airbudapest.com/','airbudapest.com','info@airbudapest.com','+36707035061','+36707035061','Budapest XIV','Budapest',NULL,'HU',47.52,19.12,'1141 Budapest, Komocsy utca 11-13. 3. em. 13., Hungary',NULL,NULL,'WEB_RESEARCH EU agent'),
('ETS Budapest','ETS Budapest','HU','https://www.etsbudapest.hu/','etsbudapest.hu','info@etsbudapest.hu','+36703114115',NULL,'Budapest','Budapest',NULL,'HU',47.4979,19.0402,'Budapest, Hungary',NULL,NULL,'WEB_RESEARCH EU agent'),
('BYZAS','BYZAS','TR','https://byzas.co/en/','byzas.co','info@byzas.co','+905434808877','+905332262326','Besiktas','Istanbul',NULL,'TR',41.045,29.005,'Dikilitas Mahallesi, Damla Sokak No:5, 34349 Besiktas, Istanbul, Turkey',NULL,NULL,'WEB_RESEARCH EU agent'),
('Kings World Transfer','Kings World Transfer','TR','https://kingsworldtransfer.com/','kingsworldtransfer.com','info@kingsworldtransfer.com','+905336631772','+905336631772','Fatih','Istanbul',NULL,'TR',41.01,28.975,'Alemdar Mahallesi, 2. Tahsin Sokak No:4, 34110 Fatih/Istanbul, Turkey',NULL,NULL,'WEB_RESEARCH EU agent'),
('Merry Tourism','Merry Tourism','TR','https://www.merrytourism.com/en/','merrytourism.com','info@merrytourism.com','+905448989812','+905448989812','Sultanahmet','Istanbul',NULL,'TR',41.008,28.978,'Alemdar Mah. Divanyolu Cad. Ogul Han No:62, 34093 Fatih/Istanbul, Turkey',NULL,NULL,'WEB_RESEARCH EU agent'),
('Limousine Plus TR','Limousine Plus','TR','https://limousineplus.com.tr/','limousineplus.com.tr','info@limousineplus.com.tr','+905337702914','+905337702914','Beyoglu','Istanbul',NULL,'TR',41.04,28.97,'Kaptanpasa Mah. Reis Sk. No:33, Piyalepasa, Beyoglu 34440, Istanbul, Turkey',NULL,NULL,'WEB_RESEARCH EU agent')
  ) AS t(display_name, legal_name, country, website_url, website_domain, email, phone, whatsapp, base_label, city, region, country_code, lat, lng, formatted_address, rating, reviews, note)
  LOOP
    IF EXISTS (
      SELECT 1 FROM organizations o WHERE o.archived_at IS NULL AND (
        (r.website_domain IS NOT NULL AND o.website_domain = r.website_domain)
        OR (r.phone IS NOT NULL AND o.primary_phone_e164 = r.phone)
        OR (r.whatsapp IS NOT NULL AND o.primary_whatsapp_e164 = r.whatsapp)
        OR (lower(o.display_name) = lower(r.display_name) AND o.legal_country_code = r.country)
      )
    ) THEN skipped := skipped + 1; CONTINUE; END IF;

    INSERT INTO organizations (
      display_name, legal_name, legal_country_code, legal_city, legal_region,
      website_url, website_domain, primary_email, primary_phone_e164, primary_whatsapp_e164,
      google_rating, google_review_count, google_reviews_checked_at,
      notes_public, is_test, created_by_user_id
    ) VALUES (
      r.display_name, r.legal_name, r.country, r.city, r.region,
      r.website_url, r.website_domain, r.email, r.phone, COALESCE(r.whatsapp, r.phone),
      r.rating, r.reviews, CASE WHEN r.rating IS NOT NULL THEN now() ELSE NULL END,
      r.note, false, v_admin
    ) RETURNING id INTO v_org;

    INSERT INTO organization_capabilities (organization_id, capability) VALUES (v_org, 'SUPPLIER') ON CONFLICT DO NOTHING;
    INSERT INTO partnerships (organization_id, relationship_status, status_changed_at) VALUES (v_org, 'LEAD', now());
    INSERT INTO offerings (organization_id, service_type_id, operational_status) VALUES (v_org, v_gt, 'UNKNOWN');
    INSERT INTO organization_locations (organization_id, label, location_kind, city, region, country_code, lat, lng, formatted_address, is_primary)
    VALUES (v_org, r.base_label, 'OPS_BASE', r.city, r.region, r.country_code, r.lat, r.lng, r.formatted_address, true);
    inserted := inserted + 1;
  END LOOP;
  RAISE NOTICE 'inserted=% skipped=%', inserted, skipped;
END $$;

SELECT count(*) as total_research FROM organizations WHERE notes_public ILIKE '%WEB_RESEARCH%' AND archived_at IS NULL;
SELECT legal_country_code, count(*) FROM organizations WHERE notes_public ILIKE '%WEB_RESEARCH%' AND archived_at IS NULL GROUP BY 1 ORDER BY 2 DESC;
