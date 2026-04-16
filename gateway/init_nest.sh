#!/bin/sh
set -e

echo "Waiting for database..."

npx prisma migrate deploy

echo "Database migration completed"
echo "Starting application..."

exec node dist/src/main.js