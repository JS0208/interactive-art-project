window.brick_breakerGame = function(canvas, ctx, gameInfo, globalScope) {
    let gameRunning = false;
    let animationFrameId = null;
    let particles = [];

    // --- 게임 변수 ---
    let ball, paddle, bricks = [], gameSettings;
    let rightPressed = false, leftPressed = false, spacePressed = false;
    let lives;

    // --- 이벤트 리스너 ---
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    canvas.addEventListener("touchstart", touchStartHandler, { passive: false });
    canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });
    canvas.addEventListener("touchend", touchEndHandler, { passive: false });
    let touchStartX = 0, touchCurrentX = 0, touchActive = false;

    function keyDownHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
        else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
        else if (e.key === " ") spacePressed = true;
    }
    function keyUpHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
        else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
        else if (e.key === " ") spacePressed = false;
    }
    function touchStartHandler(e) {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchCurrentX = touch.clientX;
        touchActive = true;
        if (ball.isSticky) launchBall();
    }
    function touchMoveHandler(e) {
        if (touchActive) {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchCurrentX;
            paddle.x += deltaX;
            touchCurrentX = touch.clientX;
            if (paddle.x < 0) paddle.x = 0;
            if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
        }
    }
    function touchEndHandler(e) { e.preventDefault(); touchActive = false; }
    
    function generateRandomBrightColor() {
        return `hsl(${Math.random() * 360}, 100%, 70%)`;
    }

    function resetBallAndPaddle() {
        paddle.x = (canvas.width - paddle.width) / 2;
        ball.x = paddle.x + paddle.width / 2;
        ball.y = canvas.height - paddle.height - ball.radius;
        ball.dx = (Math.random() - 0.5) * gameSettings.ballSpeed * 2;
        ball.dy = -gameSettings.ballSpeed;
        
        if (gameSettings.stickyPaddle) {
            ball.isSticky = true;
        }
    }

    function launchBall() {
        if (ball.isSticky) {
            ball.isSticky = false;
            // 발사 시 속도 초기화
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            const launchSpeed = gameSettings.ballSpeed > 0 ? gameSettings.ballSpeed : 2;
            ball.dx = (Math.random() - 0.5) * launchSpeed;
            ball.dy = -launchSpeed;
        }
    }
    
    function updateGameInfo() {
        const bricksLeft = bricks.flat().filter(b => b.status === 1).length;
        gameInfo.textContent = `Lives: ${lives} | Bricks Left: ${bricksLeft}`;
    }

    // --- 그리기 함수들 ---
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.fillStyle = paddle.color;
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        bricks.forEach(column => {
            column.forEach(brick => {
                if (brick.status === 1) {
                    ctx.beginPath();
                    ctx.rect(brick.x, brick.y, brick.width, brick.height);
                    ctx.fillStyle = brick.color;
                    ctx.fill();
                    ctx.closePath();
                }
            });
        });
    }
    
    function drawParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.radius += 0.8;
            p.opacity -= gameSettings.particleLifespan;
            if (p.opacity > 0) {
                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            } else {
                particles.splice(i, 1);
            }
        }
    }

    // --- 게임 로직 ---
    function collisionDetection() {
        let allBricksBroken = true;
        bricks.forEach(column => {
            column.forEach(b => {
                if (b.status === 1) {
                    allBricksBroken = false;
                    if (ball.x > b.x && ball.x < b.x + b.width && ball.y > b.y && ball.y < b.y + b.height) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        particles.push({
                            x: b.x + b.width / 2, y: b.y + b.height / 2,
                            radius: gameSettings.particleSize, color: b.color, opacity: 1.0
                        });
                        updateGameInfo();
                    }
                }
            });
        });
        if (allBricksBroken) {
            stopGame();
            globalScope.showGameOver("You Win!", `All bricks cleared!`);
        }
    }
    
    function draw() {
        if (!gameRunning) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawBricks();
        drawBall();
        drawPaddle();
        drawParticles();
        collisionDetection();

        // 공 이동
        if (ball.isSticky) {
            ball.x = paddle.x + paddle.width / 2;
            if (spacePressed) launchBall();
        } else {
            ball.x += ball.dx;
            ball.y += ball.dy;
        }
        
        // 벽 충돌
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        } else if (ball.y > canvas.height - ball.radius - paddle.height) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                ball.dy = -ball.dy;
                // 공 가속도 적용
                if (gameSettings.ballAcceleration > 0) {
                    ball.dx *= (1 + gameSettings.ballAcceleration);
                    ball.dy *= (1 + gameSettings.ballAcceleration);
                }
                // 끈끈이 패들 재적용
                if (gameSettings.stickyPaddle) ball.isSticky = true;

            } else if (ball.y > canvas.height - ball.radius) {
                lives--;
                if (lives > 0) {
                    resetBallAndPaddle();
                    updateGameInfo();
                } else {
                    stopGame();
                    globalScope.showGameOver("Game Over!", "You ran out of lives.");
                    return;
                }
            }
        }
        
        // 패들 이동
        if (rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += gameSettings.paddleSpeed;
        if (leftPressed && paddle.x > 0) paddle.x -= gameSettings.paddleSpeed;

        animationFrameId = requestAnimationFrame(draw);
    }

    function startGame(settings) {
        if (gameRunning) return;
        gameRunning = true;
        gameSettings = settings;

        const scaleFactor = canvas.width / 600;
        
        ball = {
            radius: gameSettings.ballRadius * scaleFactor,
            color: gameSettings.ballColor,
            isSticky: false
        };
        paddle = {
            height: 10 * scaleFactor,
            width: gameSettings.paddleWidth * scaleFactor,
            y: canvas.height - (10 * scaleFactor),
            color: gameSettings.paddleColor
        };
        lives = gameSettings.lives;
        
        resetBallAndPaddle();
        
        particles = [];
        bricks = [];
        const brickWidth = gameSettings.brickWidth * scaleFactor;
        const brickHeight = gameSettings.brickHeight * scaleFactor;
        const brickPadding = 10 * scaleFactor;
        const offsetLeft = (canvas.width - (gameSettings.brickCols * (brickWidth + brickPadding) - brickPadding)) / 2;
        const offsetTop = 30 * scaleFactor;

        for (let c = 0; c < gameSettings.brickCols; c++) {
            bricks[c] = [];
            for (let r = 0; r < gameSettings.brickRows; r++) {
                bricks[c][r] = {
                    x: (c * (brickWidth + brickPadding)) + offsetLeft,
                    y: (r * (brickHeight + brickPadding)) + offsetTop,
                    width: brickWidth, height: brickHeight, status: 1,
                    color: generateRandomBrightColor()
                };
            }
        }
        
        updateGameInfo();
        draw();
    }

    function stopGame() {
        gameRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    return { startGame, stopGame };
};
