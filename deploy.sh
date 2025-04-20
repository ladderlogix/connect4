#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Create deployment directory if it doesn't exist
echo "Creating deployment directory..."
sudo mkdir -p /var/www/c4.joyce.red

# Copy frontend build to deployment directory
echo "Copying frontend build to deployment directory..."
sudo cp -r dist/* /var/www/c4.joyce.red/

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/c4.joyce.red
sudo chmod -R 755 /var/www/c4.joyce.red

# Setup backend
echo "Setting up backend..."
cd ../backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt
pip install gunicorn

# Set environment variables
echo "Setting environment variables..."
export FLASK_ENV=production
export HOST=0.0.0.0
export PORT=5000
export LOG_LEVEL=INFO

# Restart backend service
echo "Restarting backend service..."
sudo systemctl restart connect4-backend || echo "Service not found, skipping restart"

# Setup SSL if needed
if [ ! -d "/etc/letsencrypt/live/c4.joyce.red" ]; then
    echo "SSL certificates not found. Please run:"
    echo "sudo certbot --nginx -d c4.joyce.red"
fi

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment completed successfully!" 