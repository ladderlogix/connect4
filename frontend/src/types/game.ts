export interface GameState {
  board: (number | null)[][];
  current_player: number;
  game_over: boolean;
  winner: number | null;
}

export interface Game {
  id: number;
  state: GameState;
  created_at?: string;
  updated_at?: string;
}

export interface MoveResponse extends Game {
  message?: string;
  error?: string;
} 