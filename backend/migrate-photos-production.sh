#!/bin/bash

# ============================================
# Migrate Staff Photos - PRODUCTION (Cloudflare R2)
# ============================================
# Uploads photos from ./pictures to the R2 bucket and updates the
# `photo` column of staff records in the PRODUCTION database.
# Uses .env.production for database and R2 credentials.
#
# Usage:
#   ./migrate-photos-production.sh              # run migration
#   ./migrate-photos-production.sh --dry-run    # preview only
#   ./migrate-photos-production.sh --limit=50   # extra args are passed through
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENV_FILE=".env.production"

# Read a value from .env.production (strips surrounding quotes)
env_val() {
    grep "^$1=" "$ENV_FILE" | head -n1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r'
}

echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   Migrate Staff Photos - PRODUCTION${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Check prerequisites
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: artisan not found. Make sure you're in the backend directory.${NC}"
    exit 1
fi

if [ ! -d "pictures" ]; then
    echo -e "${RED}❌ Error: pictures/ directory not found.${NC}"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $ENV_FILE not found.${NC}"
    exit 1
fi

for var in DB_HOST DB_DATABASE R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET R2_ENDPOINT; do
    if [ -z "$(env_val $var)" ]; then
        echo -e "${RED}❌ Error: $var is not set in $ENV_FILE.${NC}"
        exit 1
    fi
done

PHOTO_COUNT=$(find pictures -maxdepth 1 -type f -iname '*.jpg' | wc -l | tr -d ' ')

echo -e "${BLUE}📁 Target: PRODUCTION ($ENV_FILE)${NC}"
echo ""
echo "   DB Host:   $(env_val DB_HOST)"
echo "   DB Port:   $(env_val DB_PORT)"
echo "   Database:  $(env_val DB_DATABASE)"
echo "   R2 Bucket: $(env_val R2_BUCKET)"
echo "   Photos:    $PHOTO_COUNT files in pictures/"
echo ""

DRY_RUN=false
for arg in "$@"; do
    if [ "$arg" = "--dry-run" ]; then DRY_RUN=true; fi
done

if [ "$DRY_RUN" = false ]; then
    echo -e "${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}"
    echo -e "${RED}!!  WARNING: THIS IS THE PRODUCTION DB!  !!${NC}"
    echo -e "${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}"
    echo ""
    echo -e "${YELLOW}This will upload photos to R2 and update staff.photo in the database.${NC}"
    echo ""

    read -p "Type 'MIGRATE PHOTOS' to confirm: " confirm
    if [ "$confirm" != "MIGRATE PHOTOS" ]; then
        echo -e "${RED}❌ Photo migration cancelled.${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${YELLOW}🔄 Clearing config cache...${NC}"
php artisan config:clear

echo ""
echo -e "${YELLOW}🚀 Migrating photos to R2...${NC}"
echo ""

APP_ENV=production php artisan staff:migrate-photos --env=production --disk=r2 --force "$@"

echo ""
echo -e "${GREEN}✅ Done.${NC}"
