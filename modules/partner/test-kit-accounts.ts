/**
 * Deterministic partner onboarding test kit.
 * LEADs are seeded as is_test=true with open invites so you can verify each
 * service from /join without inventing contacts every time.
 *
 * Password suggestion at signup: TestPartner2026!
 */
export type PartnerTestAccount = {
  serviceCode: string;
  serviceLabel: string;
  companyName: string;
  contactName: string;
  firstName: string;
  surname: string;
  email: string;
  phoneE164: string;
  /** Raw invite token — open /join?invite=<token> */
  inviteToken: string;
  city: string;
  countryCode: string;
};

export const PARTNER_TEST_KIT: PartnerTestAccount[] = [
  {
    serviceCode: "GROUND_TRANSPORTATION",
    serviceLabel: "Ground Transportation",
    companyName: "VL Test GT London",
    contactName: "Alex Driver",
    firstName: "Alex",
    surname: "Driver",
    email: "test.gt@vantage-lane.test",
    phoneE164: "+447700900101",
    inviteToken: "vltest_invite_gt_2026_ok01xxxx",
    city: "London",
    countryCode: "GB",
  },
  {
    serviceCode: "AVIATION",
    serviceLabel: "Aviation",
    companyName: "VL Test Aviation Heathrow",
    contactName: "Blake Aviator",
    firstName: "Blake",
    surname: "Aviator",
    email: "test.aviation@vantage-lane.test",
    phoneE164: "+447700900102",
    inviteToken: "vltest_invite_av_2026_ok02xxxx",
    city: "London",
    countryCode: "GB",
  },
  {
    serviceCode: "SECURITY",
    serviceLabel: "Security",
    companyName: "VL Test Security Mayfair",
    contactName: "Casey Guard",
    firstName: "Casey",
    surname: "Guard",
    email: "test.security@vantage-lane.test",
    phoneE164: "+447700900103",
    inviteToken: "vltest_invite_sec_2026_ok03xxx",
    city: "London",
    countryCode: "GB",
  },
  {
    serviceCode: "HOSPITALITY",
    serviceLabel: "Hospitality",
    companyName: "VL Test Hospitality Knightsbridge",
    contactName: "Dana Host",
    firstName: "Dana",
    surname: "Host",
    email: "test.hospitality@vantage-lane.test",
    phoneE164: "+447700900104",
    inviteToken: "vltest_invite_hos_2026_ok04xxx",
    city: "London",
    countryCode: "GB",
  },
  {
    serviceCode: "CONCIERGE",
    serviceLabel: "Concierge",
    companyName: "VL Test Concierge Chelsea",
    contactName: "Eden Concierge",
    firstName: "Eden",
    surname: "Concierge",
    email: "test.concierge@vantage-lane.test",
    phoneE164: "+447700900105",
    inviteToken: "vltest_invite_con_2026_ok05xxx",
    city: "London",
    countryCode: "GB",
  },
  {
    serviceCode: "YACHT",
    serviceLabel: "Yacht & Marine",
    companyName: "VL Test Yacht Southampton",
    contactName: "Finn Skipper",
    firstName: "Finn",
    surname: "Skipper",
    email: "test.yacht@vantage-lane.test",
    phoneE164: "+447700900106",
    inviteToken: "vltest_invite_yt_2026_ok06xxxx",
    city: "Southampton",
    countryCode: "GB",
  },
  {
    serviceCode: "MEDICAL",
    serviceLabel: "Medical & Wellness",
    companyName: "VL Test Medical Harley",
    contactName: "Grey Medic",
    firstName: "Grey",
    surname: "Medic",
    email: "test.medical@vantage-lane.test",
    phoneE164: "+447700900107",
    inviteToken: "vltest_invite_med_2026_ok07xxx",
    city: "London",
    countryCode: "GB",
  },
  {
    serviceCode: "EVENTS",
    serviceLabel: "Events & Protocol",
    companyName: "VL Test Events Westminster",
    contactName: "Harper Events",
    firstName: "Harper",
    surname: "Events",
    email: "test.events@vantage-lane.test",
    phoneE164: "+447700900108",
    inviteToken: "vltest_invite_evt_2026_ok08xxx",
    city: "London",
    countryCode: "GB",
  },
];

export const PARTNER_TEST_PASSWORD_HINT = "TestPartner2026!";
