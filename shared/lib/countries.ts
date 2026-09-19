export type CountryOption = {
  code: string;
  name: string;
  dial: string;
};

/** ISO-2 countries with dial codes for CRM Quick Add / phones */
export const COUNTRIES: CountryOption[] = [
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "LU", name: "Luxembourg", dial: "+352" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "PL", name: "Poland", dial: "+48" },
  { code: "CZ", name: "Czechia", dial: "+420" },
  { code: "SK", name: "Slovakia", dial: "+421" },
  { code: "HU", name: "Hungary", dial: "+36" },
  { code: "RO", name: "Romania", dial: "+40" },
  { code: "BG", name: "Bulgaria", dial: "+359" },
  { code: "GR", name: "Greece", dial: "+30" },
  { code: "HR", name: "Croatia", dial: "+385" },
  { code: "SI", name: "Slovenia", dial: "+386" },
  { code: "RS", name: "Serbia", dial: "+381" },
  { code: "DK", name: "Denmark", dial: "+45" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "FI", name: "Finland", dial: "+358" },
  { code: "IS", name: "Iceland", dial: "+354" },
  { code: "EE", name: "Estonia", dial: "+372" },
  { code: "LV", name: "Latvia", dial: "+371" },
  { code: "LT", name: "Lithuania", dial: "+370" },
  { code: "UA", name: "Ukraine", dial: "+380" },
  { code: "MD", name: "Moldova", dial: "+373" },
  { code: "TR", name: "Türkiye", dial: "+90" },
  { code: "CY", name: "Cyprus", dial: "+357" },
  { code: "MT", name: "Malta", dial: "+356" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "IL", name: "Israel", dial: "+972" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "HK", name: "Hong Kong", dial: "+852" },
  { code: "TW", name: "Taiwan", dial: "+886" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "KR", name: "South Korea", dial: "+82" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "TH", name: "Thailand", dial: "+66" },
  { code: "VN", name: "Vietnam", dial: "+84" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "MC", name: "Monaco", dial: "+377" },
  { code: "AD", name: "Andorra", dial: "+376" },
  { code: "LI", name: "Liechtenstein", dial: "+423" },
  { code: "SM", name: "San Marino", dial: "+378" },
  { code: "VA", name: "Vatican City", dial: "+379" },
  { code: "AL", name: "Albania", dial: "+355" },
  { code: "BA", name: "Bosnia and Herzegovina", dial: "+387" },
  { code: "ME", name: "Montenegro", dial: "+382" },
  { code: "MK", name: "North Macedonia", dial: "+389" },
  { code: "XK", name: "Kosovo", dial: "+383" },
  { code: "GE", name: "Georgia", dial: "+995" },
  { code: "AM", name: "Armenia", dial: "+374" },
  { code: "AZ", name: "Azerbaijan", dial: "+994" },
  { code: "KZ", name: "Kazakhstan", dial: "+7" },
  { code: "UZ", name: "Uzbekistan", dial: "+998" },
].sort((a, b) => a.name.localeCompare(b.name));

export function getCountry(code: string) {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

export function getDialCode(countryCode: string) {
  return getCountry(countryCode)?.dial ?? "";
}

/** Apply country dial prefix if the field is empty or only contains another dial prefix. */
export function withCountryDial(value: string, countryCode: string) {
  const dial = getDialCode(countryCode);
  if (!dial) return value;
  const trimmed = value.trim();
  if (!trimmed || /^\+\d{1,4}$/.test(trimmed)) return `${dial} `;
  if (trimmed.startsWith("+")) return trimmed;
  return `${dial} ${trimmed.replace(/^0+/, "")}`;
}
