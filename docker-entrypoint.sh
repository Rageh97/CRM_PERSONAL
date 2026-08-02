#!/bin/sh
set -e

echo "🚀 Running Database Migrations & Push..."
npx prisma db push --skip-generate

echo "🌱 Seeding Database (if required)..."
npx prisma db seed || true

echo "⚡ Starting Next.js Production Server..."
exec node server.js
