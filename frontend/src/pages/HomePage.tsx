import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHistory from '../components/GameHistory';
import { useGame } from '../hooks/useGame';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchGames, createGame } = useGame();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      const gameList = await fetchGames();
      setGames(gameList);
      setLoading(false);
    };
    loadGames();
  }, [fetchGames]);

  const handleNewGame = async () => {
    const newGameId = await createGame();
    if (newGameId) {
      navigate(`/game/${newGameId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Connect 4</h1>
          <button
            onClick={handleNewGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            New Game
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading games...</div>
          </div>
        ) : (
          <GameHistory games={games} />
        )}
      </div>
    </div>
  );
};

export default HomePage; 