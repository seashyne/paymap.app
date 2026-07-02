import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const isPublic = req.nextUrl.searchParams.get("public") === "1";
  const internalHeader = req.headers.get("x-health-secret");
  const healthSecret = process.env.HEALTHCHECK_SECRET;

  if (!isPublic && healthSecret && internalHeader !== healthSecret) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  if (isPublic) {
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  }

  const start = Date.now();
  let dbStatus = "ok";
  let redisStatus = "ok";
  let dbLatency = 0;
  let redisLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch {
    dbStatus = "error";
  }

  try {
    const redis = await getRedis();
    if (redis) {
      const redisStart = Date.now();
      await redis.ping();
      redisLatency = Date.now() - redisStart;
    }
  } catch {
    redisStatus = "error";
  }

  const healthy = dbStatus === "ok" && redisStatus === "ok";
  return NextResponse.json({
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    latency: Date.now() - start,
    services: {
      database: { status: dbStatus, latency: dbLatency },
      redis: { status: redisStatus, latency: redisLatency },
    },
  }, { status: healthy ? 200 : 503 });
}
