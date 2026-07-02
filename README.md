# PayMap

PayMap is a local-first private money dashboard for web and Windows.

ใช้ PayMap บนเว็บได้ แต่ประสบการณ์ที่ดีที่สุดคือแอป Windows ที่ข้อมูลอยู่กับคุณ.

PayMap is designed to feel like a focused desktop workspace: track income, expenses, cash flow, and real profit while keeping financial data on the device by default. Cloud Backup and Cloud Sync are optional paid features, not the default storage path.

## Product Direction

- Web preview + Windows app first
- Local-first financial records
- `.paymap.json` export/import backups
- Optional Cloud Backup with explicit user confirmation
- Web/PWA kept for preview, account, pricing, and support pages

## Development

```bash
bun install
bun run typecheck
bun run build
```

Preview the desktop workspace in the browser:

```bash
bun run dev
```

Open `http://localhost:3000/desktop`.

## Windows App

Run the Electron desktop shell in development:

```bash
bun run dev
bun run desktop:dev
```

Build the portable Windows app:

```bash
bun run release:windows
```

The app is created at:

```text
release/PayMap-win-x64/PayMap.exe
```

GitHub Releases are the primary distribution channel for the Windows app. Push a tag such as `v15.3.1` to build and attach `PayMap-win-x64.zip` through `.github/workflows/windows-release.yml`.
