/** Curated dial codes for partner signup (flag + prefix). */
export type DialCountry = {
  iso2: string;
  name: string;
  dial: string;
  flag: string;
};

export const DIAL_COUNTRIES: DialCountry[] = [
  { iso2: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { iso2: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { iso2: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { iso2: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { iso2: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { iso2: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { iso2: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { iso2: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { iso2: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { iso2: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
  { iso2: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { iso2: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
  { iso2: "CZ", name: "Czechia", dial: "+420", flag: "🇨🇿" },
  { iso2: "RO", name: "Romania", dial: "+40", flag: "🇷🇴" },
  { iso2: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { iso2: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { iso2: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { iso2: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { iso2: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { iso2: "TR", name: "Türkiye", dial: "+90", flag: "🇹🇷" },
  { iso2: "GR", name: "Greece", dial: "+30", flag: "🇬🇷" },
  { iso2: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { iso2: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
  { iso2: "DK", name: "Denmark", dial: "+45", flag: "🇩🇰" },
  { iso2: "FI", name: "Finland", dial: "+358", flag: "🇫🇮" },
  { iso2: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { iso2: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { iso2: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { iso2: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { iso2: "HK", name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
];

export function findDialCountry(iso2: string): DialCountry {
  return (
    DIAL_COUNTRIES.find((c) => c.iso2 === iso2) ?? DIAL_COUNTRIES[0]!
  );
}

/** Build E.164-ish value from dial + national number. */
export function toE164(dial: string, national: string): string {
  const digits = national.replace(/[^\d]/g, "");
  const trimmed = digits.replace(/^0+/, "");
  return `${dial}${trimmed}`;
}
