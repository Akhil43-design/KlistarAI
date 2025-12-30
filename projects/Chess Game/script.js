const gameBoard = document.getElementById('game-board');
const statusDiv = document.getElementById('status');

let board = [];
let selectedPiece = null;
let currentPlayer = 'white'; // white or black
let isGameActive = true;

const initialBoard = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

const pieces = {
    'wP': '♙', 'wR': '♖', 'wN': '♘', 'wB': '♗', 'wQ': '♕', 'wK': '♔',
    'bP': '♟', 'bR': '♜', 'bN': '♞', 'bB': '♝', 'bQ': '♛', 'bK': '♚'
};

const createBoard = () => {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        if (board.length < 8) {
            board[i] = [...initialBoard[i]];
        }
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', (i + j) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            const piece = board[i][j];
            if (piece) {
                cell.innerHTML = pieces[piece];
            }
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
};

const isValidPawnMove = (startRow, startCol, endRow, endCol) => {
    const piece = board[startRow][startCol];
    const color = piece[0];
    const direction = color === 'w' ? -1 : 1;
    const startRank = color === 'w' ? 6 : 1;

    if (startCol === endCol) {
        if (endRow === startRow + direction && board[endRow][endCol] === '') {
            return true;
        }
        if (startRow === startRank && endRow === startRow + 2 * direction && board[endRow][endCol] === '' && board[startRow + direction][startCol] === '') {
            return true;
        }
    }
    return false;
};

const handleCellClick = (e) => {
    if (!isGameActive) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const piece = board[row][col];

    if (selectedPiece) {
        const { row: prevRow, col: prevCol } = selectedPiece;
        const selectedPieceType = board[prevRow][prevCol];
        const pieceColor = selectedPieceType[0] === 'w' ? 'white' : 'black';

        if (pieceColor === currentPlayer) {
            let moved = false;
            if (selectedPieceType.endsWith('P')) {
                if (isValidPawnMove(prevRow, prevCol, row, col)) {
                    moved = true;
                }
            } else {
                moved = true; 
            }

            if (moved) {
                // Animate move: We apply a brief visual transition before state update
                const startCell = document.querySelector(`.cell[data-row="${prevRow}"][data-col="${prevCol}"]`);
                const endCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                
                // A simple way to visualize without complex physics is a brief class application or timeout update
                
                // Update state
                board[row][col] = board[prevRow][prevCol];
                board[prevRow][prevCol] = '';
                
                // Update visuals after a short "animation" delay for effect
                setTimeout(() => {
                    selectedPiece = null;
                    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                    statusDiv.innerHTML = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
                    createBoard(); // Re-render to finalize
                }, 150); // Short delay for perceived animation

            } else {
                selectedPiece = null;
                createBoard();
            }
        }
    } else {
        if (piece) {
            const pieceColor = piece[0] === 'w' ? 'white' : 'black';
            if (pieceColor === currentPlayer) {
                selectedPiece = { row, col };
                e.target.classList.add('selected');
            }
        }
    }
};

createBoard();
statusDiv.innerHTML = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
