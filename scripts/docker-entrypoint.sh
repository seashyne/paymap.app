#!/bin/sh
set -e

echo "[paymap] waiting for database..."
until node -e "const u = new URL(process.env.DATABASE_URL); const net = require('net'); const s = net.connect({host:u.hostname, port:Number(u.port||5432)},()=>{s.end(); process.exit(0)}); s.on('error',()=>process.exit(1));"; do
  sleep 2
done

echo "[paymap] running prisma generate"
npx prisma generate >/dev/null 2>&1 || true

echo "[paymap] running prisma migrate deploy"
npx prisma migrate deploy

echo "[paymap] starting app"
exec npm run start
