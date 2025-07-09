window.brick_breakerGame = function(canvas, ctx, gameInfo) {
    let gameRunning = false;
    let animationFrameId = null;

    // --- 색상 및 파티클 변수 ---
    const ballAndPaddleColor = '#E0E0E0';
    let particles = []; // 벽돌 파괴 효과를 위한 파티클 배열

    /**
     * 밝은 유채색을 HSL 색 공간을 사용하여 랜덤하게 생성합니다.
     */
    function generateRandomBrightColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 100;
        const lightness = 70;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // Game variables
    const paddleHeight = 10;
    let paddleWidth;
    let paddleX;
    let rightPressed = false;
    let leftPressed = false;

    let ballRadius;
    let x;
    let y;
    let dx;
    let dy;

    let brickRowCount;
    let brickColumnCount;
    let brickWidth;
    let brickHeight;
    let brickPadding;
    let brickOffsetTop;
    let brickOffsetLeft;
    let bricks = [];

    // Event listeners
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
            paddleX += deltaX * (canvas.width / 600);
            touchCurrentX = touch.clientX;

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
        ctx.fillStyle = ballAndPaddleColor;
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = ballAndPaddleColor;
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    const brick = bricks[c][r];
                    ctx.beginPath();
                    ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
                    ctx.fillStyle = brick.color;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
    
    /**
     * 파티클 효과를 그리고 업데이트합니다.
     */
    function drawParticles() {
        // 배열을 역순으로 순회하여 안전하게 요소를 제거합니다.
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // 파티클 상태 업데이트 (반지름 증가, 투명도 감소)
            p.radius += 0.8; // 퍼지는 속도
            p.opacity -= 0.02; // 사라지는 속도

            // 파티클 그리기
            if (p.opacity > 0) {
                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2; // 얇은 띠
                ctx.stroke();
                ctx.restore();
            }

            // 수명이 다한 파티클 제거
            if (p.opacity <= 0) {
                particles.splice(i, 1);
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
                        b.status = 0;

                        // ✨ 벽돌이 부서질 때 파티클 생성
                        particles.push({
                            x: b.x + brickWidth / 2, // 벽돌의 중앙 x
                            y: b.y + brickHeight / 2, // 벽돌의 중앙 y
                            radius: 10, // 초기 반지름
                            color: b.color, // 벽돌의 색상
                            opacity: 1.0 // 초기 투명도
                        });
                    }
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawBricks();
        drawBall();
        drawPaddle();
        drawParticles(); // 파티클 그리기 함수 호출
        collisionDetection();

        x += dx;
        y += dy;

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                stopGame();
                window.showGameOver("Game Over!", "");
                return;
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

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
            window.showGameOver("You Win!", "");
            return;
        }

        animationFrameId = requestAnimationFrame(draw);
    }

    function startGame(settings = {}) {
        if (!gameRunning) {
            const scaleFactor = canvas.width / 600;
            dx = (settings.ballSpeed || 2) * scaleFactor;
            dy = -(settings.ballSpeed || 2) * scaleFactor;
            ballRadius = (settings.ballRadius || 10) * scaleFactor;
            paddleWidth = (settings.paddleWidth || 75) * scaleFactor;
            brickRowCount = settings.brickRows || 3;
            brickColumnCount = settings.brickCols || 5;
            brickWidth = (settings.brickWidth || 75) * scaleFactor;
            brickHeight = (settings.brickHeight || 20) * scaleFactor;
            brickPadding = (settings.brickPadding || 10) * scaleFactor;
            brickOffsetTop = (settings.brickOffsetTop || 30) * scaleFactor;
            brickOffsetLeft = (settings.brickOffsetLeft || 30) * scaleFactor;

            paddleX = (canvas.width - paddleWidth) / 2;
            x = canvas.width / 2;
            y = canvas.height - (30 * scaleFactor);
            
            particles = []; // 새 게임 시작 시 파티클 배열 초기화

            bricks = [];
            for (let c = 0; c < brickColumnCount; c++) {
                bricks[c] = [];
                for (let r = 0; r < brickRowCount; r++) {
                    const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r] = {
                        x: brickX,
                        y: brickY,
                        status: 1,
                        color: generateRandomBrightColor()
                    };
                }
            }

            gameRunning = true;
            gameInfo.textContent = "Brick Breaker: Starting...";
            draw();
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
