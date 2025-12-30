const board = document.getElementById('chess-board');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');

let currentBoard = [];
let selectedPiece = null;
let selectedCell = null;
let currentPlayer = 'White'; // 'White' or 'Black'
let isGameActive = true;

const initialBoard = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

const pieceMap = {
    'wP': '♙', 'wR': '♖', 'wN': '♘', 'wB': '♗', 'wQ': '♕', 'wK': '♔',
    'bP': '♟', 'bR': '♜', 'bN': '♞', 'bB': '♝', 'bQ': '♛', 'bK': '♚'
};

function initializeGame() {
    currentBoard = initialBoard.map(row => [...row]);
    currentPlayer = 'White';
    isGameActive = true;
    selectedPiece = null;
    selectedCell = null;
    status.textContent = `${currentPlayer}'s turn`;
    renderBoard();
}

function renderBoard() {
    board.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', (r + c) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            const piece = currentBoard[r][c];
            if (piece) {
                cell.textContent = pieceMap[piece];
                // Simple coloring for beautiful aesthetic
                if (piece.startsWith('w')) {
                    cell.style.color = '#EEEEEE'; 
                } else {
                    cell.style.color = '#333333';
                }
            }
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }
}

function handleCellClick(e) {
    if (!isGameActive) return;

    const cell = e.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const piece = currentBoard[row][col];

    // Simplified logic: Complex validation (like check, checkmate, actual move rules) is omitted for brevity but integrated visually.

    if (selectedPiece) {
        // simplified move attempt
        
        // Visual enhancements: remove previous highlights
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('selected', 'valid-move');
        });

        // Simplified: Just move if different cell and clear selection
        if (selectedCell.dataset.row !== row || selectedCell.dataset.col !== col) {
            
            // Basic turn check simulation
            const pieceColor = selectedPiece.startsWith('w') ? 'White' : 'Black';
            if (pieceColor !== currentPlayer) {
                selectedPiece = null;
                selectedCell = null;
                return;
            }

            // Execute simplified move
            currentBoard[row][col] = selectedPiece;
            currentBoard[selectedCell.dataset.row][selectedCell.dataset.col] = null;
            
            // Switch player and re-render (simplified)
            currentPlayer = currentPlayer === 'White' ? 'Black' : 'White';
            status.textContent = `${currentPlayer}'s turn`;
            renderBoard();
            selectedPiece = null;
            selectedCell = null;
        } else {
            selectedPiece = null;
            selectedCell = null;
        }

    } else {
        // Select piece
        if (piece) {
            const pieceColor = piece.startsWith('w') ? 'White' : 'Black';
            if (pieceColor === currentPlayer) {
                selectedPiece = piece;
                selectedCell = cell;
                cell.classList.add('selected');
                // In a real implementation, valid moves would be calculated and highlighted here (valid-move class)
            }
        }
    }
}

restartButton.addEventListener('click', initializeGame);

initializeGame();
