#!/bin/sh
set -e

echo "Running migrations..."
pnpm db:deploy

echo "Seeding database..."
pnpm db:seed

echo "Starting server..."
node dist/src/main.js
