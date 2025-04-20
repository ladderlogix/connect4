import { useState, useEffect } from 'react';
import axios from 'axios';
import { Game, MoveResponse } from '../types/game';

const API_BASE_URL = 'http://localhost:5000/api';

export const useGame = (initialGameId?: number) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = async (gameId: number) => {
    try {
      setLoading(true);
      console.log('Fetching game:', gameId);
      const response = await axios.get<Game>(`${API_BASE_URL}/games/${gameId}`);
      console.log('Game fetched:', response.data);
      
      // Ensure the game state has the correct structure
      if (response.data && response.data.state) {
        const gameState = response.data.state;
        if (!gameState.board) {
          console.error('Invalid game state: missing board');
          setError('Invalid game state received');
          return;
        }
        
        // Initialize the board if it's not properly structured
        if (!Array.isArray(gameState.board) || gameState.board.length === 0) {
          gameState.board = Array(6).fill(null).map(() => Array(7).fill(null));
        }
        
        setGame(response.data);
        setError(null);
      } else {
        console.error('Invalid game state:', response.data);
        setError('Invalid game state received');
      }
    } catch (err) {
      console.error('Error fetching game:', err);
      setError('Failed to fetch game state');
    } finally {
      setLoading(false);
    }
  };

  const createGame = async () => {
    try {
      setLoading(true);
      console.log('Creating new game');
      const response = await axios.post<Game>(`${API_BASE_URL}/games`);
      console.log('Game created:', response.data);
      
      // Ensure the game state has the correct structure
      if (response.data && response.data.state) {
        const gameState = response.data.state;
        if (!gameState.board) {
          console.error('Invalid game state: missing board');
          setError('Invalid game state received');
          return null;
        }
        
        // Initialize the board if it's not properly structured
        if (!Array.isArray(gameState.board) || gameState.board.length === 0) {
          gameState.board = Array(6).fill(null).map(() => Array(7).fill(null));
        }
        
        setGame(response.data);
        setError(null);
        return response.data.id;
      } else {
        console.error('Invalid game state:', response.data);
        setError('Invalid game state received');
        return null;
      }
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const makeMove = async (column: number) => {
    if (!game) return false;
    
    try {
      setLoading(true);
      console.log('Making move:', column);
      const response = await axios.post<MoveResponse>(
        `${API_BASE_URL}/games/${game.id}/move`,
        { column }
      );
      console.log('Move response:', response.data);
      
      if (response.data.error) {
        setError(response.data.error);
        return false;
      }
      
      // Ensure the game state has the correct structure
      if (response.data && response.data.state) {
        const gameState = response.data.state;
        if (!gameState.board) {
          console.error('Invalid game state: missing board');
          setError('Invalid game state received');
          return false;
        }
        
        // Initialize the board if it's not properly structured
        if (!Array.isArray(gameState.board) || gameState.board.length === 0) {
          gameState.board = Array(6).fill(null).map(() => Array(7).fill(null));
        }
        
        setGame(response.data);
        setError(null);
        return true;
      } else {
        console.error('Invalid game state:', response.data);
        setError('Invalid game state received');
        return false;
      }
    } catch (err) {
      console.error('Error making move:', err);
      setError('Failed to make move');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/games`);
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to fetch games');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialGameId) {
      fetchGame(initialGameId);
    }
  }, [initialGameId]);

  return {
    game,
    loading,
    error,
    createGame,
    makeMove,
    fetchGames
  };
}; 