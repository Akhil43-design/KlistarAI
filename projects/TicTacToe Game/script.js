const gameBoard = document.getElementById('game-board');
const statusDiv = document.getElementById('status');
const restartButton = document.getElementById('restart-button');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const handleCellClick = (e) => {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !isGameActive) {
        return;
    }

    board[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;

    if (checkWin()) {
        statusDiv.innerHTML = `🎉 Player ${currentPlayer} wins, Sir! 🎉`;
        isGameActive = false;
    } else if (checkDraw()) {
        statusDiv.innerHTML = `🤝 It's a draw! 🤝`;
        isGameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDiv.innerHTML = `Current Player: ${currentPlayer}`;
    }
};

const checkWin = () => {
    return winningConditions.some(condition => {
        const [a, b, c] = condition;
        return board[a] !== '' && board[a] === board[b] && board[a] === board[c];
    });
};

const checkDraw = () => {
    return board.every(cell => cell !== '');
};

const restartGame = () => {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    statusDiv.innerHTML = `Current Player: ${currentPlayer}`;
    gameBoard.innerHTML = '';
    createBoard();
};

const createBoard = () => {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
};

restartButton.addEventListener('click', restartGame);

createBoard();
statusDiv.innerHTML = `Current Player: ${currentPlayer}`;
