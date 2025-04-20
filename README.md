# Connect 4 Game

A full-stack Connect 4 game built with Flask and React.

## Project Structure

```
connect4/
├── backend/           # Flask backend
│   ├── app.py        # Main Flask application
│   ├── game_logic.py # Game logic implementation
│   └── database.py   # Database operations
└── frontend/         # React frontend
    ├── src/          # Source files
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

## Features

- Two-player Connect 4 game
- Persistent game state
- Game history tracking
- Responsive design with Tailwind CSS
- REST API for game operations 