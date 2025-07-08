// static/brick_breaker.js

window.brick_breakerGame = function(canvas, ctx, gameInfo) {
    let gameRunning = false;
    let animationFrameId = null;

    // Game variables
    const paddleHeight = 10;
    let paddleWidth; // Will be set by settings
    let paddleX;
    let rightPressed = false;
    let leftPressed = false;

    let ballRadius; // Will be set by settings
    let x;
    let y;
    let dx; // Will be set by settings
    let dy; // Will be set by settings

    let brickRowCount; // Will be set by settings
    let brickColumnCount; // Will be set by settings
    let brickWidth;
    let brickHeight;
    let brickPadding;
    let brickOffsetTop;
    let brickOffsetLeft;
    let bricks = [];

    // Event listeners for paddle movement
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("touchstart", touchStartHandler, false);
    document.addEventListener("touchmove", touchMoveHandler, false);
    document.addEventListener("touchend", touchEndHandler, false);

    let touchStartX = 0;
    let touchCurrentX = 0;
    let touchActive = false;

    function touchStartHandler(e) {
        if (e.target === canvas) {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchCurrentX = touchStartX;
            touchActive = true;
        }
    }

    function touchMoveHandler(e) {
        if (e.target === canvas && touchActive) {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchCurrentX;
            paddleX += deltaX * (canvas.width / 600); // Scale movement with canvas size
            touchCurrentX = touch.clientX;

            // Keep paddle within bounds
            if (paddleX < 0) {
                paddleX = 0;
            } else if (paddleX + paddleWidth > canvas.width) {
                paddleX = canvas.width - paddleWidth;
            }
        }
    }

    function touchEndHandler(e) {
        if (e.target === canvas) {
            e.preventDefault();
            touchActive = false;
        }
    }

    function keyDownHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            rightPressed = true;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            leftPressed = false;
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = "#0095DD";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0; // Brick broken
                    }
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();

        // Ball movement
        x += dx;
        y += dy;

        // Wall collision
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                // Game Over
                stopGame();
                window.showGameOver("Game Over!", ""); // Call global showGameOver
                return;
            }
        }

        // Paddle movement
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        // Check for win condition
        let allBricksBroken = true;
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    allBricksBroken = false;
                    break;
                }
            }
            if (!allBricksBroken) break;
        }
        if (allBricksBroken) {
            gameInfo.textContent = "Brick Breaker: You Win!";
            stopGame();
            window.showGameOver("You Win!", ""); // Call global showGameOver
            return;
        }

        animationFrameId = requestAnimationFrame(draw);
    }

    function startGame(settings = {}) {
        if (!gameRunning) {
            // Apply settings
            const scaleFactor = canvas.width / 600; // Base canvas width is 600
            dx = (settings.ballSpeed || 2) * scaleFactor;
            dy = -(settings.ballSpeed || 2) * scaleFactor; // Ball starts moving up
            ballRadius = (settings.ballRadius || 10) * scaleFactor;
            paddleWidth = (settings.paddleWidth || 75) * scaleFactor;
            brickRowCount = settings.brickRows || 3;
            brickColumnCount = settings.brickCols || 5;
            brickWidth = (settings.brickWidth || 75) * scaleFactor;
            brickHeight = (settings.brickHeight || 20) * scaleFactor;
            brickPadding = (settings.brickPadding || 10) * scaleFactor;
            brickOffsetTop = (settings.brickOffsetTop || 30) * scaleFactor;
            brickOffsetLeft = (settings.brickOffsetLeft || 30) * scaleFactor;

            // Reset game state
            paddleX = (canvas.width - paddleWidth) / 2;
            x = canvas.width / 2;
            y = canvas.height - (30 * scaleFactor);
            
            // Reinitialize bricks based on new row/col count
            bricks = [];
            for (let c = 0; c < brickColumnCount; c++) {
                bricks[c] = [];
                for (let r = 0; r < brickRowCount; r++) {
                    bricks[c][r] = { x: 0, y: 0, status: 1 };
                }
            }

            gameRunning = true;
            gameInfo.textContent = "Brick Breaker: Starting...";
            draw(); // Start the game loop
        }
    }

    function stopGame() {
        gameRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    return {
        startGame: startGame,
        stopGame: stopGame
    };
};
