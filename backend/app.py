from flask import Flask, request, jsonify
from flask_cors import CORS
from game_logic import Connect4Game
from database import Database
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

db = Database()

@app.route('/api/games', methods=['POST'])
def create_game():
    """Create a new game."""
    logger.info("Creating new game")
    game = Connect4Game()
    game_state = game.get_state()
    game_id = db.create_game(game_state)
    logger.info(f"Game created with ID: {game_id}")
    logger.info(f"Game state: {json.dumps(game_state, indent=2)}")
    return jsonify({
        'id': game_id,
        'state': game_state
    })

@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Get game state."""
    logger.info(f"Fetching game state for game ID: {game_id}")
    game_state = db.get_game(game_id)
    if game_state is None:
        logger.warning(f"Game not found with ID: {game_id}")
        return jsonify({'error': 'Game not found'}), 404
    
    logger.info(f"Game state: {json.dumps(game_state, indent=2)}")
    return jsonify({
        'id': game_id,
        'state': game_state
    })

@app.route('/api/games/<int:game_id>/move', methods=['POST'])
def make_move(game_id):
    """Make a move in the game."""
    logger.info(f"Attempting move for game ID: {game_id}")
    game_state = db.get_game(game_id)
    if game_state is None:
        logger.warning(f"Game not found with ID: {game_id}")
        return jsonify({'error': 'Game not found'}), 404

    data = request.get_json()
    if not data or 'column' not in data:
        logger.warning(f"Invalid move data received: {data}")
        return jsonify({'error': 'Column not specified'}), 400

    game = Connect4Game(game_id)
    game.load_state(game_state)
    
    logger.info(f"Making move in column {data['column']} for game ID: {game_id}")
    success, message = game.make_move(data['column'])
    if success:
        new_state = game.get_state()
        logger.info(f"New game state after move: {json.dumps(new_state, indent=2)}")
        db.update_game(game_id, new_state)
        
        if game.game_over:
            logger.info(f"Game {game_id} is over. Winner: {game.winner}")
            db.complete_game(game_id)
            
        return jsonify({
            'id': game_id,
            'state': new_state,
            'message': message
        })
    
    logger.warning(f"Move failed: {message}")
    return jsonify({
        'id': game_id,
        'state': game.get_state(),
        'error': message
    })

@app.route('/api/games', methods=['GET'])
def list_games():
    """Get list of active games."""
    games = db.get_active_games()
    return jsonify([{
        'id': game_id,
        'state': state,
        'created_at': created_at,
        'updated_at': updated_at
    } for game_id, state, created_at, updated_at in games])

if __name__ == '__main__':
    app.run(debug=True) 