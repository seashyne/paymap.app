/**
 * PayMap — Revoke Admin Script
 * Usage: npx tsx scripts/revoke-admin.ts <email>
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error("❌  Usage: npx tsx scripts/revoke-admin.ts <email>")
    process.exit(1)
  }

  const updated = await prisma.user.updateMany({
    where: { email },
    data: { role: "user" },
  })

  if (!updated.count) {
    console.error(`❌  No user found with email: ${email}`)
    process.exit(1)
  }

  console.log(`✅  ${email} — role reverted to user (${updated.count} account(s))`)
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
