#!/bin/bash
# This script will be run after you set up Vercel Postgres

echo "Fetching production DATABASE_URL from Vercel..."
export PROD_DATABASE_URL=$(vercel env pull .env.production --yes 2>/dev/null && grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2- | tr -d '"')

if [ -z "$PROD_DATABASE_URL" ]; then
  echo "❌ Could not fetch DATABASE_URL from Vercel"
  echo "Please run: vercel env pull .env.production"
  echo "Then manually set: export DATABASE_URL=\$POSTGRES_PRISMA_URL"
  exit 1
fi

echo "✅ Got production DATABASE_URL"
echo "Running Prisma migrations on production database..."

# Use the non-pooling URL for migrations
export DATABASE_URL=$(echo "$PROD_DATABASE_URL" | sed 's/pgbouncer=true/pgbouncer=false/g' | sed 's/-pooler//g')

npx prisma migrate deploy

echo "✅ Database migrations complete!"
