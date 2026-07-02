const APP_URL_FALLBACK = "http://localhost:3000";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || APP_URL_FALLBACK;
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string) {
  return process.env[name];
}

export function hasEnv(name: string) {
  return Boolean(process.env[name]);
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function isDemoEnabled() {
  return (process.env.ENABLE_DEMO ?? (isProduction() ? "false" : "true")).toLowerCase() === "true";
}
