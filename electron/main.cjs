const { app, BrowserWindow, Menu, shell } = require("electron")
const { spawn } = require("child_process")
const http = require("http")
const net = require("net")
const path = require("path")

const isDev = process.argv.includes("--dev") || process.env.NODE_ENV === "development"
let nextProcess = null

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on("error", reject)
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      server.close(() => resolve(address.port))
    })
  })
}

function waitForServer(url, timeoutMs = 45000) {
  const startedAt = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      const request = http.get(url, (response) => {
        response.resume()
        if (response.statusCode && response.statusCode < 500) {
          resolve()
          return
        }
        retry()
      })
      request.on("error", retry)
      request.setTimeout(2500, () => {
        request.destroy()
        retry()
      })
    }
    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`PayMap desktop server did not start: ${url}`))
        return
      }
      setTimeout(tick, 650)
    }
    tick()
  })
}

async function startNextServer() {
  if (process.env.PAYMAP_DESKTOP_URL) return process.env.PAYMAP_DESKTOP_URL

  const port = process.env.PAYMAP_DESKTOP_PORT || String(await findFreePort())
  const appPath = app.getAppPath()
  const url = `http://127.0.0.1:${port}/desktop`
  const args = isDev
    ? [path.join(appPath, "node_modules", "next", "dist", "bin", "next"), "dev", "-p", port, "-H", "127.0.0.1"]
    : [path.join(appPath, ".next", "standalone", "server.js")]

  nextProcess = spawn(process.execPath, args, {
    cwd: appPath,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: isDev ? "development" : "production",
      PAYMAP_DESKTOP: "1",
      PORT: port,
      HOSTNAME: "127.0.0.1",
    },
    stdio: isDev ? "inherit" : "ignore",
    windowsHide: true,
  })

  nextProcess.on("exit", (code) => {
    if (code && code !== 0) console.error(`PayMap desktop server exited with code ${code}`)
  })

  await waitForServer(url)
  return url
}

async function createWindow() {
  const startUrl = await startNextServer()
  const win = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1120,
    minHeight: 720,
    title: "PayMap Desktop",
    backgroundColor: "#191919",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.once("ready-to-show", () => win.show())
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })
  await win.loadURL(startUrl)
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null)
  await createWindow()
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

app.on("before-quit", () => {
  if (nextProcess && !nextProcess.killed) nextProcess.kill()
})
