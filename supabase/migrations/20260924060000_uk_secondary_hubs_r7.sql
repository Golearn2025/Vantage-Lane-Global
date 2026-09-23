-- Coverage R7: UK secondary hubs (Birmingham, Glasgow, Edinburgh, Manchester) thin multi-service → ~5.
-- Skip London. EMAIL required; PHONE when public; WhatsApp optional (never invent from landline).
-- Established firms only; ratings only when verified. notes_public: WEB_RESEARCH UK {City} {SVC} R7

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== BIRMINGHAM HOSPITALITY (1 → ~5) ==========
    ('The Grand Hotel Birmingham','The Grand Hotel Birmingham','GB','https://www.thegrandhotelbirmingham.co.uk/','grandbirmingham.co.uk','hello@grandbirmingham.co.uk','+441218279600',NULL::text,'Church Street','Birmingham','England','GB',52.481,-1.900,'1 Church Street, Birmingham B3 2FE',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham HOSPITALITY R7',v_hosp),
    ('Hotel du Vin Birmingham','Hotel du Vin & Bistro','GB','https://www.hotelduvin.com/locations/birmingham/','hotelduvin.com','info.birmingham@hotelduvin.com','+441217943005',NULL::text,'Church Street','Birmingham','England','GB',52.482,-1.902,'Church Street, Birmingham B3 2NR',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham HOSPITALITY R7',v_hosp),
    ('Cube Hotel Birmingham','The Cube Hotel','GB','https://cubehotel.co.uk/','cubehotel.co.uk','info@cubehotel.co.uk','+441216432010',NULL::text,'Wharfside','Birmingham','England','GB',52.476,-1.908,'200 Wharfside Street, Birmingham B1 1PR',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham HOSPITALITY R7',v_hosp),
    ('Aston Tavern Birmingham','Aston Tavern Ltd','GB','https://www.astontavern.co.uk/','astontavern.co.uk','info@astontavern.co.uk','+441216990095',NULL::text,'Aston','Birmingham','England','GB',52.505,-1.880,'Aston, Birmingham — boutique Victorian hotel',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham HOSPITALITY R7',v_hosp),

    -- ========== BIRMINGHAM MEDICAL (1 → ~5) ==========
    ('Private Medical Clinic Birmingham','Private Medical Clinic','GB','https://www.privatemedicalclinic.com/private-gp/birmingham','privatemedicalclinic.co.uk','hello@privatemedicalclinic.co.uk','+441217980729',NULL::text,'Hagley Road','Birmingham','England','GB',52.475,-1.932,'88 Hagley Road, Birmingham B16 8LU',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham MEDICAL R7',v_med),
    ('Complete Clinical Care Birmingham','Complete Clinical Care','GB','https://www.completeclinicalcare.co.uk/','completeclinicalcare.co.uk','hello@completeclinicalcare.co.uk','+441217510501',NULL::text,'Edgbaston','Birmingham','England','GB',52.468,-1.925,'38 Harborne Road, Edgbaston, Birmingham B15 3EB',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham MEDICAL R7',v_med),
    ('Midland Health Birmingham','Midland Health','GB','https://midlandhealth.co.uk/','midlandhealth.co.uk','hello@midlandhealth.co.uk','+441217690999',NULL::text,'Edgbaston','Birmingham','England','GB',52.472,-1.928,'78-79 Francis Road, Edgbaston, Birmingham B16 8SP',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham MEDICAL R7',v_med),
    ('The Doctors Practice Birmingham','The Doctors Practice','GB','https://thedoctorspractice.co.uk/','thedoctorspractice.co.uk','hello@thedoctorspractice.co.uk','+441216612366','+447388623527','Edgbaston','Birmingham','England','GB',52.470,-1.930,'7 Chad Square, Hawthorne Road, Edgbaston, Birmingham B15 3TQ',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham MEDICAL R7',v_med),

    -- ========== BIRMINGHAM CONCIERGE (2 → ~5) ==========
    ('Lioness Lifestyle Concierge Birmingham','Lioness Lifestyle & Concierge','GB','https://lionesslifestyle.co.uk/','lionesslifestyle.co.uk','natalie.c@lionesslifestyle.co.uk',NULL::text,'+447817206207','West Midlands','Birmingham','England','GB',52.48,-1.90,'West Midlands lifestyle concierge — Birmingham coverage',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham CONCIERGE R7',v_conc),
    ('Busy Life PA Birmingham','Busy Life PA','GB','https://busylifepa.co.uk/','busylifepa.co.uk','stephanie@busylifepa.co.uk','+447956284788','+447956284788','West Midlands','Birmingham','England','GB',52.48,-1.90,'Premium lifestyle PA — West Midlands & UK',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham CONCIERGE R7',v_conc),
    ('BlckBx Concierge Birmingham','BlckBx','GB','https://blckbx.co.uk/','blckbx.co.uk','hello@blckbx.co.uk',NULL::text,NULL::text,'West Midlands','Birmingham','England','GB',52.48,-1.90,'Personal & family lifestyle management — Birmingham coverage',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham CONCIERGE R7',v_conc),

    -- ========== BIRMINGHAM PRIVATE_AVIATION (2 → ~5) ==========
    ('Above Aero Birmingham','Above Aero AOC Ltd','GB','https://www.aboveaero.com/','aboveaero.com','jets@aboveaero.com','+441215078700',NULL::text,'BHX XLR','Birmingham','England','GB',52.454,-1.748,'XLR Executive Jet Centre, Birmingham Airport B26 3QN',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham PRIVATE_AVIATION R7',v_av),
    ('G6 Aviation Birmingham','G6 Aviation','GB','https://www.g6aviation.com/','g6aviation.com','fly@g6aviation.com','+441212915463','+441212915463','St Pauls Square','Birmingham','England','GB',52.485,-1.905,'Grosvenor House, 11 St Pauls Square, Birmingham B3 1RB',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham PRIVATE_AVIATION R7',v_av),
    ('Top Jet Aviation Midlands','Top Jet Aviation','GB','https://topjet.co.uk/','topjet.co.uk','craig@topjet.co.uk',NULL::text,NULL::text,'West Midlands','Birmingham','England','GB',52.48,-1.90,'West Midlands private jet charter broker',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham PRIVATE_AVIATION R7',v_av),

    -- ========== BIRMINGHAM SECURITY (2 → ~5) ==========
    ('Risk Secured Birmingham','Risk Secured','GB','https://www.risksecured.co.uk/close-protection/','risksecured.co.uk','david@risksecured.co.uk','+441217519038',NULL::text,'Willenhall','Birmingham','England','GB',52.585,-2.055,'Willenhall, West Midlands — close protection',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham SECURITY R7',v_sec),
    ('Lionheart Protection Birmingham','Lionheart Protection','GB','https://www.lionheartprotection.co.uk/','lionheartprotection.co.uk','info@lionheartprotection.co.uk','+441217982605',NULL::text,'Hagley Road','Birmingham','England','GB',52.475,-1.925,'Suite 2A, Cobalt Square, 83-85 Hagley Road, Birmingham B16 8QG',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham SECURITY R7',v_sec),
    ('Crown Security UK Birmingham','Crown Security UK','GB','https://www.crownsecurity.uk.com/','crownsecurity.uk.com','info@crownsecurity.uk.com','+448000932383',NULL::text,'Cranford Way','Birmingham','England','GB',52.495,-1.970,'9 Cranford Way, Birmingham B66 2RU',NULL::numeric,NULL::int,'WEB_RESEARCH UK Birmingham SECURITY R7',v_sec),

    -- ========== GLASGOW EVENTS (1 → ~5) ==========
    ('Vision Events Glasgow','Vision Events Glasgow Ltd','GB','https://www.visioneventsglasgow.co.uk/','visioneventsglasgow.co.uk','info@visioneventsglasgow.co.uk','+441413343324',NULL::text,'Port Dundas','Glasgow','Scotland','GB',55.875,-4.260,'100 Borron Street, Port Dundas Business Park, Glasgow G4 9XG',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow EVENTS R7',v_evt),
    ('Crest Events Glasgow','Crest Events Ltd','GB','https://www.crestevents.co.uk/','crestevents.co.uk','hello@crestevents.co.uk','+441412660044',NULL::text,'Levernbridge','Glasgow','Scotland','GB',55.820,-4.350,'Levern Offices, 35 Levernbridge Road, Glasgow G53 7AB',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow EVENTS R7',v_evt),
    ('Panoptic Events Glasgow','Panoptic Events','GB','https://www.panopticevents.com/','panopticevents.com','craig@panopticevents.com',NULL::text,NULL::text,'Glasgow','Glasgow','Scotland','GB',55.86,-4.25,'Glasgow-based events company',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow EVENTS R7',v_evt),
    ('Think Different Events Glasgow','Think Different Events Ltd','GB','https://www.thinkdifferentevents.co.uk/','thinkdifferentevents.co.uk','info@thinkdifferentevents.co.uk','+441412217423',NULL::text,'City centre','Glasgow','Scotland','GB',55.86,-4.26,'Glasgow — corporate event management',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow EVENTS R7',v_evt),

    -- ========== GLASGOW HOSPITALITY (1 → ~5) ==========
    ('Dakota Glasgow','Dakota Hotels','GB','https://dakotahotels.co.uk/glasgow','dakotahotels.co.uk','reservations@gla.dakotahotels.co.uk','+441414043680',NULL::text,'West Regent Street','Glasgow','Scotland','GB',55.863,-4.264,'179 West Regent Street, Glasgow G2 4DP',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow HOSPITALITY R7',v_hosp),
    ('House of Gods Glasgow','House of Gods','GB','https://www.houseofgodshotel.com/glasgow','houseofgodshotel.com','hello@houseofgodshotel.com','+443301744422',NULL::text,'Merchant City','Glasgow','Scotland','GB',55.858,-4.245,'61 Glassford Street, Glasgow G1 1UG',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow HOSPITALITY R7',v_hosp),
    ('Number 10 Hotel Glasgow','Number 10 Hotel','GB','https://www.10hotel.co.uk/','10hotel.co.uk','info@10hotel.co.uk','+441414240160',NULL::text,'Queens Drive','Glasgow','Scotland','GB',55.835,-4.265,'10/16 Queens Drive, Glasgow G42 8BS',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow HOSPITALITY R7',v_hosp),
    ('Apex City of Glasgow Hotel','Apex Hotels','GB','https://www.apexhotels.co.uk/destinations/glasgow/apex-city-of-glasgow-hotel/','apexhotels.co.uk','glasgow.reservations@apexhotels.co.uk','+441413753333',NULL::text,'Bath Street','Glasgow','Scotland','GB',55.864,-4.258,'110 Bath Street, Glasgow G2 2EN',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow HOSPITALITY R7',v_hosp),

    -- ========== GLASGOW SECURITY (1 → ~5) ==========
    ('Norsk Tactical Glasgow','Norsk Tactical Ltd','GB','https://norsktactical.co.uk/','norsktactical.co.uk','enquiries@norsktactical.co.uk','+441414043490',NULL::text,'Glasgow','Glasgow','Scotland','GB',55.86,-4.25,'Glasgow — close protection & specialist security',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow SECURITY R7',v_sec),
    ('Alpha-One Plus Glasgow','Alpha-One Plus Ltd','GB','https://alphaoneplus.com/','alphaoneplus.com','info@alphaoneplus.com','+441414744126','+447425267909','Glasgow','Glasgow','Scotland','GB',55.86,-4.25,'Glasgow — SIA close protection Scotland',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow SECURITY R7',v_sec),
    ('DSD Security Glasgow','DSD (UK) Ltd','GB','https://www.dsdukltd.co.uk/','dsdukltd.co.uk','info@dsdukltd.co.uk',NULL::text,NULL::text,'Cowgate','Glasgow','Scotland','GB',55.94,-4.15,'54 Cowgate, Glasgow — close protection & guarding',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow SECURITY R7',v_sec),
    ('Guld Security Glasgow','Guld Security','GB','https://www.guldsecurity.co.uk/location/glasgow-security-guard-company/','guldsecurity.com','info@guldsecurity.com','+441412802777',NULL::text,'West George Street','Glasgow','Scotland','GB',55.862,-4.253,'2nd Floor, 48 West George Street, Glasgow G2 1BP',NULL::numeric,NULL::int,'WEB_RESEARCH UK Glasgow SECURITY R7',v_sec),

    -- ========== EDINBURGH EVENTS (1 → ~5) ==========
    ('Maximillion Edinburgh','Maximillion','GB','https://www.maximillion.co.uk/','maximillion.co.uk','edinburgh@maximillion.co.uk','+441313330066',NULL::text,'Newbridge','Edinburgh','Scotland','GB',55.935,-3.405,'Unit 2, Newbridge Industrial Estate, Edinburgh EH28 8PJ',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh EVENTS R7',v_evt),
    ('6 Zero Events Edinburgh','6 Zero Events','GB','https://6zeroevents.com/','6zeroevents.com','contact@6zeroevents.com','+441316106060',NULL::text,'South Gyle','Edinburgh','Scotland','GB',55.933,-3.300,'5 South Gyle Crescent Lane, Edinburgh EH12 9EG',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh EVENTS R7',v_evt),
    ('Turnstile Events Edinburgh','Turnstile Events','GB','https://turnstileevents.com/','turnstileevents.com','info@turnstileevents.com','+447889216462','+447889216462','Edinburgh','Edinburgh','Scotland','GB',55.95,-3.19,'Edinburgh & Lothians event management',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh EVENTS R7',v_evt),
    ('Vision Events Edinburgh','Vision Events','GB','https://www.visionevents.co.uk/','visionevents.co.uk','edinburgh@visionevents.co.uk','+441313343324',NULL::text,'Bilston Glen','Edinburgh','Scotland','GB',55.875,-3.140,'16 Dryden Road, Bilston Glen Industrial Estate, Edinburgh EH20 9LZ',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh EVENTS R7',v_evt),

    -- ========== EDINBURGH SECURITY (1 → ~5) ==========
    ('Dion International Edinburgh','Dion International','GB','https://dion-international.com/executive-protection-edinburgh','dion-international.com','operations@dion-international.com','+448000096960',NULL::text,'Albany Street','Edinburgh','Scotland','GB',55.957,-3.190,'Albany Street, Edinburgh EH1 3QB',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh SECURITY R7',v_sec),
    ('Anubis Group Edinburgh','Anubis Group (FM) Ltd','GB','https://www.anubis-security.com/edinburgh/','anubis-security.com','sales@anubis-security.com','+448001216576',NULL::text,'Edinburgh','Edinburgh','Scotland','GB',55.95,-3.19,'Edinburgh — ACS security & close protection',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh SECURITY R7',v_sec),
    ('Vigilant Security Edinburgh','Vigilant Security Services UK Ltd','GB','https://vigilantsecurityservices.co.uk/','vigilantsecurityservices.co.uk','info@vigilantsecurityservices.co.uk','+441315162362',NULL::text,'Livingston','Edinburgh','Scotland','GB',55.890,-3.520,'Fleming House, Kirkton Campus, Livingston EH54 7BN — Edinburgh desk',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh SECURITY R7',v_sec),
    ('Pledge Security Edinburgh','Pledge Security Ltd','GB','https://pledgesecurity.co.uk/','pledgesecurity.co.uk','enquiries@pledgesecurity.co.uk','+448000238985',NULL::text,'Edinburgh','Edinburgh','Scotland','GB',55.953,-3.188,'Edinburgh HQ — manned guarding & events',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh SECURITY R7',v_sec),

    -- ========== EDINBURGH YACHT (1 → ~5) ==========
    ('Edinburgh Marine Academy','Edinburgh Marine Academy','GB','https://www.edinburghmarineacademy.co.uk/','edinburghmarineacademy.co.uk','info@edinburghmarineacademy.co.uk','+447485184571','+447485184571','Port Edgar','Edinburgh','Scotland','GB',55.992,-3.410,'Port Edgar Marina, Shore Road, South Queensferry EH30 9SQ',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh YACHT R7',v_yacht),
    ('Maid of the Forth','Maid of the Forth','GB','https://www.maidoftheforth.co.uk/','maidoftheforth.co.uk','info@maidoftheforth.co.uk','+441313315000',NULL::text,'Hawes Pier','Edinburgh','Scotland','GB',55.990,-3.395,'Unit 2 Hawes Pier, South Queensferry EH30 9TB — private Forth charters',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh YACHT R7',v_yacht),
    ('Port Edgar Marina Edinburgh','Edinburgh Marina / Royal Forth Yacht Club','GB','https://theedinburghmarina.co.uk/','theedinburghmarina.co.uk','eml@royalforth.org','+441315528560',NULL::text,'Granton Harbour','Edinburgh','Scotland','GB',55.980,-3.225,'Middle Pier, Granton Harbour, Edinburgh EH5 1HF',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh YACHT R7',v_yacht),
    ('Port Edgar Sailing Edinburgh Leisure','Edinburgh Leisure — Port Edgar','GB','https://www.edinburghleisure.co.uk/','edinburghleisure.co.uk','mail@edinburghleisure.co.uk','+441313313330',NULL::text,'Port Edgar','Edinburgh','Scotland','GB',55.992,-3.410,'Port Edgar Marina, Shore Road, South Queensferry EH30 9SQ',NULL::numeric,NULL::int,'WEB_RESEARCH UK Edinburgh YACHT R7',v_yacht),

    -- ========== MANCHESTER CONCIERGE (2 → ~5) ==========
    ('UKTogether Concierge Manchester','UKTogether','GB','https://uktogetherevents.com/concierge-hospitality/','uktogetherevents.com','hello@uktogetherevents.com','+441616130911','+447828167883','Didsbury','Manchester','England','GB',53.417,-2.230,'15 Warburton Street, Didsbury, Manchester M20 6WA',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester CONCIERGE R7',v_conc),
    ('Septimus Concierge Manchester','Septimus Group','GB','https://septimusgroups.com/septimus-concierge/','septimusconsulting.com','info@septimusconsulting.com','+447400001070','+447400001070','Peter House','Manchester','England','GB',53.478,-2.245,'Peter House, Oxford Street, Manchester M1 5AN',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester CONCIERGE R7',v_conc),
    ('Velvet Lifestyle Concierge Manchester','Velvet Manchester','GB','https://www.velvetmanchester.com/','velvetmanchester.com','info@velvetmanchester.com','+441612369003',NULL::text,'Canal Street','Manchester','England','GB',53.478,-2.236,'2 Canal Street, Manchester M1 3HE — hospitality lifestyle desk',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester CONCIERGE R7',v_conc),

    -- ========== MANCHESTER EVENTS (1 → ~5) ==========
    ('ConnectIn Events Manchester','ConnectIn Events','GB','https://connectinevents.co.uk/','connectin.co.uk','info@connectin.co.uk','+441618718522',NULL::text,'Trafford Park','Manchester','England','GB',53.465,-2.310,'12 The Schoolhouse, 2nd Avenue, Trafford Park, Manchester M17 1DZ',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester EVENTS R7',v_evt),
    ('TLC Events Manchester','The Taylor Lynn Corporation','GB','https://www.tlc-ltd.co.uk/','tlc-ltd.co.uk','taylor.lynn@tlc-ltd.co.uk','+441618766266',NULL::text,'Manchester','Manchester','England','GB',53.48,-2.24,'Manchester HQ — corporate event organisers',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester EVENTS R7',v_evt),
    ('Kate Park Events Manchester','Kate Park Events','GB','https://kateparkevents.co.uk/','kateparkevents.co.uk','kate@kateparkevents.co.uk','+441619052052',NULL::text,'Manchester','Manchester','England','GB',53.48,-2.24,'Manchester & Cheshire corporate events',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester EVENTS R7',v_evt),
    ('Make Events Manchester','Make Events','GB','https://makeevents.co.uk/','makeevents.co.uk','enquiries@makeevents.co.uk',NULL::text,NULL::text,'Manchester','Manchester','England','GB',53.48,-2.24,'Manchester-based event management agency',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester EVENTS R7',v_evt),

    -- ========== MANCHESTER HOSPITALITY (1 → ~5) ==========
    ('Stock Exchange Hotel Manchester','Stock Exchange Hotel','GB','https://www.stockexchangehotel.co.uk/','stockexchangehotel.co.uk','info@stockexchangehotel.co.uk','+441614703901',NULL::text,'Norfolk Street','Manchester','England','GB',53.481,-2.243,'4 Norfolk Street, Manchester M2 1DW',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester HOSPITALITY R7',v_hosp),
    ('The Rex Hotel Manchester','The Rex Hotel','GB','https://www.rexhotel.co.uk/','rexhotel.co.uk','rex_info@leonardohotels.com','+441614130000',NULL::text,'King Street','Manchester','England','GB',53.480,-2.245,'100 King Street, Manchester M2 4WU',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester HOSPITALITY R7',v_hosp),
    ('Great John Street Hotel Manchester','Great John Street Hotel','GB','https://www.greatjohnstreethotel.co.uk/','greatjohnstreet.co.uk','info@greatjohnstreet.co.uk','+441618313211',NULL::text,'Great John Street','Manchester','England','GB',53.478,-2.255,'Great John Street, Manchester M3 4FD',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester HOSPITALITY R7',v_hosp),
    ('King Street Townhouse Manchester','King Street Townhouse','GB','https://www.kingstreettownhouse.co.uk/','kingstreettownhouse.co.uk','reservations@kingstreettownhouse.co.uk','+441616670707',NULL::text,'Booth Street','Manchester','England','GB',53.481,-2.243,'10 Booth Street, Manchester M2 4AW',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester HOSPITALITY R7',v_hosp),

    -- ========== MANCHESTER MEDICAL (1 → ~5) ==========
    ('Didsbury Medical Clinic','Didsbury Medical Clinic','GB','https://dmclinic.co.uk/','dmclinic.co.uk','info@dmclinic.co.uk','+441617104432',NULL::text,'Didsbury','Manchester','England','GB',53.417,-2.230,'Adamson House, Towers Business Park, Didsbury, Manchester M20 2YY',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester MEDICAL R7',v_med),
    ('Ultima Vitality Manchester','Ultima Vitality','GB','https://ultimavitality.co.uk/','ultimavitality.co.uk','info@ultimavitality.co.uk','+441614347373',NULL::text,'Didsbury','Manchester','England','GB',53.418,-2.231,'718A Wilmslow Road, Didsbury, Manchester M20 2DW',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester MEDICAL R7',v_med),
    ('The Private GP Manchester','The Private GP','GB','https://www.theprivategp.uk/','theprivategp.uk','info@theprivategp.uk',NULL::text,NULL::text,'South Manchester','Manchester','England','GB',53.40,-2.25,'South Manchester private GP service',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester MEDICAL R7',v_med),
    ('Summerhill Health Manchester','Summerhill Health','GB','https://www.summerhillhealth.co.uk/','summerhillhealth.co.uk','contact@summerhillhealth.co.uk','+441615522382',NULL::text,'Hale','Manchester','England','GB',53.377,-2.348,'Broomfield Lane, Hale WA15 9AQ — Greater Manchester',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester MEDICAL R7',v_med),

    -- ========== MANCHESTER PRIVATE_AVIATION (2 → ~5) ==========
    ('Falcona Private Jets Manchester','Falcona Private Jets Ltd','GB','https://falconaprivatejets.com/','falconaprivatejets.com','charter@falconaprivatejets.com','+443300271278',NULL::text,'MAN Signature','Manchester','England','GB',53.354,-2.275,'Hangar 7, Fairey’s Way, Manchester Airport M90 5NE',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester PRIVATE_AVIATION R7',v_av),
    ('Signature Aviation Manchester','Signature Aviation','GB','https://www.signatureaviation.com/locations/MAN',NULL,'man@signatureaviation.com','+443300271258',NULL::text,'Hangar 7','Manchester','England','GB',53.354,-2.275,'Business Aviation Centre, Faireys Way, Hangar 7, Manchester M90 5NE',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester PRIVATE_AVIATION R7',v_av),
    ('Premiere Executive Handling Manchester','Premiere Executive Handling','GB','https://www.premexec.com/','premexec.com','opsman@premexec.com','+447852457285','+447852457285','Manchester Airport','Manchester','England','GB',53.354,-2.275,'Manchester Airport — premier executive handling',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester PRIVATE_AVIATION R7',v_av),

    -- ========== MANCHESTER SECURITY (3 → ~5) ==========
    ('Saxon Risk Management Manchester','Saxon Risk Management Ltd','GB','https://www.saxonriskmanagement.co.uk/','saxonriskmanagement.co.uk','office@saxonriskmanagement.co.uk','+447752162307','+447752162307','Manchester','Manchester','England','GB',53.48,-2.24,'Manchester close protection',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester SECURITY R7',v_sec),
    ('VIS Protection Manchester','VIS Protection Ltd','GB','https://www.visprotection.com/private-security-manchester','visprotection.com','admin@visprotection.com',NULL::text,NULL::text,'Manchester','Manchester','England','GB',53.48,-2.24,'Manchester VIP & private security',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester SECURITY R7',v_sec),

    -- ========== MANCHESTER YACHT (1 → ~5) ==========
    ('Jacamar Yacht Manchester','Jacamar Yacht','GB','https://www.jacamaryacht.com/','jacamaryacht.com','paul@jacamaryacht.com','+447956922257','+447956922257','Salford Quays','Manchester','England','GB',53.470,-2.295,'Clippers Quay, Salford Quays, Manchester M50 3XP',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester YACHT R7',v_yacht),
    ('City Centre Cruises Manchester','City Centre Cruises Ltd','GB','https://www.citycentrecruises.co.uk/','citycentrecruises.co.uk','boat@citycentrecruises.co.uk','+441619020222',NULL::text,'Castlefield','Manchester','England','GB',53.476,-2.255,'Castlefield / Liverpool Road, Manchester M3 4JR — private canal & ship canal charter',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester YACHT R7',v_yacht),
    ('Liverpool Boat Charter NW','Liverpool Boat Charter','GB','https://liverpoolboatcharter.com/','liverpoolboatcharter.com','peter@liverpoolboatcharter.com','+447540373838','+447540373838','North West hub','Manchester','England','GB',53.48,-2.24,'Liverpool Marina — NW yacht charter covering Greater Manchester clients',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester YACHT R7',v_yacht),
    ('Pina Yacht Charter NW','Pina Yacht Charter','GB','https://pinayachtcharter.com/','pinayachtcharter.com','info@pinayachtcharter.com','+441513178699',NULL::text,'North West hub','Manchester','England','GB',53.48,-2.24,'Liverpool-based luxury yacht charter — North West coverage',NULL::numeric,NULL::int,'WEB_RESEARCH UK Manchester YACHT R7',v_yacht)
  ) AS t(
    display_name, legal_name, country, website_url, website_domain, email, phone, whatsapp,
    base_label, city, region, country_code, lat, lng, formatted_address, rating, reviews, note, service_type_id
  )
  LOOP
    IF EXISTS (
      SELECT 1 FROM organizations o WHERE o.archived_at IS NULL AND (
        (r.website_domain IS NOT NULL AND o.website_domain = r.website_domain)
        OR (r.phone IS NOT NULL AND o.primary_phone_e164 = r.phone)
        OR (r.whatsapp IS NOT NULL AND o.primary_whatsapp_e164 = r.whatsapp)
        OR (r.email IS NOT NULL AND o.primary_email = r.email)
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
      r.website_url, r.website_domain, r.email, r.phone, r.whatsapp,
      r.rating, r.reviews, CASE WHEN r.rating IS NOT NULL THEN now() ELSE NULL END,
      r.note, false, v_admin
    ) RETURNING id INTO v_org;

    INSERT INTO organization_capabilities (organization_id, capability) VALUES (v_org, 'SUPPLIER') ON CONFLICT DO NOTHING;
    INSERT INTO partnerships (organization_id, relationship_status, status_changed_at) VALUES (v_org, 'LEAD', now());
    INSERT INTO offerings (organization_id, service_type_id, operational_status) VALUES (v_org, r.service_type_id, 'UNKNOWN');
    INSERT INTO organization_locations (
      organization_id, label, location_kind, city, region, country_code, lat, lng, formatted_address, is_primary
    ) VALUES (v_org, r.base_label, 'OPS_BASE', r.city, r.region, r.country_code, r.lat, r.lng, r.formatted_address, true);
    inserted := inserted + 1;
  END LOOP;
  RAISE NOTICE 'UK secondary hubs R7: inserted=% skipped=%', inserted, skipped;
END $$;
