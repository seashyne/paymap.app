export interface CountryInfo {
  code: string; name: string; flag: string
  currency: string; locale: string; timezone: string; taxEngine: string
}

export const COUNTRIES: Record<string, CountryInfo> = {
  TH: { code:"TH", name:"Thailand",       flag:"🇹🇭", currency:"THB", locale:"th-TH", timezone:"Asia/Bangkok",       taxEngine:"TH" },
  SG: { code:"SG", name:"Singapore",      flag:"🇸🇬", currency:"SGD", locale:"en-SG", timezone:"Asia/Singapore",     taxEngine:"SG" },
  MY: { code:"MY", name:"Malaysia",       flag:"🇲🇾", currency:"MYR", locale:"ms-MY", timezone:"Asia/Kuala_Lumpur",  taxEngine:"MY" },
  ID: { code:"ID", name:"Indonesia",      flag:"🇮🇩", currency:"IDR", locale:"id-ID", timezone:"Asia/Jakarta",       taxEngine:"ID" },
  PH: { code:"PH", name:"Philippines",    flag:"🇵🇭", currency:"PHP", locale:"en-PH", timezone:"Asia/Manila",        taxEngine:"PH" },
  VN: { code:"VN", name:"Vietnam",        flag:"🇻🇳", currency:"VND", locale:"vi-VN", timezone:"Asia/Ho_Chi_Minh",   taxEngine:"VN" },
  JP: { code:"JP", name:"Japan",          flag:"🇯🇵", currency:"JPY", locale:"ja-JP", timezone:"Asia/Tokyo",         taxEngine:"JP" },
  KR: { code:"KR", name:"South Korea",    flag:"🇰🇷", currency:"KRW", locale:"ko-KR", timezone:"Asia/Seoul",         taxEngine:"KR" },
  CN: { code:"CN", name:"China",          flag:"🇨🇳", currency:"CNY", locale:"zh-CN", timezone:"Asia/Shanghai",      taxEngine:"CN" },
  HK: { code:"HK", name:"Hong Kong",      flag:"🇭🇰", currency:"HKD", locale:"zh-HK", timezone:"Asia/Hong_Kong",     taxEngine:"HK" },
  IN: { code:"IN", name:"India",          flag:"🇮🇳", currency:"INR", locale:"en-IN", timezone:"Asia/Kolkata",       taxEngine:"IN" },
  AE: { code:"AE", name:"UAE",            flag:"🇦🇪", currency:"AED", locale:"ar-AE", timezone:"Asia/Dubai",         taxEngine:"AE" },
  US: { code:"US", name:"United States",  flag:"🇺🇸", currency:"USD", locale:"en-US", timezone:"America/New_York",   taxEngine:"US" },
  GB: { code:"GB", name:"United Kingdom", flag:"🇬🇧", currency:"GBP", locale:"en-GB", timezone:"Europe/London",      taxEngine:"GB" },
  DE: { code:"DE", name:"Germany",        flag:"🇩🇪", currency:"EUR", locale:"de-DE", timezone:"Europe/Berlin",      taxEngine:"DE" },
  AU: { code:"AU", name:"Australia",      flag:"🇦🇺", currency:"AUD", locale:"en-AU", timezone:"Australia/Sydney",   taxEngine:"AU" },
  CA: { code:"CA", name:"Canada",         flag:"🇨🇦", currency:"CAD", locale:"en-CA", timezone:"America/Toronto",    taxEngine:"CA" },
  BR: { code:"BR", name:"Brazil",         flag:"🇧🇷", currency:"BRL", locale:"pt-BR", timezone:"America/Sao_Paulo",  taxEngine:"BR" },
}

export const COUNTRY_LIST = Object.values(COUNTRIES)
export function getCountry(code: string): CountryInfo {
  return COUNTRIES[code?.toUpperCase()] ?? COUNTRIES["TH"]
}
