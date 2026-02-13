#!/bin/bash

# ============================================
# Seed Staff Data - PRODUCTION Database
# ============================================
# Seeds staff data from rims-staff.sql into PRODUCTION database
# Uses .env.production file for database credentials
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   Seed Staff Data - PRODUCTION Database${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Check prerequisites
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: artisan not found. Make sure you're in the backend directory.${NC}"
    exit 1
fi

if [ ! -f "rims-staff.sql" ]; then
    echo -e "${RED}❌ Error: rims-staff.sql not found.${NC}"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production not found.${NC}"
    exit 1
fi

if [ ! -f "database/seeders/SqlStaffSeeder.php" ]; then
    echo -e "${RED}❌ Error: SqlStaffSeeder.php not found.${NC}"
    exit 1
fi

# Load and display production DB info
PROD_HOST=$(grep "^DB_HOST=" .env.production | cut -d '=' -f2)
PROD_PORT=$(grep "^DB_PORT=" .env.production | cut -d '=' -f2)
PROD_DB=$(grep "^DB_DATABASE=" .env.production | cut -d '=' -f2)

echo -e "${BLUE}📁 Target: PRODUCTION database (.env.production)${NC}"
echo ""
echo "   Host:     $PROD_HOST"
echo "   Port:     $PROD_PORT"
echo "   Database: $PROD_DB"
echo ""
echo -e "${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}"
echo -e "${RED}!!  WARNING: THIS IS THE PRODUCTION DB!  !!${NC}"
echo -e "${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}"
echo ""
echo -e "${YELLOW}This will TRUNCATE all existing data in:${NC}"
echo "   - staff_education"
echo "   - staff_details"
echo "   - staff"
echo ""

read -p "Type 'SEED PRODUCTION' to confirm: " confirm
if [ "$confirm" != "SEED PRODUCTION" ]; then
    echo -e "${RED}❌ Seeding cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🔄 Clearing config cache...${NC}"
php artisan config:clear

echo ""
echo -e "${YELLOW}🚀 Running seeder on PRODUCTION...${NC}"
echo ""

APP_ENV=production php artisan db:seed --class=SqlStaffSeeder --env=production --force
# APP_ENV=production php artisan migrate:fresh --seed --env=production --force

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Production database seeded successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Seeding failed. Check the error messages above.${NC}"
    exit 1
fi
