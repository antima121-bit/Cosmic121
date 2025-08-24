#!/bin/bash

# Mythos Engine Production Deployment Script
# This script automates the deployment process for production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="mythos-engine"
NODE_VERSION="18"
PM2_APP_NAME="mythos-engine"
DEPLOY_USER="deploy"
DEPLOY_PATH="/opt/mythos-engine"
BACKUP_PATH="/opt/backups/mythos-engine"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_MAJOR_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR_VERSION" -lt "$NODE_VERSION" ]; then
        error "Node.js version $NODE_VERSION or higher is required. Current version: $(node -v)"
    fi
    
    # Check npm/pnpm
    if ! command -v pnpm &> /dev/null && ! command -v npm &> /dev/null; then
        error "Neither pnpm nor npm is installed"
    fi
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 is not installed. Installing PM2..."
        npm install -g pm2
    fi
    
    success "Prerequisites check passed"
}

# Check environment variables
check_environment() {
    log "Checking environment variables..."
    
    if [ -z "$OPENAI_API_KEY" ]; then
        error "OPENAI_API_KEY environment variable is not set"
    fi
    
    if [ -z "$NODE_ENV" ]; then
        export NODE_ENV="production"
        warning "NODE_ENV not set, defaulting to production"
    fi
    
    success "Environment variables check passed"
}

# Create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    if [ -d "$DEPLOY_PATH" ]; then
        BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S')"
        BACKUP_FULL_PATH="$BACKUP_PATH/$BACKUP_NAME"
        
        mkdir -p "$BACKUP_PATH"
        cp -r "$DEPLOY_PATH" "$BACKUP_FULL_PATH"
        
        # Keep only last 5 backups
        cd "$BACKUP_PATH"
        ls -t | tail -n +6 | xargs -r rm -rf
        
        success "Backup created: $BACKUP_NAME"
    else
        warning "No existing deployment found, skipping backup"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd "$DEPLOY_PATH"
    
    if command -v pnpm &> /dev/null; then
        pnpm install --production
    else
        npm ci --only=production
    fi
    
    success "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$DEPLOY_PATH"
    
    if command -v pnpm &> /dev/null; then
        pnpm build
    else
        npm run build
    fi
    
    success "Application built successfully"
}

# Update PM2 process
update_pm2() {
    log "Updating PM2 process..."
    
    cd "$DEPLOY_PATH"
    
    # Stop existing process if running
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        pm2 stop "$PM2_APP_NAME"
        pm2 delete "$PM2_APP_NAME"
    fi
    
    # Start new process
    if command -v pnpm &> /dev/null; then
        pm2 start "pnpm start" --name "$PM2_APP_NAME" --cwd "$DEPLOY_PATH"
    else
        pm2 start "npm start" --name "$PM2_APP_NAME" --cwd "$DEPLOY_PATH"
    fi
    
    # Save PM2 configuration
    pm2 save
    
    success "PM2 process updated"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        success "Health check passed"
    else
        error "Health check failed - application is not responding"
    fi
}

# Main deployment function
deploy() {
    log "Starting deployment of $APP_NAME..."
    
    # Check prerequisites
    check_prerequisites
    check_environment
    
    # Create backup
    create_backup
    
    # Create deployment directory if it doesn't exist
    mkdir -p "$DEPLOY_PATH"
    
    # Copy application files
    log "Copying application files..."
    cp -r . "$DEPLOY_PATH/"
    
    # Install dependencies
    install_dependencies
    
    # Build application
    build_application
    
    # Update PM2 process
    update_pm2
    
    # Health check
    health_check
    
    success "Deployment completed successfully!"
    
    log "Application is running at: http://localhost:3000"
    log "PM2 status: pm2 status"
    log "PM2 logs: pm2 logs $PM2_APP_NAME"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Get latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_PATH" | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    # Stop current process
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        pm2 stop "$PM2_APP_NAME"
        pm2 delete "$PM2_APP_NAME"
    fi
    
    # Restore from backup
    rm -rf "$DEPLOY_PATH"
    cp -r "$BACKUP_PATH/$LATEST_BACKUP" "$DEPLOY_PATH"
    
    # Update PM2 process
    update_pm2
    
    # Health check
    health_check
    
    success "Rollback completed successfully!"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  deploy     Deploy the application"
    echo "  rollback   Rollback to previous version"
    echo "  status     Show deployment status"
    echo "  logs       Show application logs"
    echo "  help       Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  OPENAI_API_KEY    OpenAI API key (required)"
    echo "  NODE_ENV          Node environment (default: production)"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 rollback"
    echo "  $0 status"
}

# Show status
show_status() {
    log "Deployment Status:"
    echo ""
    
    if [ -d "$DEPLOY_PATH" ]; then
        echo "✅ Deployment directory exists: $DEPLOY_PATH"
        echo "📁 Size: $(du -sh "$DEPLOY_PATH" | cut -f1)"
        echo "🕒 Last modified: $(stat -c %y "$DEPLOY_PATH")"
    else
        echo "❌ Deployment directory not found: $DEPLOY_PATH"
    fi
    
    echo ""
    echo "🔄 PM2 Status:"
    pm2 list | grep "$PM2_APP_NAME" || echo "No PM2 process found"
    
    echo ""
    echo "💾 Backups:"
    if [ -d "$BACKUP_PATH" ]; then
        ls -la "$BACKUP_PATH" | tail -n +3 || echo "No backups found"
    else
        echo "No backup directory found"
    fi
}

# Show logs
show_logs() {
    log "Application Logs:"
    echo ""
    
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        pm2 logs "$PM2_APP_NAME" --lines 50
    else
        echo "No PM2 process found"
    fi
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        error "Unknown command: $1. Use 'help' for usage information."
        ;;
esac
