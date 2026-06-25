#!/bin/bash

###############################################################################
# OpenFDA Import Helper Script
#
# Provides convenient commands for common import scenarios.
# Usage: ./scripts/import-helpers.sh <command>
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Show usage
show_usage() {
    cat << EOF
OpenFDA Import Helper Script

Usage: ./scripts/import-helpers.sh <command>

Commands:
  quick           Import 50 drugs quickly (good for testing)
  starter         Import starter dataset (100 common drugs)
  pain            Import pain relief medications (100)
  heart           Import cardiovascular medications (100)
  diabetes        Import diabetes medications (100)
  supplements     Import dietary supplements (100)
  full-drugs      Import large drug dataset (500)
  full-all        Import comprehensive dataset (1000 total)
  preview         Preview data without importing (dry run)
  category <name> Import specific category
  batch <size>    Import custom batch size
  continue <skip> Continue import from specific position

Examples:
  ./scripts/import-helpers.sh quick
  ./scripts/import-helpers.sh pain
  ./scripts/import-helpers.sh category "Mental Health"
  ./scripts/import-helpers.sh batch 200
  ./scripts/import-helpers.sh continue 500

EOF
}

# Quick import (50 drugs)
import_quick() {
    print_info "Starting quick import (50 drugs)..."
    npm run import:fda -- --limit 50
    print_success "Quick import complete!"
}

# Starter dataset (100 common drugs)
import_starter() {
    print_info "Starting starter dataset import (100 drugs)..."
    npm run import:fda -- --limit 100
    print_success "Starter dataset import complete!"
}

# Pain relief medications
import_pain() {
    print_info "Importing pain relief medications..."
    npm run import:fda -- --category "Pain Relief" --limit 100
    print_success "Pain relief medications imported!"
}

# Cardiovascular medications
import_heart() {
    print_info "Importing cardiovascular medications..."
    npm run import:fda -- --category "Cardiovascular" --limit 100
    print_success "Cardiovascular medications imported!"
}

# Diabetes medications
import_diabetes() {
    print_info "Importing diabetes medications..."
    npm run import:fda -- --category "Diabetes" --limit 100
    print_success "Diabetes medications imported!"
}

# Dietary supplements
import_supplements() {
    print_info "Importing dietary supplements..."
    npm run import:fda -- --dataset supplements --limit 100
    print_success "Dietary supplements imported!"
}

# Full drug dataset (500)
import_full_drugs() {
    print_info "Starting full drug import (500 drugs)..."
    print_warning "This will take approximately 10 minutes..."
    npm run import:fda -- --dataset drugs --limit 500
    print_success "Full drug import complete!"
}

# Comprehensive dataset (1000 total)
import_full_all() {
    print_info "Starting comprehensive import (1000 records)..."
    print_warning "This will take approximately 20 minutes..."

    print_info "Importing drugs (500)..."
    npm run import:fda -- --dataset drugs --limit 500

    print_info "Importing supplements (500)..."
    npm run import:fda -- --dataset supplements --limit 500

    print_success "Comprehensive import complete!"
}

# Preview (dry run)
import_preview() {
    print_info "Running preview (dry run)..."
    npm run import:fda:dry
}

# Import specific category
import_category() {
    if [ -z "$1" ]; then
        print_warning "Please specify a category"
        echo "Available categories:"
        echo "  - Pain Relief"
        echo "  - Cardiovascular"
        echo "  - Diabetes"
        echo "  - Respiratory"
        echo "  - Mental Health"
        echo "  - Digestive"
        echo "  - Infection"
        echo "  - Allergy"
        echo "  - Inflammation"
        echo "  - Supplement"
        exit 1
    fi

    print_info "Importing category: $1"
    npm run import:fda -- --category "$1" --limit 100
    print_success "Category import complete!"
}

# Import custom batch size
import_batch() {
    if [ -z "$1" ]; then
        print_warning "Please specify batch size"
        exit 1
    fi

    print_info "Importing $1 records..."
    npm run import:fda -- --limit "$1"
    print_success "Batch import complete!"
}

# Continue import from specific position
import_continue() {
    if [ -z "$1" ]; then
        print_warning "Please specify skip position"
        exit 1
    fi

    print_info "Continuing import from position $1..."
    npm run import:fda -- --skip "$1" --limit 100
    print_success "Continue import complete!"
}

# Check database stats
check_stats() {
    print_info "Checking database statistics..."

    if command -v sqlite3 &> /dev/null; then
        echo ""
        echo "Database Statistics:"
        echo "==================="
        sqlite3 prisma/dev.db "SELECT COUNT(*) as 'Total Pharmaceuticals' FROM Pharmaceutical;"
        sqlite3 prisma/dev.db "SELECT category, COUNT(*) as count FROM Pharmaceutical GROUP BY category ORDER BY count DESC;"
        echo ""
    else
        print_warning "sqlite3 not found. Install it to view database stats."
        print_info "You can use Prisma Studio instead: npx prisma studio"
    fi
}

# Main command router
case "${1:-}" in
    quick)
        import_quick
        ;;
    starter)
        import_starter
        ;;
    pain)
        import_pain
        ;;
    heart)
        import_heart
        ;;
    diabetes)
        import_diabetes
        ;;
    supplements)
        import_supplements
        ;;
    full-drugs)
        import_full_drugs
        ;;
    full-all)
        import_full_all
        ;;
    preview)
        import_preview
        ;;
    category)
        import_category "$2"
        ;;
    batch)
        import_batch "$2"
        ;;
    continue)
        import_continue "$2"
        ;;
    stats)
        check_stats
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
