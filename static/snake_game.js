// static/snake_game.js

window.snake_gameGame = function(canvas, ctx, gameInfo) {
    let gameRunning = false;
    let animationFrameId = null;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(100, 100, 20, 20);
        gameInfo.textContent = "Snake Game: Game running!";
        // Add your snake game drawing logic here
    }

    function update() {
        // Add your snake game logic here
    }

    function gameLoop() {
        if (!gameRunning) return;
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            gameInfo.textContent = "Snake Game: Starting...";
            gameLoop();
        }
    }

    function stopGame() {
        gameRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        gameInfo.textContent = "Snake Game: Game stopped.";
    }

    // Expose functions to the global scope for project_detail.html to call
    return {
        startGame: startGame,
        stopGame: stopGame
    };
};
