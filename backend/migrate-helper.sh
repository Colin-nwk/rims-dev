#!/bin/bash

# RIMS Migration Helper Script
# Quick commands for common migration tasks

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     RIMS DATA MIGRATION HELPER                    ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if artisan exists
check_artisan() {
    if [ ! -f "artisan" ]; then
        print_error "artisan file not found. Please run this script from your Laravel root directory."
        exit 1
    fi
}

# Main menu
show_menu() {
    print_header
    echo "Select an option:"
    echo ""
    echo "  1) Check migration statistics"
    echo "  2) Test migration (100 records)"
    echo "  3) Migrate all records (with confirmation)"
    echo "  4) Migrate in batches (5,000 at a time)"
    echo "  5) Resume interrupted migration"
    echo "  6) Verify migrated data"
    echo "  7) View recent errors"
    echo "  8) Clear test data (CAUTION!)"
    echo "  9) Optimize database after migration"
    echo "  0) Exit"
    echo ""
    read -p "Enter your choice [0-9]: " choice
    
    case $choice in
        1) check_stats ;;
        2) test_migration ;;
        3) full_migration ;;
        4) batch_migration ;;
        5) resume_migration ;;
        6) verify_data ;;
        7) view_errors ;;
        8) clear_test_data ;;
        9) optimize_database ;;
        0) exit 0 ;;
        *) 
            print_error "Invalid option"
            sleep 2
            show_menu
            ;;
    esac
}

# Option 1: Check statistics
check_stats() {
    print_info "Fetching migration statistics..."
    echo ""
    # php artisan rims:migrate --stats
     php artisan app:migrate-rims-data-command --stats
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Option 2: Test migration
test_migration() {
    print_warning "This will migrate 100 test records"
    read -p "Continue? (y/n): " confirm
    
    if [ "$confirm" == "y" ]; then
        print_info "Starting test migration..."

         php artisan  app:migrate-rims-data-command --limit=100 --batch-size=50
       
        # php artisan rims:migrate --limit=100 --batch-size=50
        print_success "Test completed!"
        echo ""
        print_info "To clear test data, use option 8 from the main menu"
    fi
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Option 3: Full migration
full_migration() {
    print_warning "This will migrate ALL pending records from old RIMS database"
    echo ""
    # php artisan rims:migrate --stats
      php artisanapp:migrate-rims-data-command --stats
    echo ""
    read -p "Do you want to proceed? (yes/no): " confirm
    
    if [ "$confirm" == "yes" ]; then
        print_info "Starting full migration..."
        print_warning "This may take 2-4 hours for 50K records"
        echo ""
        read -p "Run in screen session? (recommended) (y/n): " use_screen
        
        if [ "$use_screen" == "y" ]; then
            print_info "Starting migration in screen session 'rims-migration'"
            print_info "Use 'screen -r rims-migration' to reattach"
            screen -dmS rims-migration bash -c "php artisan rims:migrate --batch-size=250 --no-interaction; echo 'Migration completed. Press Enter to exit.'; read"
            print_success "Migration started in background screen session"
            print_info "To monitor: screen -r rims-migration"
        else
            # php artisan rims:migrate --batch-size=250
             php artisan app:migrate-rims-data-command --batch-size=250
        fi
    fi
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Option 4: Batch migration
batch_migration() {
    print_info "Migrating in batches of 5,000 records"
    echo ""
    php artisan app:migrate-rims-data-command --stats
    echo ""
    
    read -p "How many batches do you want to run? (0 for all): " num_batches
    
    if [ "$num_batches" == "0" ]; then
        # Calculate total batches needed
        print_info "Calculating total batches needed..."
        num_batches=10  # Default for 50K records
    fi
    
    for ((i=0; i<$num_batches; i++)); do
        offset=$((i * 5000))
        print_info "Processing batch $((i+1))/$num_batches (offset: $offset)"
        php artisan rims:migrate --limit=5000 --offset=$offset --batch-size=250
        print_success "Batch $((i+1)) completed"
        sleep 2
    done
    
    print_success "All batches completed!"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Option 5: Resume migration
resume_migration() {
    print_info "Checking current progress..."
    # php artisan rims:migrate --stats
     php artisan app:migrate-rims-data-command --stats
    echo ""
    
    read -p "Enter offset to resume from (or 'auto' to detect): " offset
    
    if [ "$offset" == "auto" ]; then
        # Detect offset automatically (count current records)
        offset=$(php artisan tinker --execute="echo App\\Models\\Staff::count();")
        print_info "Detected offset: $offset"
    fi
    
    read -p "Resume from offset $offset? (y/n): " confirm
    
    if [ "$confirm" == "y" ]; then
        print_info "Resuming migration from offset $offset..."
        # php artisan rims:migrate --offset=$offset --batch-size=250
         php artisan app:migrate-rims-data-command --offset=$offset --batch-size=250
        print_success "Migration resumed and completed!"
    fi
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Option 6: Verify data
verify_data() {
    print_info "Running data verification checks..."
    echo ""
    
    php artisan tinker --execute="
        \$oldCount = DB::connection('rims_old')->table('staff')->where('deleted', 0)->count();
        \$newCount = App\\Models\\Staff::count();
        echo 'Old Database: ' . number_format(\$oldCount) . ' records\n';
        echo 'New Database: ' . number_format(\$newCount) . ' records\n';
        echo 'Match: ' . (\$oldCount === \$newCount ? 'YES ✓' : 'NO ✗') . '\n';
        echo '\n';
        echo 'Staff Details: ' . number_format(App\\Models\\StaffDetail::count()) . ' records\n';
        echo 'Staff Education: ' . number_format(App\\Models\\StaffEducation::count()) . ' records\n';
        echo '\n';
        \$orphanedDetails = App\\Models\\StaffDetail::whereNotIn('service_no', App\\Models\\Staff::pluck('service_no'))->count();
        \$orphanedEducation = App\\Models\\StaffEducation::whereNotIn('service_no', App\\Models\\Staff::pluck('service_no'))->count();
        echo 'Orphaned Details: ' . \$orphanedDetails . ' (should be 0)\n';
        echo 'Orphaned Education: ' . \$orphanedEducation . ' (should be 0)\n';
    "
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Option 7: View errors
view_errors() {
    print_info "Showing recent migration errors..."
    echo ""
    
    if [ -f "storage/logs/laravel.log" ]; then
        grep "Failed to migrate staff" storage/logs/laravel.log | tail -20
        echo ""
        error_count=$(grep -c "Failed to migrate staff" storage/logs/laravel.log || echo "0")
        print_info "Total errors found: $error_count"
    else
        print_warning "No log file found"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Option 8: Clear test data
clear_test_data() {
    print_warning "⚠️  CAUTION: This will DELETE all migrated data!"
    echo ""
    read -p "Type 'DELETE ALL DATA' to confirm: " confirm
    
    if [ "$confirm" == "DELETE ALL DATA" ]; then
        print_info "Clearing all migrated data..."
        php artisan tinker --execute="
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            DB::table('staff_education')->truncate();
            DB::table('staff_details')->truncate();
            DB::table('staff')->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            echo 'All data cleared!\n';
        "
        print_success "Data cleared successfully"
    else
        print_info "Cancelled - no data was deleted"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Option 9: Optimize database
optimize_database() {
    print_info "Optimizing database tables..."
    echo ""
    
    php artisan tinker --execute="
        DB::statement('OPTIMIZE TABLE staff');
        echo 'Optimized: staff\n';
        DB::statement('OPTIMIZE TABLE staff_details');
        echo 'Optimized: staff_details\n';
        DB::statement('OPTIMIZE TABLE staff_education');
        echo 'Optimized: staff_education\n';
    "
    
    print_success "Database optimization completed!"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Main execution
check_artisan
show_menu
