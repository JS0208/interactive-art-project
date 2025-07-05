// static/brick_breaker.js

window.brick_breakerGame = function(canvas, ctx, gameInfo) {
    let gameRunning = false;
    let animationFrameId = null;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 100, 20);
        gameInfo.textContent = "Brick Breaker: Game running!";
        // Add your brick breaker drawing logic here
    }

    function update() {
        // Add your brick breaker game logic here
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
            gameInfo.textContent = "Brick Breaker: Starting...";
            gameLoop();
        }
    }

    function stopGame() {
        gameRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        gameInfo.textContent = "Brick Breaker: Game stopped.";
    }

    // Expose functions to the global scope for project_detail.html to call
    return {
        startGame: startGame,
        stopGame: stopGame
    };
};
