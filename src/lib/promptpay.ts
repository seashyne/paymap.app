// v2.0: PromptPay QR Generator — pure functions, no API imports
// สร้าง EMVCo payload มาตรฐาน Thai PromptPay — ทำงานแบบ offline

// ── EMVCo TLV helpers ─────────────────────────────────────────────────────────
function tlv(id: string, value: string): string {
  const len = String(value.length).padStart(2, "0")
  return `${id}${len}${value}`
}

// CRC-16 CCITT (XMODEM) — required by EMVCo spec
function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return ((crc & 0xffff) >>> 0).toString(16).toUpperCase().padStart(4, "0")
}

// Sanitize PromptPay target: phone → 0066XXXXXXXX, tax ID stays 13 digits
export function normalizeTarget(raw: string): { type: "phone" | "taxid" | "ewallet"; value: string } {
  const clean = raw.replace(/[\s\-]/g, "")
  if (/^\d{13}$/.test(clean)) return { type: "taxid", value: clean }
  if (/^(0\d{9})$/.test(clean)) return { type: "phone", value: "0066" + clean.slice(1) }
  if (/^(66\d{9})$/.test(clean)) return { type: "phone", value: "00" + clean }
  if (/^(\+66\d{9})$/.test(clean)) return { type: "phone", value: "0066" + clean.slice(3) }
  return { type: "ewallet", value: clean }
}

export function buildPromptPayPayload(target: string, amount?: number): string {
  const { type, value } = normalizeTarget(target)
  const targetTag = type === "taxid" ? "02" : type === "phone" ? "01" : "03"
  const merchantAccount = tlv("29", tlv("00", "A000000677010111") + tlv(targetTag, value))
  const parts = [
    tlv("00", "01"),
    tlv("01", amount ? "12" : "11"),
    merchantAccount,
    tlv("53", "764"),
    ...(amount && amount > 0 ? [tlv("54", amount.toFixed(2))] : []),
    tlv("58", "TH"),
    tlv("59", "payMap"),
    tlv("60", "Bangkok"),
  ]
  const payload = parts.join("") + "6304"
  return payload + crc16(payload)
}

export function buildPromptPayQrUrl(payload: string, size = 280): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=M&data=${encodeURIComponent(payload)}`
}
