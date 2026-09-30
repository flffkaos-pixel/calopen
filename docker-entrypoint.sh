#!/bin/sh
# Docker entrypoint: wait for Postgres, run migrations, start Next.js.
set -e

echo "Running database migrations..."
node scripts/migrate.mjs

echo "Starting CalOpen..."
exec node server.js
