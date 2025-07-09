window.snake_gameGame = function(canvas, ctx, gameInfo) {
    let gameRunning = false;
    let animationFrameId = null;
    let gridSize; // Will be set by settings
    let snake; // Will be initialized by settings
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let changingDirection = false;
    let gameSpeed; // Will be set by settings

    // --- 색상 생성 헬퍼 함수 ---

    /**
     * 밝은 무채색(회색)을 랜덤하게 생성합니다.
     * @returns {string} CSS rgb 색상 문자열 (예: 'rgb(220, 220, 220)')
     */
    function generateRandomBrightGray() {
        const value = Math.floor(Math.random() * 86) + 170; // 170 ~ 255 사이의 값
        return `rgb(${value}, ${value}, ${value})`;
    }

    /**
     * 밝은 유채색을 HSL 색 공간을 사용하여 랜덤하게 생성합니다.
     * @returns {string} CSS hsl 색상 문자열 (예: 'hsl(120, 100%, 70%)')
     */
    function generateRandomBrightColor() {
        const hue = Math.floor(Math.random() * 360); // 0 ~ 359 색상
        const saturation = 100; // 100% 채도
        const lightness = 70; // 70% 명도
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }


    // Event listeners for snake movement
    document.addEventListener("keydown", changeDirection);
    document.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, false);

    let x1 = null;
    let y1 = null;

    function handleTouchStart(event) {
        const firstTouch = event.touches[0];
        x1 = firstTouch.clientX;
        y1 = firstTouch.clientY;
    }

    function handleTouchMove(event) {
        if (!x1 || !y1) {
            return;
        }

        let x2 = event.touches[0].clientX;
        let y2 = event.touches[0].clientY;

        let xDiff = x2 - x1;
        let yDiff = y2 - y1;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            // Most significant movement is horizontal
            if (xDiff > 0) {
                // Right swipe
                if (dx === 0) { // Only change if not already moving horizontally
                    dx = 1;
                    dy = 0;
                }
            } else {
                // Left swipe
                if (dx === 0) {
                    dx = -1;
                    dy = 0;
                }
            }
        } else {
            // Most significant movement is vertical
            if (yDiff > 0) {
                // Down swipe
                if (dy === 0) {
                    dx = 0;
                    dy = 1;
                }
            } else {
                // Up swipe
                if (dy === 0) {
                    dx = 0;
                    dy = -1;
                }
            }
        }
        x1 = null;
        y1 = null;
        event.preventDefault(); // Prevent scrolling
    }

    function generateFood() {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize)),
            color: generateRandomBrightGray() // Food 생성 시 랜덤 무채색 할당
        };
    }

    function drawSnakePart(snakePart) {
        // 각 마디에 할당된 고유 색상으로 칠함
        ctx.fillStyle = snakePart.color;
        ctx.strokeStyle = '#101010'; // 테두리는 어두운 색으로 통일
        ctx.fillRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize);
    }

    function drawFood() {
        // Food에 할당된 색상으로 칠함
        ctx.fillStyle = food.color;
        ctx.strokeStyle = '#101010'; // 테두리는 어두운 색으로 통일
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    function draw() {
        // 배경색을 약간 밝은 검은색으로 설정
        ctx.fillStyle = '#141414'; // rgb(20, 20, 20)
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawFood();
        snake.forEach(drawSnakePart);
        gameInfo.textContent = `Snake Game: Score: ${score}`;
    }

    function advanceSnake() {
        // 새로운 머리 부분에 랜덤 유채색 할당
        const head = {
            x: snake[0].x + dx,
            y: snake[0].y + dy,
            color: generateRandomBrightColor()
        };
        snake.unshift(head);

        const didEatFood = head.x === food.x && head.y === food.y;
        if (didEatFood) {
            score += 10;
            generateFood();
        } else {
            snake.pop();
        }
    }

    function didGameEnd() {
        for (let i = 4; i < snake.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
        }
        const hitLeftWall = snake[0].x < 0;
        const hitRightWall = snake[0].x * gridSize >= canvas.width;
        const hitTopWall = snake[0].y < 0;
        const hitBottomWall = snake[0].y * gridSize >= canvas.height;
        return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
    }

    function changeDirection(event) {
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        if (changingDirection) return;
        changingDirection = true;

        const keyPressed = event.keyCode;
        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingRight = dx === 1;
        const goingLeft = dx === -1;

        if (keyPressed === LEFT_KEY && !goingRight) {
            dx = -1;
            dy = 0;
        }
        if (keyPressed === UP_KEY && !goingDown) {
            dx = 0;
            dy = -1;
        }
        if (keyPressed === RIGHT_KEY && !goingLeft) {
            dx = 1;
            dy = 0;
        }
        if (keyPressed === DOWN_KEY && !goingUp) {
            dx = 0;
            dy = 1;
        }
    }

    function gameLoop() {
        if (didGameEnd()) {
            stopGame();
            window.showGameOver("Game Over!", `Score: ${score}`); // Call global showGameOver
            return;
        }

        changingDirection = false;
        setTimeout(function() {
            advanceSnake();
            draw();
            animationFrameId = requestAnimationFrame(gameLoop);
        }, gameSpeed);
    }

    function startGame(settings = {}) {
        if (!gameRunning) {
            // Apply settings
            gameSpeed = settings.snakeSpeed || 100;
            gridSize = settings.gridSize || 20;
            const initialLength = settings.initialLength || 3;
            const foodSpawnRate = settings.foodSpawnRate || 5; // Use this for future features

            // Reset game state
            snake = [];
            for (let i = 0; i < initialLength; i++) {
                // 초기 snake의 각 마디에도 랜덤 유채색 할당
                snake.push({
                    x: 10 - i,
                    y: 10,
                    color: generateRandomBrightColor()
                });
            }
            dx = 1; // Initial direction to the right
            dy = 0;
            score = 0;
            generateFood();

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
    }

    return {
        startGame: startGame,
        stopGame: stopGame
    };
};
