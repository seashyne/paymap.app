import type Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __paymapRedis: Redis | undefined;
  // eslint-disable-next-line no-var
  var __paymapRedisPromise: Promise<Redis | null> | undefined;
}

async function createClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const { default: Redis } = await import("ioredis");
  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
  });
  client.on("error", (err: Error) => console.error("[Redis]", err.message));
  return client;
}

export async function getRedis() {
  if (global.__paymapRedis) {
    if (global.__paymapRedis.status === "wait") await global.__paymapRedis.connect();
    return global.__paymapRedis;
  }

  if (!global.__paymapRedisPromise) {
    global.__paymapRedisPromise = createClient();
  }

  const client = await global.__paymapRedisPromise;
  if (!client) return null;

  if (process.env.NODE_ENV !== "production") {
    global.__paymapRedis = client;
  }

  if (client.status === "wait") await client.connect();
  return client;
}
