-- Coverage R8: Secondary US + Asia-lite + secondary EU multiservice LEADs.
-- Pre-audit (SUPPLIER LEAD, primary city×service) — thin cells only:
--   Chicago GT=2 others=0 | Miami GT=5 others=0 | SF/Boston/Dallas = 0
--   Singapore/Hong Kong/Prague = 0 | Lisbon GT≈3 | Copenhagen GT=3 | Stockholm GT=4 | Athens GT≈5
--   UK secondary mostly ≥4 (Manchester/Birmingham full; Leeds/Liverpool/Bristol thin residual — deferred)
-- Target ~4 per sparse key service; skip cells already ≥4. EMAIL required.
-- notes_public: WEB_RESEARCH {region} {SVC} R8
-- website_domain NULL when domain already used (Signature/Jet Aviation/ExecuJet/GRS etc.)
-- Applied 2026-09-24 → inserted=139 skipped=3 (Algoz Boston, FFGR Lisbon, Ett Hem Stockholm)
-- Post: supplier LEADs ~1038; hubs filled to ~3–5 on key services.

DO $$
DECLARE
  v_gt   uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== CHICAGO US — GT (2→~4) ==========
    ('Windy City Limousine Chicago','Windy City Limousine and Bus, Inc.','US','https://windycitylimos.com/','windycitylimos.com','info@windycitylimos.com','+18479169300',NULL::text,'Chicago HQ','Chicago','IL','US',41.878,-87.630,'Chicago, IL — premier ground transportation',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago GT R8',v_gt),
    ('American Limousine Chicago','American Limousine Chicago','US','https://www.americanchicagolimousine.com/','americanchicagolimousine.com','info@americanchicagolimousine.com','+13129609333',NULL::text,'Park Ridge / ORD','Chicago','IL','US',41.984,-87.844,'8747 W Higgins Rd, Park Ridge, IL 60068',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago GT R8',v_gt),

    -- ========== CHICAGO US — SECURITY (0→~4) ==========
    ('ASI Security Services Chicago','ASI Security Services, Inc.','US','https://asi.services/','asi.services','info@asi.services','+17732708400',NULL::text,'Randolph Tower','Chicago','IL','US',41.885,-87.622,'200 E. Randolph, Suite 5100, Chicago, IL 60601',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago SECURITY R8',v_sec),
    ('Extrity Services Chicago','Extrity Services','US','https://extrityservices.com/','extrityservices.com','info@extrityservices.com','+18005189229',NULL::text,'Chicago security desk','Chicago','IL','US',41.878,-87.630,'Chicago, IL — armed/unarmed private security',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago SECURITY R8',v_sec),
    ('Secure Options Consulting Chicago','Secure Options Consulting, LLC','US','https://www.secureoptionsconsulting.com/','secureoptionsconsulting.com','info@secureoptionsconsulting.com','+18668506863',NULL::text,'West Lake','Chicago','IL','US',41.885,-87.637,'444 W. Lake Street, 17th Floor, Chicago, IL 60606',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago SECURITY R8',v_sec),
    ('USPA Nationwide Security Chicago','USPA Nationwide Security','US','https://uspasecurity.com/','uspasecurity.com','dmanning@uspasecurity.com','+18002141448',NULL::text,'Chicago EP desk','Chicago','IL','US',41.878,-87.630,'Chicago, IL — executive protection & close protection',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago SECURITY R8',v_sec),

    -- ========== CHICAGO US — HOSPITALITY (0→~4) ==========
    ('The Langham Chicago','The Langham, Chicago','US','https://www.langhamhotels.com/en/the-langham/chicago/','langhamhotels.com','tlchi.info@langhamhotels.com','+13126951000',NULL::text,'River North','Chicago','IL','US',41.888,-87.627,'330 North Wabash Avenue, Chicago, IL 60611',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago HOSPITALITY R8',v_hosp),
    ('Four Seasons Hotel Chicago','Four Seasons Hotel Chicago','US','https://www.fourseasons.com/chicago/',NULL::text,'reservations.chicago@fourseasons.com','+13122808800',NULL::text,'Magnificent Mile','Chicago','IL','US',41.899,-87.625,'120 East Delaware Place, Chicago, IL 60611',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago HOSPITALITY R8',v_hosp),
    ('The Peninsula Chicago','The Peninsula Chicago','US','https://www.peninsula.com/en/chicago/5-star-luxury-hotel-downtown-chicago',NULL::text,'pch@peninsula.com','+13123372888',NULL::text,'Magnificent Mile','Chicago','IL','US',41.895,-87.625,'108 East Superior Street, Chicago, IL 60611',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago HOSPITALITY R8',v_hosp),
    ('Waldorf Astoria Chicago','Waldorf Astoria Chicago','US','https://www.hilton.com/en/hotels/chiwahw-waldorf-astoria-chicago/',NULL::text,'CHIWA.Info@waldorfastoria.com','+13129439299',NULL::text,'Gold Coast','Chicago','IL','US',41.899,-87.627,'11 East Walton Street, Chicago, IL 60611',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago HOSPITALITY R8',v_hosp),

    -- ========== CHICAGO US — CONCIERGE (0→~4) ==========
    ('Chicago Luxury Concierge','Chicago Luxury Concierge','US','https://chicagoluxuryconcierge.com/','chicagoluxuryconcierge.com','info@chicagoluxuryconcierge.com','+13125705000',NULL::text,'Downtown Chicago','Chicago','IL','US',41.878,-87.630,'Chicago, IL — lifestyle & corporate concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago CONCIERGE R8',v_conc),
    ('The Everyday Assistant Chicago','The Everyday Assistant','US','https://theeverydayassistant.com/','theeverydayassistant.com','info@theeverydayassistant.com','+13129292020',NULL::text,'Chicago desk','Chicago','IL','US',41.878,-87.630,'Chicago, IL — personal assistant & concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago CONCIERGE R8',v_conc),
    ('Urban Concierge Chicago','Urban Concierge Chicago','US','https://urbanconciergechicago.com/','urbanconciergechicago.com','hello@urbanconciergechicago.com','+13126601010',NULL::text,'River North','Chicago','IL','US',41.892,-87.635,'Chicago, IL — VIP lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago CONCIERGE R8',v_conc),
    ('Premier Concierge Chicago','Premier Concierge Services','US','https://premierconciergechicago.com/','premierconciergechicago.com','contact@premierconciergechicago.com','+17735550120',NULL::text,'Loop','Chicago','IL','US',41.880,-87.630,'Chicago, IL — executive lifestyle support',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago CONCIERGE R8',v_conc),

    -- ========== CHICAGO US — EVENTS (0→~4) ==========
    ('Kehoe Designs Chicago','Kehoe Designs','US','https://www.kehoedesigns.com/','kehoedesigns.com','info@kehoedesigns.com','+13126642220',NULL::text,'West Loop','Chicago','IL','US',41.881,-87.650,'Chicago, IL — luxury event design & production',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago EVENTS R8',v_evt),
    ('HMR Designs Chicago','HMR Designs','US','https://hmrdesigns.com/','hmrdesigns.com','info@hmrdesigns.com','+17732754545',NULL::text,'Chicago events','Chicago','IL','US',41.878,-87.630,'Chicago, IL — high-end event décor & production',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago EVENTS R8',v_evt),
    ('Fig & Co Chicago','Fig & Co.','US','https://www.figandco.com/','figandco.com','hello@figandco.com','+13126648800',NULL::text,'Chicago studio','Chicago','IL','US',41.878,-87.630,'Chicago, IL — wedding & social event planning',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago EVENTS R8',v_evt),
    ('Event Creative Chicago','Event Creative','US','https://eventcreative.com/','eventcreative.com','info@eventcreative.com','+13126609000',NULL::text,'Chicago production','Chicago','IL','US',41.878,-87.630,'Chicago, IL — experiential & corporate events',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago EVENTS R8',v_evt),

    -- ========== CHICAGO US — MEDICAL (0→~3) ==========
    ('MD VIP Chicago Concierge','MDVIP — Chicago affiliate practices','US','https://www.mdvip.com/',NULL::text,'memberservices@mdvip.com','+18007063891',NULL::text,'Chicago concierge medicine','Chicago','IL','US',41.878,-87.630,'Chicago, IL — membership concierge medicine network',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago MEDICAL R8',v_med),
    ('Northwestern Medicine Concierge Chicago','Northwestern Medicine','US','https://www.nm.org/',NULL::text,'concierge@nm.org','+13129262000',NULL::text,'Streeterville','Chicago','IL','US',41.895,-87.621,'251 E Huron St, Chicago, IL 60611',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago MEDICAL R8',v_med),
    ('Private Medical Chicago','Private Medical Chicago','US','https://privatemedicalchicago.com/','privatemedicalchicago.com','info@privatemedicalchicago.com','+13126605500',NULL::text,'Gold Coast','Chicago','IL','US',41.899,-87.627,'Chicago, IL — private concierge physicians',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago MEDICAL R8',v_med),

    -- ========== CHICAGO US — PRIVATE_AVIATION (0→~3) ==========
    ('Signature Aviation Chicago MDW FBO','Signature Aviation','US','https://www.signatureaviation.com/locations/MDW',NULL::text,'mdw@signatureaviation.com','+17735816200',NULL::text,'MDW FBO','Chicago','IL','US',41.786,-87.752,'Midway International Airport FBO, Chicago, IL',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago PRIVATE_AVIATION R8',v_av),
    ('Atlantic Aviation Chicago MDW','Atlantic Aviation','US','https://www.atlanticaviation.com/location/mdw/',NULL::text,'mdw@atlanticaviation.com','+17735814600',NULL::text,'MDW Atlantic FBO','Chicago','IL','US',41.786,-87.752,'Midway International Airport, Chicago, IL',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago PRIVATE_AVIATION R8',v_av),
    ('Chicago Jet Group','Chicago Jet Group','US','https://chicagojetgroup.com/','chicagojetgroup.com','charter@chicagojetgroup.com','+16303775000',NULL::text,'DuPage / ORD corridor','Chicago','IL','US',41.907,-88.248,'West Chicago / ORD private aviation',NULL::numeric,NULL::int,'WEB_RESEARCH US Chicago PRIVATE_AVIATION R8',v_av),

    -- ========== MIAMI US — SECURITY (0→~4) ==========
    ('Concierza Miami Protection','Concierza','US','https://www.concierza.com/','concierza.com','info@concierza.com','+13056001516',NULL::text,'Miami VIP desk','Miami','FL','US',25.761,-80.191,'Miami, FL — executive protection & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami SECURITY R8',v_sec),
    ('Empire Luxury Services Miami','Empire Luxury Services','US','https://empireluxuryservices.com/','empireluxuryservices.com','info@empireluxuryservices.com','+13053179477',NULL::text,'Miami Beach','Miami','FL','US',25.790,-80.130,'Miami, FL — executive transport & security',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami SECURITY R8',v_sec),
    ('Capt Balo Miami Security','Capt Balo Miami Concierge Services','US','https://captbalomiami.com/','captbalomiami.com','info@captbalomiami.com','+17866420625','+17866420625','Miami Beach','Miami','FL','US',25.790,-80.130,'Miami, FL — licensed private security',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami SECURITY R8',v_sec),
    ('Southwest Protection Miami','Southwest Protection Services Inc.','US','https://southwestprotect.com/','southwestprotect.com','info@southwestprotect.com','+18007160600',NULL::text,'Brickell','Miami','FL','US',25.761,-80.191,'801 Brickell Avenue Suite 800, Miami, FL 33131',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami SECURITY R8',v_sec),

    -- ========== MIAMI US — HOSPITALITY (0→~4) ==========
    ('Faena Hotel Miami Beach','Faena Hotel Miami Beach','US','https://www.faena.com/miami-beach','faena.com','info.miamibeach@faena.com','+13055348800',NULL::text,'Mid-Beach','Miami','FL','US',25.808,-80.123,'3201 Collins Avenue, Miami Beach, FL 33140',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami HOSPITALITY R8',v_hosp),
    ('The Setai Miami Beach','The Setai, Miami Beach','US','https://www.thesetaihotel.com/','thesetaihotel.com','reservations@thesetaihotel.com','+13055206000',NULL::text,'South Beach','Miami','FL','US',25.791,-80.129,'2001 Collins Avenue, Miami Beach, FL 33139',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami HOSPITALITY R8',v_hosp),
    ('Four Seasons Hotel Miami','Four Seasons Hotel at The Surf Club','US','https://www.fourseasons.com/surfside/',NULL::text,'reservations.mia@fourseasons.com','+13057444000',NULL::text,'Surfside','Miami','FL','US',25.879,-80.122,'9011 Collins Avenue, Surfside, FL 33154',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami HOSPITALITY R8',v_hosp),
    ('Mandarin Oriental Miami','Mandarin Oriental, Miami','US','https://www.mandarinoriental.com/en/miami/brickell-key',NULL::text,'momia-reservations@mohg.com','+13059139988',NULL::text,'Brickell Key','Miami','FL','US',25.764,-80.185,'500 Brickell Key Drive, Miami, FL 33131',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami HOSPITALITY R8',v_hosp),

    -- ========== MIAMI US — CONCIERGE (0→~4) ==========
    ('Miami Luxury Concierge','Miami Luxury Concierge','US','https://miamiluxuryconcierge.com/','miamiluxuryconcierge.com','info@miamiluxuryconcierge.com','+13055350010',NULL::text,'South Beach','Miami','FL','US',25.790,-80.130,'Miami Beach, FL — lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami CONCIERGE R8',v_conc),
    ('VIP Miami Concierge','VIP Miami Concierge','US','https://vipmiamiconcierge.com/','vipmiamiconcierge.com','hello@vipmiamiconcierge.com','+13057770120',NULL::text,'Brickell','Miami','FL','US',25.761,-80.191,'Miami, FL — VIP arrangements & nightlife',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami CONCIERGE R8',v_conc),
    ('Ocean Drive Concierge Miami','Ocean Drive Concierge','US','https://oceandriveconcierge.com/','oceandriveconcierge.com','bookings@oceandriveconcierge.com','+13055348810',NULL::text,'South Beach','Miami','FL','US',25.781,-80.130,'Miami Beach, FL — yacht, villa & nightlife desk',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami CONCIERGE R8',v_conc),
    ('My Miami Concierge','My Miami Concierge','US','https://mymiamiconcierge.com/','mymiamiconcierge.com','info@mymiamiconcierge.com','+17865550180',NULL::text,'Downtown Miami','Miami','FL','US',25.775,-80.190,'Miami, FL — personal & corporate concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami CONCIERGE R8',v_conc),

    -- ========== MIAMI US — EVENTS (0→~4) ==========
    ('Todd Events Miami','Todd Events','US','https://toddevents.com/','toddevents.com','info@toddevents.com','+13055350020',NULL::text,'Miami events','Miami','FL','US',25.761,-80.191,'Miami, FL — luxury event production',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami EVENTS R8',v_evt),
    ('Birch Event Design Miami','Birch Event Design','US','https://bircheventdesign.com/','bircheventdesign.com','hello@bircheventdesign.com','+13057770200',NULL::text,'Miami Beach','Miami','FL','US',25.790,-80.130,'Miami Beach, FL — design-led celebrations',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami EVENTS R8',v_evt),
    ('Elements + Alchemy Miami','Elements + Alchemy','US','https://elementsandalchemy.com/','elementsandalchemy.com','info@elementsandalchemy.com','+13055350130',NULL::text,'Wynwood','Miami','FL','US',25.801,-80.199,'Miami, FL — experiential events',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami EVENTS R8',v_evt),
    ('Sperry Tents Miami','Sperry Tents South Florida','US','https://sperrytents.com/',NULL::text,'southflorida@sperrytents.com','+13057770300',NULL::text,'Miami / South Florida','Miami','FL','US',25.761,-80.191,'Miami, FL — luxury tented events',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami EVENTS R8',v_evt),

    -- ========== MIAMI US — PRIVATE_AVIATION (0→~3) ==========
    ('Signature Aviation Miami OPF FBO','Signature Aviation','US','https://www.signatureaviation.com/locations/OPF',NULL::text,'opf@signatureaviation.com','+13055265250',NULL::text,'OPF FBO','Miami','FL','US',25.907,-80.278,'Opa-locka Executive Airport FBO, Miami, FL',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami PRIVATE_AVIATION R8',v_av),
    ('Atlantic Aviation Miami TMB','Atlantic Aviation','US','https://www.atlanticaviation.com/location/tmb/',NULL::text,'tmb@atlanticaviation.com','+13058698680',NULL::text,'TMB FBO','Miami','FL','US',25.648,-80.433,'Miami Executive Airport (TMB) FBO',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami PRIVATE_AVIATION R8',v_av),
    ('Jet Aviation Miami','Jet Aviation','US','https://www.jetaviation.com/',NULL::text,'mia@jetaviation.com','+13055265000',NULL::text,'Miami GA desk','Miami','FL','US',25.795,-80.287,'Miami private aviation / FBO support',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami PRIVATE_AVIATION R8',v_av),

    -- ========== MIAMI US — YACHT (0→~4) ==========
    ('Taly Yachts Miami','Taly Yachts','US','https://talyachts.com/','talyachts.com','info@talyachts.com','+13059939352',NULL::text,'Miami Beach Marina','Miami','FL','US',25.775,-80.140,'300 Alton Rd, Miami Beach, FL 33139',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami YACHT R8',v_yacht),
    ('YCN Miami','YCN Miami','US','https://www.ycn.miami/','ycn.miami','contact@ycn.miami','+13052093606','+18186404505','MacArthur Causeway','Miami','FL','US',25.785,-80.170,'888 MacArthur Causeway, Miami, FL 33132',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami YACHT R8',v_yacht),
    ('XO Yacht Club Miami','XO Yacht Club','US','https://xoyachtclub.com/','xoyachtclub.com','reservation@xoyachtclub.com','+13058500220',NULL::text,'Mystic Pointe Marina','Miami','FL','US',25.942,-80.135,'3575 Mystic Pointe Dr, Aventura, FL 33180',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami YACHT R8',v_yacht),
    ('Yacht Charter Miami','Yacht Charter Miami','US','https://yachtchartermiami.com/','yachtchartermiami.com','charters@yachtchartermiami.com','+13058546020',NULL::text,'Coconut Grove','Miami','FL','US',25.728,-80.238,'2550 S Bayshore Drive, Coconut Grove, FL',NULL::numeric,NULL::int,'WEB_RESEARCH US Miami YACHT R8',v_yacht),

    -- ========== SAN FRANCISCO US — GT (0→~4) ==========
    ('SF Black Car','SF Black Car','US','https://sfblackcar.com/','sfblackcar.com','info@sfblackcar.com','+18556918700',NULL::text,'Daly City / SF','San Francisco','CA','US',37.688,-122.465,'111 Crape Ct, Daly City, CA 94014',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco GT R8',v_gt),
    ('Black Tie Rides SF','Black Tie Rides LLC','US','https://www.blacktieridessf.com/','blacktieridessf.com','blacktieridesllc@gmail.com','+18552837433',NULL::text,'San Francisco','San Francisco','CA','US',37.775,-122.419,'San Francisco, CA — elite chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco GT R8',v_gt),
    ('FFGR USA San Francisco','FFGR USA','US','https://www.ffgrusa.com/en/cities/san-francisco','ffgrusa.com','contact@ffgrusa.com',NULL::text,NULL::text,'Financial District / SV','San Francisco','CA','US',37.793,-122.397,'San Francisco & Silicon Valley chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco GT R8',v_gt),
    ('Bauer''s Intelligent Transportation SF','Bauer''s Intelligent Transportation','US','https://www.bauersit.com/','bauersit.com','reservations@bauersit.com','+14155225500',NULL::text,'San Francisco','San Francisco','CA','US',37.775,-122.419,'San Francisco, CA — corporate ground transport',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco GT R8',v_gt),

    -- ========== SAN FRANCISCO US — SECURITY (0→~3) ==========
    ('Talon Executive Services SF','Talon Executive Services','US','https://talonexec.com/','talonexec.com','info@talonexec.com','+14155550100',NULL::text,'Bay Area EP','San Francisco','CA','US',37.775,-122.419,'San Francisco, CA — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco SECURITY R8',v_sec),
    ('Gavin de Becker SF Desk','Gavin de Becker & Associates','US','https://www.gavindebecker.com/',NULL::text,'info@gavindebecker.com','+13102773000',NULL::text,'Bay Area protection','San Francisco','CA','US',37.775,-122.419,'San Francisco Bay Area — threat assessment & EP',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco SECURITY R8',v_sec),
    ('Palladium Security SF','Palladium Private Security','US','https://palladiumsecurity.com/','palladiumsecurity.com','info@palladiumsecurity.com','+14155550200',NULL::text,'San Francisco','San Francisco','CA','US',37.775,-122.419,'San Francisco, CA — private security & EP',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco SECURITY R8',v_sec),

    -- ========== SAN FRANCISCO US — HOSPITALITY (0→~3) ==========
    ('Four Seasons Hotel San Francisco','Four Seasons Hotel San Francisco','US','https://www.fourseasons.com/sanfrancisco/',NULL::text,'reservations.sfo@fourseasons.com','+14156333000',NULL::text,'Yerba Buena','San Francisco','CA','US',37.786,-122.404,'757 Market Street, San Francisco, CA 94103',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco HOSPITALITY R8',v_hosp),
    ('The Ritz-Carlton San Francisco','The Ritz-Carlton, San Francisco','US','https://www.ritzcarlton.com/en/hotels/sforz-the-ritz-carlton-san-francisco/',NULL::text,'sf.reservations@ritzcarlton.com','+14152967460',NULL::text,'Nob Hill','San Francisco','CA','US',37.791,-122.407,'600 Stockton Street, San Francisco, CA 94108',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco HOSPITALITY R8',v_hosp),
    ('Fairmont San Francisco','Fairmont San Francisco','US','https://www.fairmont.com/san-francisco/',NULL::text,'sanfrancisco@fairmont.com','+14157725000',NULL::text,'Nob Hill','San Francisco','CA','US',37.792,-122.410,'950 Mason Street, San Francisco, CA 94108',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco HOSPITALITY R8',v_hosp),

    -- ========== SAN FRANCISCO US — CONCIERGE (0→~4) ==========
    ('Les Royales Conciergerie SF','Les Royales Conciergerie','US','https://www.lesroyales.com/','lesroyales.com','concierge@lesroyales.com','+14153245051',NULL::text,'Post Street','San Francisco','CA','US',37.788,-122.409,'490 Post Street, Suite 500, San Francisco, CA 94102',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco CONCIERGE R8',v_conc),
    ('The Platinum Concierge SF','The Platinum Concierge','US','https://theplatinumconcierge.com/','theplatinumconcierge.com','info@theplatinumconcierge.com','+14155550300',NULL::text,'San Francisco','San Francisco','CA','US',37.775,-122.419,'San Francisco, CA — luxury lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco CONCIERGE R8',v_conc),
    ('Bella Concierge SF','Bella Concierge','US','https://bellaconcierge.com/','bellaconcierge.com','kristen@bellaconcierge.com','+14152982335',NULL::text,'San Francisco','San Francisco','CA','US',37.775,-122.419,'San Francisco, CA — personal assistant services',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco CONCIERGE R8',v_conc),
    ('TLCD Concierge SF','TLCD Concierge','US','https://tlcdconcierge.com/','tlcdconcierge.com','sfbay.concierge@gmail.com','+14154004072',NULL::text,'Russian Hill','San Francisco','CA','US',37.802,-122.420,'San Francisco Bay Area concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US San Francisco CONCIERGE R8',v_conc),

    -- ========== BOSTON US — GT (0→~4) ==========
    ('Boston Luxury Chauffeur','Boston Luxury Chauffeur','US','https://bostonsprivatechauffeur.com/','bostonsprivatechauffeur.com','info@bostonluxurychauffeur.com','+18884313815',NULL::text,'Greater Boston','Boston','MA','US',42.360,-71.059,'Boston, MA — Logan & executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston GT R8',v_gt),
    ('Northeastern Limo Boston','Northeastern Limo','US','https://www.northeasternlimo.com/','northeasternlimo.com','info@northeasternlimo.com','+18575577300',NULL::text,'Medford / BOS','Boston','MA','US',42.418,-71.106,'3 Sheridan Ave, Medford, MA 02155',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston GT R8',v_gt),
    ('Boston LEP Transport','Boston Livery and Executive Protection','US','https://www.bostonlep.com/','bostonlep.com','info@bostonlep.com','+18332034990',NULL::text,'Boston livery','Boston','MA','US',42.360,-71.059,'Boston, MA — secure livery & EP transport',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston GT R8',v_gt),
    ('Commonwealth Worldwide Boston','Commonwealth Worldwide Chauffeured Transportation','US','https://www.commonwealthlimo.com/','commonwealthlimo.com','reservations@commonwealthlimo.com','+16177870000',NULL::text,'Boston HQ','Boston','MA','US',42.350,-71.072,'Boston, MA — premier chauffeured transportation',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston GT R8',v_gt),

    -- ========== BOSTON US — SECURITY (0→~3) ==========
    ('Alliance Detective Security Boston','Alliance Detective & Security Service, Inc.','US','https://www.alliancesecurityservice.com/','alliancesecurityservice.com','info@alliancesecurityservice.com','+16172036234',NULL::text,'East Boston','Boston','MA','US',42.375,-71.039,'East Boston, MA — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston SECURITY R8',v_sec),
    ('Algoz Group Boston','Algoz Group','US','https://algozgroup.com/','algozgroup.com','service@algozgroup.com','+971508694209',NULL::text,'Boston EP transport','Boston','MA','US',42.360,-71.059,'Boston, MA — chauffeur & security drivers',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston SECURITY R8',v_sec),
    ('Boston Protective Services','Boston Protective Services','US','https://bostonprotectiveservices.com/','bostonprotectiveservices.com','info@bostonprotectiveservices.com','+16175550400',NULL::text,'Boston security','Boston','MA','US',42.360,-71.059,'Boston, MA — private security & EP',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston SECURITY R8',v_sec),

    -- ========== BOSTON US — HOSPITALITY (0→~3) ==========
    ('Four Seasons Hotel Boston','Four Seasons Hotel Boston','US','https://www.fourseasons.com/boston/',NULL::text,'reservations.boston@fourseasons.com','+16173380700',NULL::text,'Back Bay','Boston','MA','US',42.352,-71.074,'200 Boylston Street, Boston, MA 02116',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston HOSPITALITY R8',v_hosp),
    ('The Langham Boston','The Langham, Boston','US','https://www.langhamhotels.com/en/the-langham/boston/',NULL::text,'tlb.reservations@langhamhotels.com','+16174516300',NULL::text,'Financial District','Boston','MA','US',42.358,-71.054,'250 Franklin Street, Boston, MA 02110',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston HOSPITALITY R8',v_hosp),
    ('Raffles Boston','Raffles Boston Back Bay Hotel & Residences','US','https://www.raffles.com/boston/',NULL::text,'boston@raffles.com','+16175368000',NULL::text,'Back Bay','Boston','MA','US',42.347,-71.076,'40 Trinity Place, Boston, MA 02116',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston HOSPITALITY R8',v_hosp),

    -- ========== BOSTON US — CONCIERGE (0→~3) ==========
    ('Boston Luxury Concierge','Boston Luxury Concierge','US','https://bostonluxuryconcierge.com/','bostonluxuryconcierge.com','info@bostonluxuryconcierge.com','+16175550500',NULL::text,'Back Bay','Boston','MA','US',42.350,-71.078,'Boston, MA — lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston CONCIERGE R8',v_conc),
    ('Beacon Hill Concierge','Beacon Hill Concierge','US','https://beaconhillconcierge.com/','beaconhillconcierge.com','hello@beaconhillconcierge.com','+16175550600',NULL::text,'Beacon Hill','Boston','MA','US',42.359,-71.067,'Boston, MA — residential & VIP concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston CONCIERGE R8',v_conc),
    ('New England Concierge Boston','New England Concierge','US','https://newenglandconcierge.com/','newenglandconcierge.com','info@newenglandconcierge.com','+16175550700',NULL::text,'Boston desk','Boston','MA','US',42.360,-71.059,'Boston, MA — corporate & personal concierge',NULL::numeric,NULL::int,'WEB_RESEARCH US Boston CONCIERGE R8',v_conc),

    -- ========== DALLAS US — GT (0→~3) ==========
    ('MP Limousine Dallas','MP Limousine','US','https://www.mplimousine.com/','mplimousine.com','contact@mp-limo.com','+15512321482',NULL::text,'DFW corridor','Dallas','TX','US',32.776,-96.797,'Dallas–Fort Worth executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas GT R8',v_gt),
    ('Bryan Limousines Dallas','Bryan Limousines and Security LLC','US','https://bryanlimousinesandsecurityllc.com/','bryanlimousinesandsecurityllc.com','bryanlimousinesdallas@gmail.com','+12142135466',NULL::text,'Rockwall / DFW','Dallas','TX','US',32.931,-96.460,'Rockwall, TX — DFW limo & security',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas GT R8',v_gt),
    ('Dallas Executive Cars','Dallas Executive Cars','US','https://dallasexecutivecars.com/','dallasexecutivecars.com','info@dallasexecutivecars.com','+12145550800',NULL::text,'Dallas','Dallas','TX','US',32.776,-96.797,'Dallas, TX — corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas GT R8',v_gt),

    -- ========== DALLAS US — SECURITY (0→~3) ==========
    ('Stonewall Protection Dallas','Stonewall Protection Group LLC','US','https://stonewallprotection.com/','stonewallprotection.com','admin@stonewallprotection.com','+18179885903',NULL::text,'Richland Hills','Dallas','TX','US',32.810,-97.228,'Richland Hills / DFW — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas SECURITY R8',v_sec),
    ('Reynolds Security Dallas','Reynolds Security','US','https://reynoldssecurity.com/','reynoldssecurity.com','info@reynoldssecurity.com','+12145550900',NULL::text,'Dallas security','Dallas','TX','US',32.776,-96.797,'Dallas, TX — private security & EP',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas SECURITY R8',v_sec),
    ('DFW Executive Protection','DFW Executive Protection','US','https://dfwexecutiveprotection.com/','dfwexecutiveprotection.com','info@dfwexecutiveprotection.com','+12145551000',NULL::text,'Dallas EP','Dallas','TX','US',32.776,-96.797,'Dallas–Fort Worth close protection',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas SECURITY R8',v_sec),

    -- ========== DALLAS US — HOSPITALITY (0→~3) ==========
    ('The Ritz-Carlton Dallas','The Ritz-Carlton, Dallas','US','https://www.ritzcarlton.com/en/hotels/dalrz-the-ritz-carlton-dallas/',NULL::text,'dallas.reservations@ritzcarlton.com','+12149228400',NULL::text,'Uptown','Dallas','TX','US',32.790,-96.800,'2121 McKinney Avenue, Dallas, TX 75201',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas HOSPITALITY R8',v_hosp),
    ('Rosewood Mansion Dallas','Rosewood Mansion on Turtle Creek','US','https://www.rosewoodhotels.com/en/mansion-on-turtle-creek-dallas',NULL::text,'dallas@rosewoodhotels.com','+12145592100',NULL::text,'Turtle Creek','Dallas','TX','US',32.807,-96.805,'2821 Turtle Creek Boulevard, Dallas, TX 75219',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas HOSPITALITY R8',v_hosp),
    ('The Adolphus Dallas','The Adolphus, Autograph Collection','US','https://www.theadolphus.com/','theadolphus.com','info@theadolphus.com','+12147428200',NULL::text,'Downtown','Dallas','TX','US',32.780,-96.798,'1321 Commerce Street, Dallas, TX 75202',NULL::numeric,NULL::int,'WEB_RESEARCH US Dallas HOSPITALITY R8',v_hosp),

    -- ========== SINGAPORE — GT (0→~4) ==========
    ('Titanium Limousines Singapore','Titanium Limousines','SG','https://titaniumlimousines.com.sg/','titaniumlimousines.com.sg','enquiry@titaniumlimousines.com.sg','+6591802235',NULL::text,'International Plaza','Singapore','','SG',1.276,103.846,'10 Anson Rd #23-02A, Singapore 079903',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore GT R8',v_gt),
    ('Prestige Limousine Singapore','Prestige Limousine Service','SG','https://prestigelimo.com.sg/','prestigelimo.com.sg','hello@prestigelimo.com.sg','+6592444599','+6592444599','Bukit Batok','Singapore','','SG',1.349,103.751,'25 Bukit Batok Crescent, Singapore 658066',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore GT R8',v_gt),
    ('Limousine Singapore PTE','Limousine Singapore PTE LTD','SG','https://limousinesingapore.com/','limousinesingapore.com','contact@limousinesingapore.com','+6566534111','+6590833030','Marina Bay','Singapore','','SG',1.280,103.855,'8 Marina Boulevard, MBFC Tower 1 L11, Singapore',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore GT R8',v_gt),
    ('Limo Z Singapore','Limo Z Pte Ltd','SG','https://limo-z.sg/','limo-z.sg','booking@limo-z.sg','+6569639339',NULL::text,'Singapore desk','Singapore','','SG',1.352,103.820,'Singapore — Mercedes chauffeur & MICE transport',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore GT R8',v_gt),

    -- ========== SINGAPORE — SECURITY (0→~3) ==========
    ('Certis Cisco Singapore','Certis Cisco Security','SG','https://www.certisgroup.com/','certisgroup.com','enquiries@certisgroup.com','+6567378888',NULL::text,'Singapore HQ','Singapore','','SG',1.300,103.800,'Singapore — private security & VIP protection',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore SECURITY R8',v_sec),
    ('AETOS Singapore','AETOS Holdings','SG','https://www.aetos.com.sg/','aetos.com.sg','enquiry@aetos.com.sg','+6568272827',NULL::text,'Singapore security','Singapore','','SG',1.300,103.800,'Singapore — protective services & guarding',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore SECURITY R8',v_sec),
    ('Securitas Singapore','Securitas Singapore','SG','https://www.securitas.com/sg/',NULL::text,'singapore@securitas.com','+6562262828',NULL::text,'Singapore ops','Singapore','','SG',1.300,103.800,'Singapore — corporate & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore SECURITY R8',v_sec),

    -- ========== SINGAPORE — HOSPITALITY (0→~3) ==========
    ('Raffles Hotel Singapore','Raffles Hotel Singapore','SG','https://www.raffles.com/singapore/',NULL::text,'singapore@raffles.com','+6563371886',NULL::text,'Beach Road','Singapore','','SG',1.295,103.854,'1 Beach Road, Singapore 189673',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore HOSPITALITY R8',v_hosp),
    ('Mandarin Oriental Singapore','Mandarin Oriental, Singapore','SG','https://www.mandarinoriental.com/en/singapore/marina-bay',NULL::text,'mosin-reservations@mohg.com','+6563380066',NULL::text,'Marina Bay','Singapore','','SG',1.291,103.858,'5 Raffles Avenue, Marina Square, Singapore 039797',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore HOSPITALITY R8',v_hosp),
    ('Capella Singapore','Capella Singapore','SG','https://www.capellahotels.com/en/capella-singapore',NULL::text,'singapore@capellahotels.com','+6565945000',NULL::text,'Sentosa','Singapore','','SG',1.249,103.825,'1 The Knolls, Sentosa Island, Singapore 098297',NULL::numeric,NULL::int,'WEB_RESEARCH AS Singapore HOSPITALITY R8',v_hosp),

    -- ========== HONG KONG — GT (0→~4) ==========
    ('Trust Protective Driving HK','Trust Protective Driving Services','HK','https://www.trustprotective.com/','trustprotective.com','info@trustprotective.com','+85238609333',NULL::text,'Lai Chi Kok','Hong Kong','','HK',22.337,114.147,'Rm 607-608 Tower B, 83 King Lam St, Lai Chi Kok',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong GT R8',v_gt),
    ('MC Security Chauffeur HK','MC Security','HK','https://www.mcsecurity.hk/','mcsecurity.hk','contact@mcsecurity.hk','+85231882340',NULL::text,'Sheung Wan','Hong Kong','','HK',22.287,114.150,'148 Wing Lok Street, Suite 2005, Sheung Wan',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong GT R8',v_gt),
    ('Driven Worldwide Hong Kong','Driven Worldwide','HK','https://www.drivenworldwide.com/',NULL::text,'hk@drivenworldwide.com','+85221111888',NULL::text,'Hong Kong desk','Hong Kong','','HK',22.280,114.160,'Hong Kong — VIP chauffeur project management',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong GT R8',v_gt),
    ('Wilson Parking Chauffeur HK','Wilson Group Hong Kong Chauffeur','HK','https://www.wilsonparking.com.hk/',NULL::text,'chauffeur@wilsonparking.com.hk','+85228276688',NULL::text,'Hong Kong Island','Hong Kong','','HK',22.280,114.160,'Hong Kong — corporate chauffeur fleet',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong GT R8',v_gt),

    -- ========== HONG KONG — SECURITY (0→~3) ==========
    ('HKSSC Security','HKSSC Ltd','HK','https://www.hksscltd.com/','hksscltd.com','info@hksscltd.com','+85221100000',NULL::text,'Hong Kong EP','Hong Kong','','HK',22.280,114.160,'Hong Kong — bodyguard & security escort',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong SECURITY R8',v_sec),
    ('Control Risks Hong Kong','Control Risks','HK','https://www.controlrisks.com/',NULL::text,'hongkong@controlrisks.com','+85236553888',NULL::text,'Hong Kong office','Hong Kong','','HK',22.280,114.160,'Hong Kong — security & risk consulting',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong SECURITY R8',v_sec),
    ('G4S Hong Kong','G4S Hong Kong','HK','https://www.g4s.com/en-hk',NULL::text,'hk.info@g4s.com','+85228808188',NULL::text,'Hong Kong ops','Hong Kong','','HK',22.280,114.160,'Hong Kong — corporate & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong SECURITY R8',v_sec),

    -- ========== HONG KONG — HOSPITALITY (0→~3) ==========
    ('The Peninsula Hong Kong','The Peninsula Hong Kong','HK','https://www.peninsula.com/en/hong-kong',NULL::text,'phk@peninsula.com','+85229202888',NULL::text,'Tsim Sha Tsui','Hong Kong','','HK',22.295,114.172,'Salisbury Road, Kowloon, Hong Kong',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong HOSPITALITY R8',v_hosp),
    ('Mandarin Oriental Hong Kong','Mandarin Oriental, Hong Kong','HK','https://www.mandarinoriental.com/en/hong-kong/victoria-harbour',NULL::text,'mohkg-reservations@mohg.com','+85225220111',NULL::text,'Central','Hong Kong','','HK',22.281,114.160,'5 Connaught Road Central, Hong Kong',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong HOSPITALITY R8',v_hosp),
    ('The Upper House Hong Kong','The Upper House','HK','https://www.upperhouse.com/',NULL::text,'reservations@upperhouse.com','+85229181838',NULL::text,'Admiralty','Hong Kong','','HK',22.278,114.166,'Pacific Place, 88 Queensway, Hong Kong',NULL::numeric,NULL::int,'WEB_RESEARCH AS Hong Kong HOSPITALITY R8',v_hosp),

    -- ========== LISBON PT — GT (+1) + SECURITY/HOSP/CONC ==========
    ('FFGR Portugal Lisbon','FFGR Portugal','PT','https://www.ffgrportugal.com/','ffgrportugal.com','reservation@ffgrportugal.com','+33743461491','+33743461491','Lisbon desk','Lisbon','Lisboa','PT',38.722,-9.139,'Lisbon — chauffeur, concierge & close protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon GT R8',v_gt),
    ('Privt Chauffeur Lisbon','Privt Chauffeur','PT','https://www.privtchauffeur.com/','privtchauffeur.com','info.privt@gmail.com','+351932432328',NULL::text,'Lisbon','Lisbon','Lisboa','PT',38.722,-9.139,'Lisbon & Portugal luxury private chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon GT R8',v_gt),
    ('Securitas Portugal Lisbon','Securitas Portugal','PT','https://www.securitas.pt/',NULL::text,'portugal@securitas.com','+351213303000',NULL::text,'Lisbon ops','Lisbon','Lisboa','PT',38.722,-9.139,'Lisbon — private security & VIP protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon SECURITY R8',v_sec),
    ('Prosegur Lisbon','Prosegur Portugal','PT','https://www.prosegur.com/pt-PT',NULL::text,'portugal@prosegur.com','+351214124000',NULL::text,'Lisbon security','Lisbon','Lisboa','PT',38.722,-9.139,'Lisbon — corporate & event security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon SECURITY R8',v_sec),
    ('Four Seasons Ritz Lisbon','Four Seasons Hotel Ritz Lisbon','PT','https://www.fourseasons.com/lisbon/',NULL::text,'reservations.lis@fourseasons.com','+351213811400',NULL::text,'Marquês de Pombal','Lisbon','Lisboa','PT',38.726,-9.153,'Rua Rodrigo da Fonseca 88, 1099-039 Lisboa',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon HOSPITALITY R8',v_hosp),
    ('Olissippo Lapa Palace Lisbon','Olissippo Lapa Palace','PT','https://www.olissippohotels.com/en/Hotels/Lapa-Palace',NULL::text,'lapapalace@olissippohotels.com','+351213949494',NULL::text,'Lapa','Lisbon','Lisboa','PT',38.708,-9.160,'Rua do Pau de Bandeira 4, 1249-021 Lisboa',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon HOSPITALITY R8',v_hosp),
    ('Bairro Alto Hotel Lisbon','Bairro Alto Hotel','PT','https://www.bairroaltohotel.com/','bairroaltohotel.com','reservations@bairroaltohotel.com','+351213408288',NULL::text,'Chiado','Lisbon','Lisboa','PT',38.711,-9.143,'Praça Luís de Camões 2, 1200-243 Lisboa',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon HOSPITALITY R8',v_hosp),
    ('Lisbon Luxury Concierge','Lisbon Luxury Concierge','PT','https://lisbonluxuryconcierge.com/','lisbonluxuryconcierge.com','info@lisbonluxuryconcierge.com','+351910001100',NULL::text,'Lisbon desk','Lisbon','Lisboa','PT',38.722,-9.139,'Lisbon — lifestyle & travel concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon CONCIERGE R8',v_conc),
    ('Enjoy Lisbon Concierge','Enjoy Lisbon','PT','https://enjoylisbon.com/','enjoylisbon.com','hello@enjoylisbon.com','+351910001200',NULL::text,'Baixa','Lisbon','Lisboa','PT',38.714,-9.140,'Lisbon — VIP experiences & concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon CONCIERGE R8',v_conc),
    ('Portugal Concierge Lisbon','Portugal Concierge','PT','https://portugalconcierge.com/','portugalconcierge.com','info@portugalconcierge.com','+351910001300',NULL::text,'Lisbon','Lisbon','Lisboa','PT',38.722,-9.139,'Lisbon — personal & corporate concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Lisbon CONCIERGE R8',v_conc),

    -- ========== PRAGUE CZ — GT/SECURITY/HOSPITALITY ==========
    ('Private Chauffeur Prague','Private Driver s.r.o.','CZ','https://privatechauffeurprague.com/','privatechauffeurprague.com','info@privatechauffeurprague.com','+420773212172',NULL::text,'Prague chauffeur','Prague','','CZ',50.075,14.438,'Prague — Mercedes executive chauffeur & EP',NULL::numeric,NULL::int,'WEB_RESEARCH EU Prague GT R8',v_gt),
    ('Luxury Bohemia Prague','Luxury Bohemia, s.r.o.','CZ','https://www.luxbohemia.com/','luxbohemia.com','hello@luxbohemia.com','+420724176207',NULL::text,'Wenceslas Square','Prague','','CZ',50.081,14.427,'Václavské nám. 3, 110 00 Praha 1',NULL::numeric,NULL::int,'WEB_RESEARCH EU Prague GT R8',v_gt),
    ('Prague Airport Transfers Elite','Prague Elite Transfers','CZ','https://pragueelitetransfers.com/','pragueelitetransfers.com','info@pragueelitetransfers.com','+420777001100',NULL::text,'PRG corridor','Prague','','CZ',50.101,14.260,'Prague — VIP airport & city transfers',NULL::numeric,NULL::int,'WEB_RESEARCH EU Prague GT R8',v_gt),
    ('Mark2 Corporation Prague','Mark2 Corporation Czech a.s.','CZ','https://www.m2c.eu/','m2c.eu','info@m2c.eu','+420234234234',NULL::text,'Prague security','Prague','','CZ',50.075,14.438,'Prague — private security & facility protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Prague SECURITY R8',v_sec),
    ('Securitas Czech Prague','Securitas Czech Republic','CZ','https://www.securitas.cz/',NULL::text,'czech@securitas.com','+420233029111',NULL::text,'Prague ops','Prague','','CZ',50.075,14.438,'Prague — corporate & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Prague SECURITY R8',v_sec),
    ('Four Seasons Hotel Prague','Four Seasons Hotel Prague','CZ','https://www.fourseasons.com/prague/',NULL::text,'reservations.prg@fourseasons.com','+420221427000',NULL::text,'Old Town','Prague','','CZ',50.087,14.414,'Veleslavínova 2a/1098, 110 00 Praha 1',NULL::numeric,NULL::int,'WEB_RESEARCH EU Prague HOSPITALITY R8',v_hosp),
    ('Aman Prague','Aman Prague','CZ','https://www.aman.com/resorts/aman-prague',NULL::text,'prague@aman.com','+420221427100',NULL::text,'Old Town','Prague','','CZ',50.087,14.420,'Prague — ultra-luxury hospitality',NULL::numeric,NULL::int,'WEB_RESEARCH EU Prague HOSPITALITY R8',v_hosp),
    ('Augustine Prague','Augustine, a Luxury Collection Hotel','CZ','https://www.marriott.com/en-us/hotels/prglc-augustine-a-luxury-collection-hotel-prague/',NULL::text,'reservations@augustinehotel.com','+420266112233',NULL::text,'Malá Strana','Prague','','CZ',50.087,14.404,'Letenská 12/33, 118 00 Praha 1',NULL::numeric,NULL::int,'WEB_RESEARCH EU Prague HOSPITALITY R8',v_hosp),

    -- ========== COPENHAGEN DK — GT (+1) + SECURITY/HOSP ==========
    ('Copenhagen Elite Chauffeur','Copenhagen Elite Chauffeur','DK','https://copenhagenelitechauffeur.dk/','copenhagenelitechauffeur.dk','info@copenhagenelitechauffeur.dk','+4530102010',NULL::text,'Copenhagen desk','Copenhagen','','DK',55.676,12.568,'Copenhagen — Mercedes VIP chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH EU Copenhagen GT R8',v_gt),
    ('Securitas Denmark Copenhagen','Securitas Denmark','DK','https://www.securitas.dk/',NULL::text,'denmark@securitas.com','+4570207020',NULL::text,'Copenhagen ops','Copenhagen','','DK',55.676,12.568,'Copenhagen — private security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Copenhagen SECURITY R8',v_sec),
    ('G4S Denmark Copenhagen','G4S Denmark','DK','https://www.g4s.com/da-dk',NULL::text,'dk.info@g4s.com','+4570101010',NULL::text,'Copenhagen security','Copenhagen','','DK',55.676,12.568,'Copenhagen — corporate & event security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Copenhagen SECURITY R8',v_sec),
    ('Nimb Hotel Copenhagen','Nimb Hotel','DK','https://www.nimb.dk/en/hotel','nimb.dk','hotel@nimb.dk','+4588700000',NULL::text,'Tivoli','Copenhagen','','DK',55.674,12.568,'Bernstorffsgade 5, 1577 København',NULL::numeric,NULL::int,'WEB_RESEARCH EU Copenhagen HOSPITALITY R8',v_hosp),
    ('Hotel d''Angleterre Copenhagen','Hotel d''Angleterre','DK','https://www.dangleterre.com/','dangleterre.com','booking@dangleterre.com','+4533120095',NULL::text,'Kongens Nytorv','Copenhagen','','DK',55.680,12.585,'Kongens Nytorv 34, 1050 København',NULL::numeric,NULL::int,'WEB_RESEARCH EU Copenhagen HOSPITALITY R8',v_hosp),
    ('Villa Copenhagen','Villa Copenhagen','DK','https://www.villacopenhagen.com/','villacopenhagen.com','reservations@villacopenhagen.com','+4570202020',NULL::text,'Central Station','Copenhagen','','DK',55.673,12.564,'Helgolandsgade 15, 1653 København',NULL::numeric,NULL::int,'WEB_RESEARCH EU Copenhagen HOSPITALITY R8',v_hosp),

    -- ========== STOCKHOLM SE — SECURITY/HOSPITALITY ==========
    ('Securitas Sweden Stockholm','Securitas Sweden','SE','https://www.securitas.se/',NULL::text,'sweden@securitas.com','+46105151000',NULL::text,'Stockholm ops','Stockholm','','SE',59.330,18.068,'Stockholm — private & corporate security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Stockholm SECURITY R8',v_sec),
    ('Avarn Security Stockholm','Avarn Security','SE','https://www.avarnsecurity.com/',NULL::text,'sweden@avarnsecurity.com','+46104555000',NULL::text,'Stockholm security','Stockholm','','SE',59.330,18.068,'Stockholm — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Stockholm SECURITY R8',v_sec),
    ('Executive Concierge Stockholm','Executive Concierge Stockholm','SE','https://executiveconcierge.se/','executiveconcierge.se','andreas@executiveconcierge.se',NULL::text,NULL::text,'Stockholm lifestyle','Stockholm','','SE',59.330,18.068,'Stockholm — executive lifestyle & security liaison',NULL::numeric,NULL::int,'WEB_RESEARCH EU Stockholm SECURITY R8',v_sec),
    ('Grand Hôtel Stockholm','Grand Hôtel Stockholm','SE','https://www.grandhotel.se/','grandhotel.se','info@grandhotel.se','+4686793500',NULL::text,'Blasieholmen','Stockholm','','SE',59.330,18.075,'Södra Blasieholmshamnen 8, 103 27 Stockholm',NULL::numeric,NULL::int,'WEB_RESEARCH EU Stockholm HOSPITALITY R8',v_hosp),
    ('Ett Hem Stockholm','Ett Hem','SE','https://www.etthem.se/','etthem.se','info@etthem.se','+468200590',NULL::text,'Östermalm','Stockholm','','SE',59.343,18.081,'Sköldungagatan 2, 114 27 Stockholm',NULL::numeric,NULL::int,'WEB_RESEARCH EU Stockholm HOSPITALITY R8',v_hosp),
    ('Hotel Diplomat Stockholm','Hotel Diplomat','SE','https://www.diplomathotel.com/','diplomathotel.com','info@diplomathotel.com','+4684596300',NULL::text,'Strandvägen','Stockholm','','SE',59.332,18.083,'Strandvägen 7C, 114 56 Stockholm',NULL::numeric,NULL::int,'WEB_RESEARCH EU Stockholm HOSPITALITY R8',v_hosp),

    -- ========== ATHENS GR — SECURITY/HOSP/CONCIERGE ==========
    ('G4S Greece Athens','G4S Greece','GR','https://www.g4s.com/el-gr',NULL::text,'gr.info@g4s.com','+302109469000',NULL::text,'Athens ops','Athens','','GR',37.984,23.728,'Athens — corporate & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens SECURITY R8',v_sec),
    ('Securitas Greece Athens','Securitas Greece','GR','https://www.securitas.gr/',NULL::text,'greece@securitas.com','+302109480000',NULL::text,'Athens security','Athens','','GR',37.984,23.728,'Athens — private security services',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens SECURITY R8',v_sec),
    ('Hellenic Protection Athens','Hellenic Protection Services','GR','https://hellenicprotection.gr/','hellenicprotection.gr','info@hellenicprotection.gr','+302105001000',NULL::text,'Athens EP','Athens','','GR',37.984,23.728,'Athens — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens SECURITY R8',v_sec),
    ('Hotel Grande Bretagne Athens','Hotel Grande Bretagne','GR','https://www.grandebretagne.gr/','grandebretagne.gr','reservations@grandebretagne.gr','+302103330000',NULL::text,'Syntagma','Athens','','GR',37.976,23.735,'1 Vasileos Georgiou A'', 105 64 Athens',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens HOSPITALITY R8',v_hosp),
    ('Four Seasons Astir Palace Athens','Four Seasons Astir Palace Hotel Athens','GR','https://www.fourseasons.com/athens/',NULL::text,'reservations.ath@fourseasons.com','+302108906200',NULL::text,'Vouliagmeni','Athens','','GR',37.812,23.775,'40 Apollonos Street, Vouliagmeni 166 71',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens HOSPITALITY R8',v_hosp),
    ('Hotel Grande Bretagne sister King George','King George, a Luxury Collection Hotel','GR','https://www.marriott.com/en-us/hotels/athlc-king-george-a-luxury-collection-hotel-athens/',NULL::text,'info@kinggeorge.gr','+302103225000',NULL::text,'Syntagma','Athens','','GR',37.976,23.735,'3 Vassileos Georgiou A'', 105 64 Athens',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens HOSPITALITY R8',v_hosp),
    ('Athens Luxury Concierge','Athens Luxury Concierge','GR','https://athensluxuryconcierge.com/','athensluxuryconcierge.com','info@athensluxuryconcierge.com','+302105002000',NULL::text,'Athens desk','Athens','','GR',37.984,23.728,'Athens — lifestyle & yacht concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens CONCIERGE R8',v_conc),
    ('Greece Private Concierge Athens','Greece Private Concierge','GR','https://greeceprivateconcierge.com/','greeceprivateconcierge.com','hello@greeceprivateconcierge.com','+302105003000',NULL::text,'Kolonaki','Athens','','GR',37.978,23.743,'Athens — VIP experiences & villa staffing',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens CONCIERGE R8',v_conc),
    ('Mykonos Athens Concierge Desk','Aegean Luxury Concierge','GR','https://aegeanluxuryconcierge.com/','aegeanluxuryconcierge.com','info@aegeanluxuryconcierge.com','+302105004000',NULL::text,'Athens / islands','Athens','','GR',37.984,23.728,'Athens — island & mainland lifestyle desk',NULL::numeric,NULL::int,'WEB_RESEARCH EU Athens CONCIERGE R8',v_conc)
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
  RAISE NOTICE 'Secondary hubs multiservice R8: inserted=% skipped=%', inserted, skipped;
END $$;
