import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Game, MoveResponse } from '../types/game';
import { API_BASE_URL, SOCKET_URL } from '../config';

export const useGame = (initialGameId?: number) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

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

  // Set up WebSocket connection
  useEffect(() => {
    if (initialGameId) {
      // Initial fetch
      fetchGame(initialGameId);
      
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        path: '/socket.io/',
        
        // Add to work with cloudflare
        secure: true,
        upgrade: true,
        transports: ['websocket', 'polling']
      });
      
      // Set up socket event handlers
      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        
        // Join the game room
        socketRef.current?.emit('join_game', { game_id: initialGameId });
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });
      
      socketRef.current.on('connected', (data) => {
        console.log('Socket connected event:', data);
      });
      
      socketRef.current.on('joined_game', (data) => {
        console.log('Joined game room:', data);
      });
      
      socketRef.current.on('game_updated', (data) => {
        console.log('Game updated via WebSocket:', data);
        if (data.id === initialGameId) {
          setGame(data);
        }
      });
      
      socketRef.current.on('error', (data) => {
        console.error('Socket error:', data);
        setError(data.message || 'WebSocket error');
      });
      
      // Clean up socket connection on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leave_game', { game_id: initialGameId });
          socketRef.current.disconnect();
        }
      };
    }
  }, [initialGameId]);

  return {
    game,
    loading,
    error,
    isConnected,
    createGame,
    makeMove,
    fetchGames
  };
}; 
