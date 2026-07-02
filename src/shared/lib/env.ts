const REQUIRED_SERVER_ENV = [
  "DATABASE_URL",
  "JWT_SECRET",
] as const

export function getRequiredEnv(name: (typeof REQUIRED_SERVER_ENV)[number]) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

export function verifyRequiredEnv() {
  return REQUIRED_SERVER_ENV.map((key) => ({ key, present: Boolean(process.env[key]) }))
}
