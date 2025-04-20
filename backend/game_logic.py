import json

class Connect4Game:
    def __init__(self, game_id=None):
        self.game_id = game_id
        # Initialize board with None values
        self.board = [[None for _ in range(7)] for _ in range(6)]  # 6 rows, 7 columns
        self.current_player = 1  # Player 1 starts
        self.game_over = False
        self.winner = None
        self.move_history = []
        print("Initialized new game with board:", json.dumps(self.board, indent=2))

    def make_move(self, column):
        """
        Make a move in the specified column.
        Returns (success, message) tuple.
        """
        if self.game_over:
            return False, "Game is already over"

        if not 0 <= column < 7:
            return False, "Invalid column"

        # Find the lowest empty row in the specified column
        for row in range(5, -1, -1):
            if self.board[row][column] is None:
                self.board[row][column] = self.current_player
                self.move_history.append((column, self.current_player))
                print(f"Made move at row {row}, column {column}: Player {self.current_player}")
                print("Current board state:", json.dumps(self.board, indent=2))
                
                if self._check_win(row, column):
                    self.game_over = True
                    self.winner = self.current_player
                    return True, f"Player {self.current_player} wins!"
                
                if self._is_board_full():
                    self.game_over = True
                    self.winner = 0  # Draw
                    return True, "Game ended in a draw!"

                self.current_player = 3 - self.current_player  # Switch between 1 and 2
                return True, f"Move made by Player {self.current_player}"

        return False, "Column is full"

    def _check_win(self, row, col):
        """Check if the last move resulted in a win."""
        player = self.board[row][col]
        
        # Check horizontal
        for c in range(4):
            if col - c >= 0 and col - c + 3 < 7:
                if all(self.board[row][col - c + i] == player for i in range(4)):
                    return True

        # Check vertical
        for r in range(4):
            if row - r >= 0 and row - r + 3 < 6:
                if all(self.board[row - r + i][col] == player for i in range(4)):
                    return True

        # Check diagonal (both directions)
        for r in range(4):
            for c in range(4):
                if row - r >= 0 and col - c >= 0 and row - r + 3 < 6 and col - c + 3 < 7:
                    if all(self.board[row - r + i][col - c + i] == player for i in range(4)):
                        return True
                if row - r >= 0 and col + c < 7 and row - r + 3 < 6 and col + c - 3 >= 0:
                    if all(self.board[row - r + i][col + c - i] == player for i in range(4)):
                        return True

        return False

    def _is_board_full(self):
        """Check if the board is full."""
        return all(cell is not None for row in self.board for cell in row)

    def get_state(self):
        """Return the current game state."""
        # Convert None values to null for JSON compatibility
        board_state = [[None if cell is None else cell for cell in row] for row in self.board]
        state = {
            "board": board_state,
            "current_player": self.current_player,
            "game_over": self.game_over,
            "winner": self.winner,
            "move_history": self.move_history
        }
        print("Game state structure:", json.dumps(state, indent=2))
        return state

    def load_state(self, state):
        """Load a game state."""
        print("Loading game state:", json.dumps(state, indent=2))
        # Convert null values to None for Python compatibility
        board_state = [[None if cell is None else cell for cell in row] for row in state["board"]]
        self.board = board_state
        self.current_player = state["current_player"]
        self.game_over = state["game_over"]
        self.winner = state["winner"]
        self.move_history = state["move_history"]
        print("Loaded board state:", json.dumps(self.board, indent=2)) 