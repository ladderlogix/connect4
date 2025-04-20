// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

// API URLs
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : 'https://c4.joyce.red/api';

export const SOCKET_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://c4.joyce.red';

// Game Configuration
export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 6;
export const WINNING_LENGTH = 4; 