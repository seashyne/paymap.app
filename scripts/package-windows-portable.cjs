const fs = require("fs")
const path = require("path")

const root = process.cwd()
const electronDist = path.join(root, "node_modules", "electron", "dist")
const releaseRoot = path.join(root, "release")
const outDir = path.join(releaseRoot, "PayMap-win-x64")
const appDir = path.join(outDir, "resources", "app")

function copyDir(from, to, options = {}) {
  if (!fs.existsSync(from)) throw new Error(`Missing required path: ${from}`)
  fs.cpSync(from, to, {
    recursive: true,
    force: true,
    filter(source) {
      const base = path.basename(source)
      if (options.skipEnv && base.startsWith(".env")) return false
      return true
    },
  })
}

function copyFile(from, to) {
  if (!fs.existsSync(from)) throw new Error(`Missing required file: ${from}`)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
}

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(releaseRoot, { recursive: true })

copyDir(electronDist, outDir)

const electronExe = path.join(outDir, "electron.exe")
const paymapExe = path.join(outDir, "PayMap.exe")
if (fs.existsSync(paymapExe)) fs.rmSync(paymapExe, { force: true })
fs.renameSync(electronExe, paymapExe)

copyDir(path.join(root, "electron"), path.join(appDir, "electron"))
copyDir(path.join(root, ".next", "standalone"), path.join(appDir, ".next", "standalone"), { skipEnv: true })
copyDir(path.join(root, ".next", "static"), path.join(appDir, ".next", "static"))
copyDir(path.join(root, "public"), path.join(appDir, "public"))
copyDir(path.join(root, "prisma"), path.join(appDir, "prisma"))
copyFile(path.join(root, "next.config.js"), path.join(appDir, "next.config.js"))
copyFile(path.join(root, "package.json"), path.join(appDir, "package.json"))

const appPackagePath = path.join(appDir, "package.json")
const appPackage = JSON.parse(fs.readFileSync(appPackagePath, "utf8"))
appPackage.main = "electron/main.cjs"
appPackage.scripts = { start: "node .next/standalone/server.js" }
fs.writeFileSync(appPackagePath, `${JSON.stringify(appPackage, null, 2)}\n`)

console.log(`PayMap portable Windows app created: ${paymapExe}`)
console.log("Open release\\PayMap-win-x64\\PayMap.exe to run the desktop app.")
