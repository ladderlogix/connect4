import sqlite3
import json
from datetime import datetime
from config import DATABASE_PATH

class Database:
    def __init__(self, db_path=DATABASE_PATH):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        """Initialize the database with required tables."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create games table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS games (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    game_state TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE
                )
            ''')
            
            conn.commit()

    def create_game(self, game_state):
        """Create a new game and return its ID."""
        print("Creating game with state:", json.dumps(game_state, indent=2))
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            state_json = json.dumps(game_state)
            cursor.execute(
                'INSERT INTO games (game_state) VALUES (?)',
                (state_json,)
            )
            conn.commit()
            game_id = cursor.lastrowid
            print(f"Created game with ID: {game_id}")
            return game_id

    def get_game(self, game_id):
        """Retrieve a game by ID."""
        print(f"Fetching game {game_id}")
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT game_state FROM games WHERE id = ?', (game_id,))
            result = cursor.fetchone()
            
            if result:
                state = json.loads(result[0])
                print(f"Retrieved game state: {json.dumps(state, indent=2)}")
                return state
            print(f"Game {game_id} not found")
            return None

    def update_game(self, game_id, game_state):
        """Update an existing game's state."""
        print(f"Updating game {game_id} with state: {json.dumps(game_state, indent=2)}")
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            state_json = json.dumps(game_state)
            cursor.execute(
                'UPDATE games SET game_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                (state_json, game_id)
            )
            conn.commit()
            print(f"Updated game {game_id}")

    def get_active_games(self):
        """Get all active games."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, game_state, created_at, updated_at 
                FROM games 
                WHERE is_active = TRUE 
                ORDER BY updated_at DESC
            ''')
            return [(id, json.loads(state), created, updated) 
                   for id, state, created, updated in cursor.fetchall()]

    def complete_game(self, game_id):
        """Mark a game as completed."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE games SET is_active = FALSE WHERE id = ?',
                (game_id,)
            )
            conn.commit() 