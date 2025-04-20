import os

# Environment configuration
ENV = os.environ.get('FLASK_ENV', 'development')
DEBUG = ENV == 'development'

# Server configuration
HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', 5000))

# CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative dev server
    "https://c4.joyce.red"    # Production domain
]

# Database configuration
DATABASE_PATH = os.environ.get('DATABASE_PATH', 'connect4.db')

# Logging configuration
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO') 