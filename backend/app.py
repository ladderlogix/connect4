from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from game_logic import Connect4Game
from database import Database
import logging
import json
import os
from config import ALLOWED_ORIGINS, DEBUG, HOST, PORT, LOG_LEVEL

# Configure logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL))
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS configuration
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})
socketio = SocketIO(app, cors_allowed_origins=ALLOWED_ORIGINS)

db = Database()

# Store active game rooms
active_rooms = {}

@app.route('/api/games', methods=['POST'])
def create_game():
    """Create a new game."""
    logger.info("Creating new game")
    game = Connect4Game()
    game_state = game.get_state()
    game_id = db.create_game(game_state)
    logger.info(f"Game created with ID: {game_id}")
    logger.info(f"Game state: {json.dumps(game_state, indent=2)}")
    
    # Create a room for this game
    room = f"game_{game_id}"
    active_rooms[game_id] = room
    
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
    
    # Ensure the game state has the correct structure
    if not isinstance(game_state, dict):
        logger.error(f"Invalid game state structure: {game_state}")
        return jsonify({'error': 'Invalid game state structure'}), 500
    
    if 'board' not in game_state:
        logger.error(f"Game state missing board: {game_state}")
        return jsonify({'error': 'Game state missing board'}), 500
    
    # Ensure the board is properly structured
    if not isinstance(game_state['board'], list) or len(game_state['board']) == 0:
        logger.error(f"Invalid board structure: {game_state['board']}")
        return jsonify({'error': 'Invalid board structure'}), 500
    
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
        
        # Emit the updated game state to all clients in the game room
        room = active_rooms.get(game_id)
        if room:
            socketio.emit('game_updated', {
                'id': game_id,
                'state': new_state
            }, room=room)
            
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

# WebSocket events
@socketio.on('connect')
def handle_connect():
    logger.info("Client connected")
    emit('connected', {'data': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info("Client disconnected")

@socketio.on('join_game')
def handle_join_game(data):
    game_id = data.get('game_id')
    if game_id:
        room = active_rooms.get(game_id)
        if room:
            join_room(room)
            logger.info(f"Client joined game room: {room}")
            emit('joined_game', {'game_id': game_id, 'room': room})
            
            # Send current game state to the newly joined client
            game_state = db.get_game(game_id)
            if game_state:
                logger.info(f"Sending game state to client: {json.dumps(game_state, indent=2)}")
                emit('game_updated', {
                    'id': game_id,
                    'state': game_state
                })
            else:
                logger.warning(f"Game {game_id} not found when client joined")
                emit('error', {'message': 'Game not found'})
        else:
            logger.warning(f"Game room not found for game ID: {game_id}")
            emit('error', {'message': 'Game not found'})
    else:
        emit('error', {'message': 'Game ID not provided'})

@socketio.on('leave_game')
def handle_leave_game(data):
    game_id = data.get('game_id')
    if game_id:
        room = active_rooms.get(game_id)
        if room:
            leave_room(room)
            logger.info(f"Client left game room: {room}")
            emit('left_game', {'game_id': game_id, 'room': room})

if __name__ == '__main__':
    socketio.run(app, host=HOST, port=PORT, debug=DEBUG) 