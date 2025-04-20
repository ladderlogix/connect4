import requests
import json

API_BASE_URL = 'http://localhost:5000/api'

def test_create_game():
    print("Testing create_game endpoint...")
    response = requests.post(f"{API_BASE_URL}/games")
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()

def test_get_game(game_id):
    print(f"\nTesting get_game endpoint for game {game_id}...")
    response = requests.get(f"{API_BASE_URL}/games/{game_id}")
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()

def test_make_move(game_id, column):
    print(f"\nTesting make_move endpoint for game {game_id} in column {column}...")
    response = requests.post(f"{API_BASE_URL}/games/{game_id}/move", json={"column": column})
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()

if __name__ == "__main__":
    # Create a new game
    game_data = test_create_game()
    game_id = game_data.get('game_id')
    
    if game_id:
        # Get the game state
        game_state = test_get_game(game_id)
        
        # Make a move
        move_result = test_make_move(game_id, 3)
        
        # Get the updated game state
        updated_state = test_get_game(game_id)
        
        # Make another move
        move_result = test_make_move(game_id, 4)
        
        # Get the final game state
        final_state = test_get_game(game_id) 