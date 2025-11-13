#!/bin/bash

# 🚀 Circlo Social - Production Deployment Script
# This script helps you deploy to various platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Circlo Social - Production Deployment${NC}\n"

# Function to print step
print_step() {
    echo -e "${BLUE}→${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

print_success "Node.js $(node --version) found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "npm $(npm --version) found"

# Menu
echo -e "\n${YELLOW}Select deployment platform:${NC}\n"
echo "1) Vercel"
echo "2) Netlify"
echo "3) Docker"
echo "4) Manual build only"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_netlify
        ;;
    3)
        deploy_docker
        ;;
    4)
        build_only
        ;;
    5)
        print_success "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Function to deploy to Vercel
deploy_vercel() {
    print_step "Preparing for Vercel deployment...\n"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Check for .env.production
    if [ ! -f ".env.production" ]; then
        print_warning "No .env.production file found!"
        read -p "Continue anyway? (y/n): " -n 1 -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Build
    print_step "Building for production..."
    npm run build
    print_success "Build completed"
    
    # Deploy
    print_step "Deploying to Vercel..."
    if [ "$1" == "prod" ]; then
        vercel deploy --prod
    else
        vercel deploy
    fi
    
    print_success "Deployment complete!"
}

# Function to deploy to Netlify
deploy_netlify() {
    print_step "Preparing for Netlify deployment...\n"
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    # Check for .env.production
    if [ ! -f ".env.production" ]; then
        print_warning "No .env.production file found!"
        read -p "Continue anyway? (y/n): " -n 1 -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Build
    print_step "Building for production..."
    npm run build
    print_success "Build completed"
    
    # Deploy
    print_step "Deploying to Netlify..."
    read -p "Deploy to production? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        netlify deploy --prod --dir=dist
    else
        netlify deploy --dir=dist
    fi
    
    print_success "Deployment complete!"
}

# Function to deploy with Docker
deploy_docker() {
    print_step "Preparing Docker deployment...\n"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    print_success "Docker $(docker --version) found"
    
    # Get registry info
    read -p "Docker registry (docker.io/myusername): " registry
    registry=${registry:-docker.io/myusername}
    
    read -p "Image name (circlo-social): " image_name
    image_name=${image_name:-circlo-social}
    
    read -p "Image tag (latest): " image_tag
    image_tag=${image_tag:-latest}
    
    full_image="${registry}/${image_name}:${image_tag}"
    
    print_step "Building Docker image: ${full_image}"
    
    # Check for environment variables
    if [ ! -f ".env.production" ]; then
        print_error "No .env.production file found!"
        print_step "Creating .env.production from .env.production.example..."
        if [ ! -f ".env.production.example" ]; then
            print_error ".env.production.example not found"
            exit 1
        fi
        cp .env.production.example .env.production
        print_warning "Please edit .env.production and fill in your values"
        exit 1
    fi
    
    # Load environment variables
    set -a
    source .env.production
    set +a
    
    # Build Docker image
    docker build \
        --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
        --build-arg VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
        --build-arg VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
        --build-arg VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET" \
        --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
        --build-arg VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
        --build-arg VITE_FIREBASE_DATABASE_URL="$VITE_FIREBASE_DATABASE_URL" \
        --build-arg VITE_CLERK_PUBLISHABLE_KEY="$VITE_CLERK_PUBLISHABLE_KEY" \
        --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" \
        --build-arg VITE_APP_URL="$VITE_APP_URL" \
        -t "$full_image" \
        .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
        
        read -p "Push to registry? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_step "Pushing to registry..."
            docker push "$full_image"
            print_success "Image pushed successfully"
            echo -e "\n${GREEN}Image: ${full_image}${NC}"
            echo -e "${YELLOW}Next steps:${NC}"
            echo "1. Deploy using: docker run -p 3000:3000 $full_image"
            echo "2. Or use docker-compose.yml for full stack deployment"
        fi
    else
        print_error "Docker build failed"
        exit 1
    fi
}

# Function to build only
build_only() {
    print_step "Building for production...\n"
    
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build completed!"
        echo -e "\n${YELLOW}Build output:${NC}"
        du -sh dist/
        echo -e "\n${BLUE}Next steps:${NC}"
        echo "1. Run 'npm run preview' to test the build locally"
        echo "2. Upload the 'dist' folder to your hosting provider"
        echo "3. Or use one of the deployment scripts"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Quality checks before deployment
pre_deploy_checks() {
    print_step "Running pre-deployment checks...\n"
    
    print_step "Linting..."
    npm run lint
    
    print_step "Type checking..."
    npm run typecheck
    
    print_step "Building..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "All checks passed!"
    else
        print_error "Pre-deployment checks failed"
        exit 1
    fi
}

# Run pre-deploy checks
pre_deploy_checks
