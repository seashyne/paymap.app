// 30+ currencies — add more anytime
export interface CurrencyInfo {
  code: string; name: string; symbol: string; locale: string; decimals: number
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  // Southeast Asia
  THB: { code:"THB", name:"Thai Baht",         symbol:"฿",   locale:"th-TH", decimals:2 },
  SGD: { code:"SGD", name:"Singapore Dollar",  symbol:"S$",  locale:"en-SG", decimals:2 },
  MYR: { code:"MYR", name:"Malaysian Ringgit", symbol:"RM",  locale:"ms-MY", decimals:2 },
  IDR: { code:"IDR", name:"Indonesian Rupiah", symbol:"Rp",  locale:"id-ID", decimals:0 },
  PHP: { code:"PHP", name:"Philippine Peso",   symbol:"₱",   locale:"en-PH", decimals:2 },
  VND: { code:"VND", name:"Vietnamese Dong",   symbol:"₫",   locale:"vi-VN", decimals:0 },
  MMK: { code:"MMK", name:"Myanmar Kyat",      symbol:"K",   locale:"my-MM", decimals:0 },
  KHR: { code:"KHR", name:"Cambodian Riel",    symbol:"៛",   locale:"km-KH", decimals:0 },
  // East Asia
  JPY: { code:"JPY", name:"Japanese Yen",      symbol:"¥",   locale:"ja-JP", decimals:0 },
  CNY: { code:"CNY", name:"Chinese Yuan",      symbol:"¥",   locale:"zh-CN", decimals:2 },
  KRW: { code:"KRW", name:"South Korean Won",  symbol:"₩",   locale:"ko-KR", decimals:0 },
  TWD: { code:"TWD", name:"Taiwan Dollar",     symbol:"NT$", locale:"zh-TW", decimals:2 },
  HKD: { code:"HKD", name:"Hong Kong Dollar",  symbol:"HK$", locale:"zh-HK", decimals:2 },
  // South Asia
  INR: { code:"INR", name:"Indian Rupee",      symbol:"₹",   locale:"en-IN", decimals:2 },
  BDT: { code:"BDT", name:"Bangladeshi Taka",  symbol:"৳",   locale:"bn-BD", decimals:2 },
  // Middle East
  AED: { code:"AED", name:"UAE Dirham",        symbol:"د.إ", locale:"ar-AE", decimals:2 },
  SAR: { code:"SAR", name:"Saudi Riyal",       symbol:"﷼",   locale:"ar-SA", decimals:2 },
  // Western
  USD: { code:"USD", name:"US Dollar",         symbol:"$",   locale:"en-US", decimals:2 },
  EUR: { code:"EUR", name:"Euro",              symbol:"€",   locale:"de-DE", decimals:2 },
  GBP: { code:"GBP", name:"British Pound",     symbol:"£",   locale:"en-GB", decimals:2 },
  CHF: { code:"CHF", name:"Swiss Franc",       symbol:"Fr",  locale:"de-CH", decimals:2 },
  CAD: { code:"CAD", name:"Canadian Dollar",   symbol:"C$",  locale:"en-CA", decimals:2 },
  AUD: { code:"AUD", name:"Australian Dollar", symbol:"A$",  locale:"en-AU", decimals:2 },
  NZD: { code:"NZD", name:"New Zealand Dollar",symbol:"NZ$", locale:"en-NZ", decimals:2 },
  SEK: { code:"SEK", name:"Swedish Krona",     symbol:"kr",  locale:"sv-SE", decimals:2 },
  NOK: { code:"NOK", name:"Norwegian Krone",   symbol:"kr",  locale:"nb-NO", decimals:2 },
  DKK: { code:"DKK", name:"Danish Krone",      symbol:"kr",  locale:"da-DK", decimals:2 },
  // Others
  BRL: { code:"BRL", name:"Brazilian Real",    symbol:"R$",  locale:"pt-BR", decimals:2 },
  MXN: { code:"MXN", name:"Mexican Peso",      symbol:"$",   locale:"es-MX", decimals:2 },
  ZAR: { code:"ZAR", name:"South African Rand",symbol:"R",   locale:"en-ZA", decimals:2 },
}

export const CURRENCY_LIST = Object.values(CURRENCIES)
export function getCurrency(code: string): CurrencyInfo {
  return CURRENCIES[code?.toUpperCase()] ?? CURRENCIES["USD"]
}

/** Format money dynamically by currency — replaces old hardcoded th-TH */
export function formatMoney(amount: number, currency = "THB", opts?: { compact?: boolean }): string {
  const info = getCurrency(currency)
  return new Intl.NumberFormat(info.locale, {
    style: "currency", currency: info.code,
    maximumFractionDigits: info.decimals,
    ...(opts?.compact ? { notation: "compact" } : {}),
  }).format(amount)
}

export function formatDate(value: string | Date, locale = "th-TH"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value))
}

export function formatDateTime(value: string | Date, locale = "th-TH"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}
