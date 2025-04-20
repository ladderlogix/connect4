import React from 'react';
import { Link } from 'react-router-dom';

interface Game {
  id: number;
  state: {
    game_over: boolean;
    winner: number | null;
    current_player: number;
  };
  created_at: string;
  updated_at: string;
}

interface GameHistoryProps {
  games: Game[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ games }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getGameStatus = (game: Game) => {
    if (game.state.game_over) {
      if (game.state.winner === 0) {
        return 'Draw';
      } else {
        return `Player ${game.state.winner} won`;
      }
    } else {
      return `Player ${game.state.current_player}'s turn`;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Game History</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games.map((game) => (
              <tr key={game.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{game.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getGameStatus(game)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(game.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(game.updated_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link 
                    to={`/game/${game.id}`} 
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {game.state.game_over ? 'View' : 'Continue'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameHistory; 