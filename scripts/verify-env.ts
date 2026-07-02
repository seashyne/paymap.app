const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const

const optional = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_PRO_YEARLY",
  "STRIPE_PRICE_FAMILY_MONTHLY",
  "STRIPE_PRICE_FAMILY_YEARLY",
  "STRIPE_PRICE_BUSINESS_SME_MONTHLY",
  "STRIPE_PRICE_BUSINESS_SME_YEARLY",
  "STRIPE_PRICE_BUSINESS_SCALE_MONTHLY",
  "STRIPE_PRICE_BUSINESS_SCALE_YEARLY",
  "STRIPE_PRICE_MERCHANT_STARTER_MONTHLY",
  "STRIPE_PRICE_MERCHANT_STARTER_YEARLY",
  "STRIPE_PRICE_MERCHANT_GROWTH_MONTHLY",
  "STRIPE_PRICE_MERCHANT_GROWTH_YEARLY",
  "STRIPE_PRICE_MERCHANT_SCALE_MONTHLY",
  "STRIPE_PRICE_MERCHANT_SCALE_YEARLY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "REDIS_URL",
] as const

let missingRequired = 0
console.log("PayMap v10 env report")
for (const key of required) {
  const present = Boolean(process.env[key])
  if (!present) missingRequired++
  console.log(`- ${key}: ${present ? "OK" : "MISSING"}`)
}
for (const key of optional) {
  console.log(`- ${key}: ${process.env[key] ? "configured" : "not set"}`)
}

if (missingRequired > 0) {
  process.exitCode = 1
}
