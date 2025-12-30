const startButton = document.getElementById('startButton');
const runner = document.getElementById('runner');
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
let score = 0;
let isRunning = false;

function startGame() {
    if (isRunning) return;
    isRunning = true;
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    startButton.disabled = true;
    animateGame();
    document.addEventListener('keydown', handleInput);
}

function animateGame() {
    // Simulate continuous environment movement using CSS keyframes in style.css
    // Simulate score increase
    const scoreInterval = setInterval(() => {
        if (!isRunning) {
            clearInterval(scoreInterval);
            return;
        }
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
    }, 500);

    // Simplified obstacle generation for visual animation
    setInterval(createObstacle, 3000);
}

function createObstacle() {
    if (!isRunning) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameArea.appendChild(obstacle);

    // Remove obstacle after animation
    obstacle.addEventListener('animationend', () => {
        gameArea.removeChild(obstacle);
    });
}

function handleInput(e) {
    // Simulate beautiful animations like jump with keyframes
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!runner.classList.contains('jump')) {
            runner.classList.add('jump');
            // Remove jump class after animation completes (0.5s as defined in CSS)
            runner.addEventListener('animationend', () => {
                runner.classList.remove('jump');
            }, { once: true });
        }
    }
    // Extend with slide or lane change animations for more complexity
}

startButton.addEventListener('click', startGame);
