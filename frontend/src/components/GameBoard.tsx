import React, { useState, useEffect } from 'react';

// Add keyframe animation for bounce effect
const bounceKeyframes = `
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
`;

interface GameBoardProps {
  board: (number | null)[][];
  onColumnClick: (column: number) => void;
  currentPlayer: number;
  gameOver: boolean;
  winner: number | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  onColumnClick, 
  currentPlayer, 
  gameOver, 
  winner 
}) => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [animatingPiece, setAnimatingPiece] = useState<{column: number, row: number} | null>(null);
  const [lastMove, setLastMove] = useState<{column: number, row: number} | null>(null);
  const [previousBoard, setPreviousBoard] = useState<(number | null)[][]>(board);

  // Add style element for keyframe animation
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = bounceKeyframes;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Board received in GameBoard:', board);
    console.log('Board structure:', JSON.stringify(board, null, 2));
    
    // Check if board has any non-null values
    let hasPieces = false;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] !== null) {
          hasPieces = true;
          console.log(`Piece found at row ${row}, col ${col}: ${board[row][col]}`);
        }
      }
    }
    console.log('Board has pieces:', hasPieces);
    console.log('Current player:', currentPlayer);
    console.log('Game over:', gameOver);
    console.log('Winner:', winner);
  }, [board, currentPlayer, gameOver, winner]);

  // Track board changes and last move
  useEffect(() => {
    if (board && JSON.stringify(board) !== JSON.stringify(previousBoard)) {
      console.log('Board changed!');
      console.log('Previous board:', previousBoard);
      console.log('Current board:', board);
      setPreviousBoard(board);
      
      // Find the difference between previous and current board
      for (let col = 0; col < board[0].length; col++) {
        for (let row = board.length - 1; row >= 0; row--) {
          if (board[row][col] !== previousBoard[row][col]) {
            console.log(`New piece at row ${row}, col ${col}: ${board[row][col]}`);
            setLastMove({ column: col, row: row });
            setAnimatingPiece({ column: col, row: row });
            setTimeout(() => {
              setAnimatingPiece(null);
            }, 500);
            return;
          }
        }
      }
    }
  }, [board, previousBoard]);

  const renderCell = (cell: number | null, row: number, col: number) => {
    console.log(`Rendering cell at row ${row}, col ${col}:`, cell);
    
    // Base styles for all cells
    const baseStyles = {
      width: '80px',
      height: '80px',
      margin: '4px',
      borderRadius: '50%',
      border: '4px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    };
    
    // Determine cell color based on player
    let backgroundColor = '#e5e7eb'; // gray-200
    let borderColor = '#d1d5db'; // gray-300
    
    if (cell === 1) {
      backgroundColor = '#ef4444'; // red-500
      borderColor = '#b91c1c'; // red-700
    } else if (cell === 2) {
      backgroundColor = '#eab308'; // yellow-500
      borderColor = '#a16207'; // yellow-700
    }
    
    // Add animation class if this is the animating piece
    const isAnimating = animatingPiece && animatingPiece.column === col && animatingPiece.row === row;
    const animationStyle = isAnimating ? { animation: 'bounce 0.5s' } : {};
    
    // Add highlight for last move
    const isLastMove = lastMove && lastMove.column === col && lastMove.row === row;
    const highlightStyle = isLastMove ? { boxShadow: '0 0 0 4px #60a5fa' } : {}; // blue-400
    
    return (
      <div 
        key={`${row}-${col}`} 
        style={{
          ...baseStyles,
          backgroundColor,
          borderColor,
          ...animationStyle,
          ...highlightStyle
        }}
      />
    );
  };

  const renderColumn = (colIndex: number) => {
    const isHovered = hoveredColumn === colIndex;
    
    return (
      <div 
        key={colIndex} 
        className="flex flex-col cursor-pointer relative"
        onClick={() => !gameOver && onColumnClick(colIndex)}
        onMouseEnter={() => setHoveredColumn(colIndex)}
        onMouseLeave={() => setHoveredColumn(null)}
      >
        {board.map((row, rowIndex) => renderCell(row[colIndex], rowIndex, colIndex))}
        
        {/* Hover indicator - absolutely positioned */}
        {isHovered && !gameOver && (
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              position: 'absolute',
              top: '-88px', // Position above the top cell (80px + 4px margin)
              left: '4px',  // Align with the left margin
              zIndex: 10,
              borderRadius: '50%',
              backgroundColor: 'rgba(209, 213, 219, 0.5)', // gray-300 with opacity
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
          >
            <div 
              style={{ 
                width: '70px', 
                height: '70px',
                borderRadius: '50%',
                backgroundColor: currentPlayer === 1 ? '#ef4444' : '#eab308', // red-500 or yellow-500
                opacity: 0.7
              }} 
            />
          </div>
        )}
      </div>
    );
  };

  const getGameStatus = () => {
    if (gameOver) {
      if (winner === 0) {
        return 'Game ended in a draw!';
      } else {
        return `Player ${winner} wins!`;
      }
    } else {
      return `Player ${currentPlayer}'s turn`;
    }
  };

  return (
    <div className="flex flex-col items-center" style={{ width: '100%', maxWidth: '100vw' }}>
      <div className="mb-10 text-4xl font-bold">
        {getGameStatus()}
      </div>
      
      {/* Player indicators */}
      <div className="flex justify-between w-full mb-8">
        <div className={`flex items-center ${currentPlayer === 1 && !gameOver ? 'scale-110' : ''}`}>
          <div style={{ width: '40px', height: '40px' }} className="rounded-full bg-red-500 mr-4"></div>
          <span className="font-bold text-2xl">Player 1</span>
        </div>
        <div className={`flex items-center ${currentPlayer === 2 && !gameOver ? 'scale-110' : ''}`}>
          <div style={{ width: '40px', height: '40px' }} className="rounded-full bg-yellow-500 mr-4"></div>
          <span className="font-bold text-2xl">Player 2</span>
        </div>
      </div>
      
      <div className="flex bg-blue-800 p-10 rounded-lg shadow-xl" style={{ minWidth: '600px' }}>
        {board[0].map((_, colIndex) => renderColumn(colIndex))}
      </div>
    </div>
  );
};

export default GameBoard; 