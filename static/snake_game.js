window.snake_gameGame = function(canvas, ctx, gameInfo, globalScope) {
    let gameRunning = false, animationFrameId = null, gameLoopTimeout = null;
    let snake, food, dx, dy, score, gameSettings;
    let changingDirection = false;
    
    // --- 이벤트 리스너 ---
    document.addEventListener("keydown", changeDirection);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    let x1 = null, y1 = null;

    function changeDirection(event) {
        if (changingDirection) return;
        const keyPressed = event.keyCode;
        const goingUp = dy === -1, goingDown = dy === 1, goingRight = dx === 1, goingLeft = dx === -1;

        if (keyPressed === 37 && !goingRight) { dx = -1; dy = 0; }
        else if (keyPressed === 38 && !goingDown) { dx = 0; dy = -1; }
        else if (keyPressed === 39 && !goingLeft) { dx = 1; dy = 0; }
        else if (keyPressed === 40 && !goingUp) { dx = 0; dy = 1; }
        else return;
        changingDirection = true;
    }

    function handleTouchStart(e) { e.preventDefault(); const t = e.touches[0]; x1 = t.clientX; y1 = t.clientY; }
    function handleTouchMove(e) {
        if (!x1 || !y1) return;
        e.preventDefault();
        const x2 = e.touches[0].clientX, y2 = e.touches[0].clientY;
        const xDiff = x2 - x1, yDiff = y2 - y1;
        const goingUp = dy === -1, goingDown = dy === 1, goingRight = dx === 1, goingLeft = dx === -1;
        
        if (Math.abs(xDiff) > Math.abs(yDiff)) { // Horizontal swipe
            if (xDiff > 0 && !goingLeft) { dx = 1; dy = 0; } 
            else if (xDiff < 0 && !goingRight) { dx = -1; dy = 0; }
        } else { // Vertical swipe
            if (yDiff > 0 && !goingUp) { dx = 0; dy = 1; } 
            else if (yDiff < 0 && !goingDown) { dx = 0; dy = -1; }
        }
        changingDirection = true;
        x1 = null; y1 = null;
    }

    // --- 색상 및 생성 함수 ---
    function generateRandomBrightColor() {
        return `hsl(${Math.random() * 360}, 100%, 70%)`;
    }
    
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)
        } : null;
    }

    function generateFood() {
        const cols = Math.floor(canvas.width / gameSettings.gridSize);
        const rows = Math.floor(canvas.height / gameSettings.gridSize);
        food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
            color: `rgb(200, 200, 200)`
        };
    }

    // --- 그리기 함수 ---
    function drawGrid() {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < canvas.width; x += gameSettings.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gameSettings.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function drawSnake() {
        snake.forEach(part => {
            ctx.fillStyle = part.color;
            ctx.fillRect(part.x * gameSettings.gridSize, part.y * gameSettings.gridSize, gameSettings.gridSize, gameSettings.gridSize);
        });
    }

    function drawFood() {
        ctx.fillStyle = food.color;
        ctx.fillRect(food.x * gameSettings.gridSize, food.y * gameSettings.gridSize, gameSettings.gridSize, gameSettings.gridSize);
    }
    
    function draw() {
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (gameSettings.gridVisible) drawGrid();
        drawSnake();
        drawFood();
    }

    // --- 게임 로직 ---
    function advanceSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy, color: snake[0].color };

        // 벽 처리
        const cols = Math.floor(canvas.width / gameSettings.gridSize);
        const rows = Math.floor(canvas.height / gameSettings.gridSize);
        if (gameSettings.wallBehavior === 'wrapAround') {
            if (head.x < 0) head.x = cols - 1;
            if (head.x >= cols) head.x = 0;
            if (head.y < 0) head.y = rows - 1;
            if (head.y >= rows) head.y = 0;
        }

        snake.unshift(head); // 새 머리 추가

        const didEatFood = head.x === food.x && head.y === food.y;
        if (didEatFood) {
            score += 10;
            for(let i=1; i < gameSettings.growthFactor; i++){
                snake.push({ ...snake[snake.length-1] }); // 꼬리 복제
            }
            generateFood();
        } else {
            snake.pop(); // 꼬리 제거
        }
        
        // 색상 업데이트
        updateSnakeColors();
    }
    
    function updateSnakeColors(){
        const mode = gameSettings.snakeColorMode;
        if (mode === 'rainbow') {
            snake[0].color = generateRandomBrightColor();
        } else if (mode === 'solid') {
            snake.forEach(p => p.color = gameSettings.snakeHeadColor);
        } else if (mode === 'gradient') {
            const startColor = hexToRgb(gameSettings.snakeHeadColor);
            const endColor = hexToRgb(gameSettings.snakeTailColor);
            if (!startColor || !endColor) return; // 색상 변환 실패 시 중단
            
            for (let i = 0; i < snake.length; i++) {
                const ratio = i / (snake.length -1 || 1);
                const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
                const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
                const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
                snake[i].color = `rgb(${r},${g},${b})`;
            }
        }
    }

    function didGameEnd() {
        // 자가 충돌
        if(gameSettings.selfCollision) {
            for (let i = 4; i < snake.length; i++) {
                if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
            }
        }
        // 벽 충돌 (wrap-around가 아닐 때)
        if (gameSettings.wallBehavior === 'gameOver') {
            const cols = Math.floor(canvas.width / gameSettings.gridSize);
            const rows = Math.floor(canvas.height / gameSettings.gridSize);
            const hitWall = snake[0].x < 0 || snake[0].x >= cols || snake[0].y < 0 || snake[0].y >= rows;
            if(hitWall) return true;
        }
        return false;
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        if (didGameEnd()) {
            stopGame();
            globalScope.showGameOver("Game Over!", `Score: ${score}`);
            return;
        }
        
        changingDirection = false;
        gameLoopTimeout = setTimeout(function() {
            advanceSnake();
            draw();
            gameInfo.textContent = `Snake Game | Score: ${score}`;
            animationFrameId = requestAnimationFrame(gameLoop);
        }, gameSettings.snakeSpeed);
    }

    function startGame(settings) {
        if (gameRunning) return;
        gameRunning = true;
        gameSettings = settings;

        snake = [];
        const startX = Math.floor((canvas.width / gameSettings.gridSize) / 2);
        const startY = Math.floor((canvas.height / gameSettings.gridSize) / 2);
        for (let i = 0; i < gameSettings.initialLength; i++) {
            snake.push({ x: startX - i, y: startY, color: '#FFFFFF' });
        }
        
        dx = 1; dy = 0;
        score = 0;
        generateFood();
        updateSnakeColors();

        gameInfo.textContent = "Snake Game: Starting...";
        gameLoop();
    }

    function stopGame() {
        gameRunning = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
        animationFrameId = null;
        gameLoopTimeout = null;
    }

    return { startGame, stopGame };
};
