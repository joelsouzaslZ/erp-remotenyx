#!/bin/bash

# ERP Remotenyx - Docker Management Script
# This script helps manage the ERP system using Docker containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project information
PROJECT_NAME="ERP Remotenyx"
VERSION="2.0.0"

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "======================================"
    echo "  $PROJECT_NAME - Docker Manager"
    echo "  Version: $VERSION"
    echo "======================================"
    echo -e "${NC}"
}

# Print usage information
print_usage() {
    echo -e "${YELLOW}Usage: $0 [COMMAND]${NC}"
    echo ""
    echo "Commands:"
    echo "  dev          Start development environment"
    echo "  prod         Start production environment"
    echo "  stop         Stop all containers"
    echo "  restart      Restart all containers"
    echo "  logs         Show logs from all containers"
    echo "  clean        Clean up containers and volumes"
    echo "  build        Build all container images"
    echo "  status       Show status of all containers"
    echo "  backup       Backup database"
    echo "  restore      Restore database from backup"
    echo "  setup        Initial setup for the project"
    echo "  help         Show this help message"
    echo ""
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        echo "Please install Docker and try again"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}Error: Docker is not running${NC}"
        echo "Please start Docker and try again"
        exit 1
    fi
}

# Start development environment
start_dev() {
    echo -e "${GREEN}Starting development environment...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
    echo -e "${GREEN}Development environment started!${NC}"
    echo ""
    echo "Services available at:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:5000"
    echo "  - PostgreSQL: localhost:5433"
    echo "  - pgAdmin: http://localhost:5050"
    echo "  - Redis: localhost:6379"
    echo "  - Mailhog: http://localhost:8025"
}

# Start production environment
start_prod() {
    echo -e "${GREEN}Starting production environment...${NC}"
    docker-compose --profile production up -d
    echo -e "${GREEN}Production environment started!${NC}"
    echo ""
    echo "Services available at:"
    echo "  - Application: http://localhost"
    echo "  - PostgreSQL: localhost:5433"
    echo "  - Redis: localhost:6379"
}

# Stop all containers
stop_containers() {
    echo -e "${YELLOW}Stopping all containers...${NC}"
    docker-compose -f docker-compose.yml down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    echo -e "${GREEN}All containers stopped!${NC}"
}

# Restart containers
restart_containers() {
    echo -e "${YELLOW}Restarting containers...${NC}"
    stop_containers
    sleep 2
    if [ "$1" == "dev" ]; then
        start_dev
    else
        start_prod
    fi
}

# Show logs
show_logs() {
    echo -e "${BLUE}Showing logs (Press Ctrl+C to exit)...${NC}"
    if docker-compose -f docker-compose.dev.yml ps -q 2>/dev/null | grep -q .; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Clean up containers and volumes
clean_up() {
    echo -e "${YELLOW}Cleaning up containers and volumes...${NC}"
    read -p "This will remove all containers, networks, and volumes. Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop_containers
        docker-compose -f docker-compose.yml down -v --remove-orphans 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
        docker system prune -f
        echo -e "${GREEN}Cleanup completed!${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled${NC}"
    fi
}

# Build container images
build_images() {
    echo -e "${YELLOW}Building container images...${NC}"
    docker-compose build --no-cache
    docker-compose -f docker-compose.dev.yml build --no-cache
    echo -e "${GREEN}Images built successfully!${NC}"
}

# Show container status
show_status() {
    echo -e "${BLUE}Container Status:${NC}"
    echo ""
    if docker-compose -f docker-compose.dev.yml ps -q 2>/dev/null | grep -q .; then
        echo -e "${YELLOW}Development Environment:${NC}"
        docker-compose -f docker-compose.dev.yml ps
    fi
    
    if docker-compose ps -q 2>/dev/null | grep -q .; then
        echo -e "${YELLOW}Production Environment:${NC}"
        docker-compose ps
    fi
    
    if ! docker-compose -f docker-compose.dev.yml ps -q 2>/dev/null | grep -q . && ! docker-compose ps -q 2>/dev/null | grep -q .; then
        echo -e "${YELLOW}No containers are currently running${NC}"
    fi
}

# Backup database
backup_database() {
    echo -e "${YELLOW}Creating database backup...${NC}"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker-compose -f docker-compose.dev.yml ps postgres-dev &>/dev/null; then
        CONTAINER="erp-postgres-dev"
        DATABASE="erp_remotenyx_dev"
    else
        CONTAINER="erp-postgres"
        DATABASE="erp_remotenyx"
    fi
    
    docker exec $CONTAINER pg_dump -U erp_admin $DATABASE > $BACKUP_FILE
    echo -e "${GREEN}Database backup created: $BACKUP_FILE${NC}"
}

# Restore database
restore_database() {
    echo -e "${YELLOW}Restoring database from backup...${NC}"
    read -p "Enter backup file path: " BACKUP_FILE
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Backup file not found${NC}"
        exit 1
    fi
    
    if docker-compose -f docker-compose.dev.yml ps postgres-dev &>/dev/null; then
        CONTAINER="erp-postgres-dev"
        DATABASE="erp_remotenyx_dev"
    else
        CONTAINER="erp-postgres"
        DATABASE="erp_remotenyx"
    fi
    
    docker exec -i $CONTAINER psql -U erp_admin $DATABASE < $BACKUP_FILE
    echo -e "${GREEN}Database restored successfully!${NC}"
}

# Initial setup
setup_project() {
    echo -e "${GREEN}Setting up ERP Remotenyx project...${NC}"
    
    # Create necessary directories
    mkdir -p uploads logs database
    
    # Create environment file if it doesn't exist
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Creating .env file...${NC}"
        cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=erp_remotenyx
DB_USER=erp_admin
DB_PASSWORD=admin123

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Environment
NODE_ENV=development

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# pgAdmin Configuration
PGADMIN_PASSWORD=admin123
EOF
        echo -e "${GREEN}.env file created!${NC}"
    fi
    
    echo -e "${GREEN}Project setup completed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run '$0 dev' to start development environment"
    echo "  2. Visit http://localhost:3000 to access the application"
    echo "  3. Visit http://localhost:5050 to access pgAdmin"
}

# Main script logic
main() {
    print_banner
    check_docker
    
    case ${1:-help} in
        "dev")
            start_dev
            ;;
        "prod")
            start_prod
            ;;
        "stop")
            stop_containers
            ;;
        "restart")
            restart_containers ${2:-prod}
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            clean_up
            ;;
        "build")
            build_images
            ;;
        "status")
            show_status
            ;;
        "backup")
            backup_database
            ;;
        "restore")
            restore_database
            ;;
        "setup")
            setup_project
            ;;
        "help"|*)
            print_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"