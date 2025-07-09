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
    function generateRandomBrightGray() {
        const value = Math.floor(Math.random() * 86) + 170; // 170 ~ 255 사이의 값
        return `rgb(${value}, ${value}, ${value})`;
    }

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
            if (xDiff > 0) {
                if (dx === 0) { dx = 1; dy = 0; }
            } else {
                if (dx === 0) { dx = -1; dy = 0; }
            }
        } else {
            if (yDiff > 0) {
                if (dy === 0) { dx = 0; dy = 1; }
            } else {
                if (dy === 0) { dx = 0; dy = -1; }
            }
        }
        x1 = null;
        y1 = null;
        event.preventDefault();
    }

    function generateFood() {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize)),
            color: generateRandomBrightGray()
        };
    }

    function drawSnakePart(snakePart) {
        ctx.fillStyle = snakePart.color;
        ctx.strokeStyle = '#101010';
        ctx.fillRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize);
    }

    function drawFood() {
        ctx.fillStyle = food.color;
        ctx.strokeStyle = '#101010';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    function draw() {
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawFood();
        snake.forEach(drawSnakePart);
        gameInfo.textContent = `Snake Game: Score: ${score}`;
    }

    // ==================================================================
    // ✨ 여기가 수정된 함수입니다. ✨
    // ==================================================================
    function advanceSnake() {
        const headPosition = { x: snake[0].x + dx, y: snake[0].y + dy };

        const didEatFood = headPosition.x === food.x && headPosition.y === food.y;
        if (didEatFood) {
            // 음식을 먹었을 경우: 새로운 색상을 가진 마디를 머리에 추가
            score += 10;
            const newHead = { 
                ...headPosition, 
                color: generateRandomBrightColor() 
            };
            snake.unshift(newHead);
            generateFood();
        } else {
            // 음식을 먹지 않았을 경우: 꼬리를 떼서 머리 위치로 이동 (색상 유지)
            const tail = snake.pop();
            tail.x = headPosition.x;
            tail.y = headPosition.y;
            snake.unshift(tail);
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

        if (keyPressed === LEFT_KEY && !goingRight) { dx = -1; dy = 0; }
        if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -1; }
        if (keyPressed === RIGHT_KEY && !goingLeft) { dx = 1; dy = 0; }
        if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = 1; }
    }

    function gameLoop() {
        if (didGameEnd()) {
            stopGame();
            window.showGameOver("Game Over!", `Score: ${score}`);
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
            gameSpeed = settings.snakeSpeed || 100;
            gridSize = settings.gridSize || 20;
            const initialLength = settings.initialLength || 3;
            
            snake = [];
            for (let i = 0; i < initialLength; i++) {
                snake.push({
                    x: 10 - i,
                    y: 10,
                    color: generateRandomBrightColor()
                });
            }
            dx = 1;
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
