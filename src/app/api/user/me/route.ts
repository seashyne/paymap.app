export const dynamic = "force-dynamic"
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/authz";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      lastLoginAt: true,
      loginCount: true,
      provider: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}
