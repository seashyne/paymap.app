// migrate.js — PayMap Migration Runner
// รันใน PowerShell: node migrate.js
// ใช้ DATABASE_URL จาก .env อัตโนมัติ

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// ── Load .env manually ──────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, ".env")
  if (!fs.existsSync(envPath)) {
    console.error("❌ ไม่พบไฟล์ .env")
    process.exit(1)
  }
  const lines = fs.readFileSync(envPath, "utf8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL ไม่ได้ตั้งค่าใน .env")
  process.exit(1)
}

// ── Migration files in order ────────────────────────────────────────────────
const MIGRATIONS = [
  "prisma/migration_v500_accounting.sql",
  "prisma/migration_v510_consent.sql",
]

// ── Run via @neondatabase/serverless or pg ──────────────────────────────────
async function run() {
  let client

  // Try @neondatabase/serverless first (already in package.json)
  try {
    const { neon } = require("@neondatabase/serverless")
    const sql = neon(DATABASE_URL)

    console.log("🔌 เชื่อมต่อ Neon PostgreSQL...")

    for (const migFile of MIGRATIONS) {
      const filePath = path.join(__dirname, migFile)
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️  ข้าม: ${migFile} (ไม่พบไฟล์)`)
        continue
      }

      const sqlContent = fs.readFileSync(filePath, "utf8")
      console.log(`\n▶️  รัน: ${migFile}`)

      // Split by semicolons and run each statement
      const statements = sqlContent
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith("--"))

      for (const stmt of statements) {
        if (!stmt.trim()) continue
        try {
          await sql(stmt)
          // Show first 60 chars of statement
          const preview = stmt.replace(/\s+/g, " ").slice(0, 60)
          console.log(`  ✅ ${preview}...`)
        } catch (err) {
          // IF NOT EXISTS errors are OK
          if (err.message.includes("already exists") || err.message.includes("does not exist")) {
            console.log(`  ⚠️  (ข้าม — มีอยู่แล้ว)`)
          } else {
            console.error(`  ❌ Error: ${err.message}`)
            console.error(`     Statement: ${stmt.slice(0, 100)}`)
          }
        }
      }
      console.log(`✅ เสร็จ: ${migFile}`)
    }

    console.log("\n🎉 Migration ทั้งหมดเสร็จสิ้น!")
    console.log("\n📌 ต่อไป รัน: npx prisma generate")

  } catch (err) {
    if (err.code === "MODULE_NOT_FOUND") {
      console.error("❌ ไม่พบ @neondatabase/serverless")
      console.error("   รัน: npm install ก่อน แล้วลองใหม่")
    } else {
      console.error("❌ Migration ล้มเหลว:", err.message)
    }
    process.exit(1)
  }
}

run()
