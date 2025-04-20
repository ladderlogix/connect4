# Connect 4 Game

A full-stack Connect 4 game built with Flask and React.

## Project Structure

```
connect4/
├── backend/           # Flask backend
│   ├── app.py        # Main Flask application
│   ├── game_logic.py # Game logic implementation
│   ├── database.py   # Database operations
│   └── config.py     # Backend configuration
└── frontend/         # React frontend
    ├── src/          # Source files
    │   ├── config.ts # Frontend configuration
    ├── public/       # Static files
    └── package.json  # Dependencies
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python app.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Deployment

### Backend Deployment

1. Set up environment variables:
```bash
export FLASK_ENV=production
export HOST=0.0.0.0
export PORT=5000
export LOG_LEVEL=INFO
```

2. Run with a production WSGI server (e.g., Gunicorn):
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. Set up a reverse proxy (e.g., Nginx) to handle HTTPS and forward requests to the Flask app.

### Frontend Deployment

1. Build the production version:
```bash
cd frontend
npm run build
```

2. Deploy the contents of the `dist` directory to your web server.

3. Configure your web server to serve the static files and handle client-side routing.

### Domain Configuration

1. Point your domain (e.g., c4.joyce.red) to your server's IP address.

2. Set up SSL certificates using Let's Encrypt or a similar service.

3. Configure your reverse proxy to handle HTTPS traffic and forward API requests to the backend.

## Features

- Two-player Connect 4 game
- Persistent game state
- Game history tracking
- Responsive design with Tailwind CSS
- REST API for game operations
- WebSocket support for real-time updates 