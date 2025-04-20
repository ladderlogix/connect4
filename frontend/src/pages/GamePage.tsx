import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import { useGame } from '../hooks/useGame';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { game, loading, error, isConnected, makeMove, createGame } = useGame(gameId ? parseInt(gameId) : undefined);
  const [loadingState, setLoadingState] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Game state in GamePage:', game);
    if (game && game.state) {
      console.log('Board in GamePage:', game.state.board);
      console.log('Current player:', game.state.current_player);
      console.log('Game over:', game.state.game_over);
      console.log('Winner:', game.state.winner);
      
      // Validate board structure
      if (!Array.isArray(game.state.board)) {
        console.error('Invalid board structure:', game.state.board);
        setErrorState('Invalid board structure');
        return;
      }
      
      // Log each cell in the board
      game.state.board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== null) {
            console.log(`Piece at row ${rowIndex}, col ${colIndex}: ${cell}`);
          }
        });
      });
    }
  }, [game]);

  useEffect(() => {
    if (!gameId) {
      const initializeGame = async () => {
        const newGameId = await createGame();
        if (newGameId) {
          navigate(`/game/${newGameId}`);
        }
      };
      initializeGame();
    }
  }, [gameId, createGame, navigate]);

  // Handle errors from useGame hook
  useEffect(() => {
    if (error) {
      console.error('Game error:', error);
      setErrorState(error);
      
      // If the error is "Game not found", try to fetch the game again
      if (error.includes('not found') && gameId) {
        console.log('Attempting to fetch game again...');
        fetchGame(parseInt(gameId));
      }
    }
  }, [error, gameId]);

  const handleColumnClick = async (column: number) => {
    console.log('Column clicked:', column);
    if (game && game.state && !game.state.game_over) {
      console.log('Making move in column:', column);
      setIsUpdating(true);
      const success = await makeMove(column);
      console.log('Move result:', success);
      
      if (success) {
        console.log('Updated game state:', game);
        console.log('Updated board:', game?.state?.board);
      }
      setIsUpdating(false);
    } else {
      console.log('Cannot make move:', { game, gameState: game?.state, gameOver: game?.state?.game_over });
    }
  };

  const fetchGame = async (id: number) => {
    try {
      setLoadingState(true);
      const response = await axios.get(`${API_BASE_URL}/games/${id}`);
      setGameState(response.data);
      setErrorState(null);
    } catch (err) {
      setErrorState('Failed to fetch game');
      console.error(err);
    } finally {
      setLoadingState(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-100 to-blue-200">
        <div className="text-4xl font-bold text-blue-800 animate-pulse">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-blue-100 to-blue-200">
        <div className="text-4xl font-bold text-red-500 mb-8">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded shadow-md text-2xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!game || !game.state) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-blue-100 to-blue-200">
        <div className="text-4xl font-bold text-blue-800 mb-8">No game data available</div>
        <button
          onClick={() => createGame()}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded shadow-md text-2xl"
        >
          Start New Game
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 py-16" style={{ width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-6xl font-bold text-blue-800">Connect 4</h1>
          <div className="flex space-x-6">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded shadow-md transition-all duration-300 text-2xl"
            >
              Back to Home
            </button>
            {game.state.game_over && (
              <button
                onClick={() => createGame()}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded shadow-md transition-all duration-300 text-2xl"
              >
                Start New Game
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-12 mb-12" style={{ width: '100%', minWidth: '700px' }}>
          {isUpdating && (
            <div className="text-center mb-4 text-blue-600 font-medium">
              Making your move...
            </div>
          )}
          
          <div className="flex justify-center mb-4">
            <div className={`px-4 py-2 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isConnected ? 'Connected to game server' : 'Disconnected from game server'}
            </div>
          </div>
          
          <GameBoard
            board={game.state.board}
            onColumnClick={handleColumnClick}
            currentPlayer={game.state.current_player}
            gameOver={game.state.game_over}
            winner={game.state.winner}
          />
        </div>
        
        {game.state.game_over && (
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-800 mb-8">
              {game.state.winner === 0 
                ? "Game ended in a draw!" 
                : `Player ${game.state.winner} wins!`}
            </div>
            <button
              onClick={() => createGame()}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-5 px-10 rounded-lg shadow-md text-3xl transition-all duration-300"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage; 