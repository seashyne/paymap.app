/**
 * PayMap — Make Admin Script
 * Usage: npx tsx scripts/make-admin.ts <email>
 * Example: npx tsx scripts/make-admin.ts dev@example.com
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error("❌  Usage: npx tsx scripts/make-admin.ts <email>")
    process.exit(1)
  }

  // Find user across all account modes (email can exist for personal/business/merchant)
  const users = await prisma.user.findMany({
    where: { email },
    select: { id: true, email: true, name: true, accountMode: true, role: true },
  })

  if (!users.length) {
    console.error(`❌  No user found with email: ${email}`)
    process.exit(1)
  }

  // Update all account modes for this email
  const updated = await prisma.user.updateMany({
    where: { email },
    data: { role: "admin" },
  })

  console.log(`\n✅  Done — ${updated.count} account(s) updated to admin\n`)
  users.forEach(u => {
    console.log(`   • ${u.email} [${u.accountMode}] — role: ${u.role} → admin`)
  })
  console.log("\n💡  Logout and login again for the new role to take effect.\n")
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
