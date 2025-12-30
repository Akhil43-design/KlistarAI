const board = document.getElementById('game-board');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const cells = [];
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
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

function initializeGame() {
    board.innerHTML = '';
    cells.length = 0;
    gameState = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = 'X';
    status.textContent = `Player ${currentPlayer}'s turn`;

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
        cells.push(cell);
    }
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !isGameActive) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase()); // Add class for vibrant color

    if (checkWin()) {
        isGameActive = false;
        status.textContent = `Player ${currentPlayer} has won! 🎉`;
        highlightWins();
        return;
    }

    if (isDraw()) {
        isGameActive = false;
        status.textContent = "It's a draw! 🤝";
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWin() {
    let won = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            won = true;
            break;
        }
    }
    return won;
}

function isDraw() {
    return !gameState.includes('');
}

function highlightWins() {
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        if (gameState[winCondition[0]] === currentPlayer && gameState[winCondition[1]] === currentPlayer && gameState[winCondition[2]] === currentPlayer) {
            winCondition.forEach(index => {
                cells[index].classList.add('win'); // Add 'win' class for pulse animation and background
            });
            return;
        }
    }
}


restartButton.addEventListener('click', initializeGame);

initializeGame();
