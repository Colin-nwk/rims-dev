#!/bin/bash

# ============================================
# Seed Staff Data - LOCAL Database
# ============================================
# Seeds staff data from rims_2.sql into LOCAL database
# Uses .env file for database credentials
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
echo -e "${BLUE}   Seed Staff Data - LOCAL Database${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Check prerequisites
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: artisan not found. Make sure you're in the backend directory.${NC}"
    exit 1
fi

if [ ! -f "rims_2.sql" ]; then
    echo -e "${RED}❌ Error: rims_2.sql not found.${NC}"
    exit 1
fi

if [ ! -f "database/seeders/SqlStaffSeeder.php" ]; then
    echo -e "${RED}❌ Error: SqlStaffSeeder.php not found.${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Target: LOCAL database (.env)${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will TRUNCATE all existing data in:${NC}"
echo "   - staff_education"
echo "   - staff_details"
echo "   - staff"
echo ""

read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Seeding cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🚀 Running seeder...${NC}"
echo ""

php artisan db:seed --class=SqlStaffSeeder

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Local database seeded successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Seeding failed. Check the error messages above.${NC}"
    exit 1
fi
