// static/snake_game.js

window.snake_gameGame = function(canvas, ctx, gameInfo) {
    let gameRunning = false;
    let animationFrameId = null;

    // --- 게임 변수 ---
    let gridSize;
    let snake;
    let foods = []; // 음식을 여러 개 담을 배열로 변경
    let dx = 0;
    let dy = 0;
    let score = 0;
    let changingDirection = false;
    let gameSpeed;
    let foodSpawnRate; // 음식 생성률 변수 추가

    // --- 이벤트 리스너 (키보드 및 터치) ---
    document.addEventListener("keydown", changeDirection);
    document.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, false);

    let x1 = null;
    let y1 = null;

    function handleTouchStart(event) {
        if (event.target !== canvas) return;
        const firstTouch = event.touches[0];
        x1 = firstTouch.clientX;
        y1 = firstTouch.clientY;
    }

    function handleTouchMove(event) {
        if (!x1 || !y1 || event.target !== canvas) {
            return;
        }

        let x2 = event.touches[0].clientX;
        let y2 = event.touches[0].clientY;
        let xDiff = x2 - x1;
        let yDiff = y2 - y1;

        // 방향 전환 로직 (가장 큰 움직임 기준)
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0 && dx === 0) { // Right swipe
                dx = 1; dy = 0;
            } else if (xDiff < 0 && dx === 0) { // Left swipe
                dx = -1; dy = 0;
            }
        } else {
            if (yDiff > 0 && dy === 0) { // Down swipe
                dx = 0; dy = 1;
            } else if (yDiff < 0 && dy === 0) { // Up swipe
                dx = 0; dy = -1;
            }
        }
        x1 = null;
        y1 = null;
        event.preventDefault();
    }

    // --- 음식 관리 ---
    function generateFood() {
        let newFood;
        // 뱀의 몸통과 겹치지 않는 위치에 음식이 생성될 때까지 반복
        do {
            newFood = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)),
                y: Math.floor(Math.random() * (canvas.height / gridSize))
            };
        } while (snake.some(part => part.x === newFood.x && part.y === newFood.y));
        
        foods.push(newFood);
    }

    // 설정된 foodSpawnRate에 따라 음식 개수를 관리하는 함수
    function manageFood() {
        while (foods.length < foodSpawnRate) {
            generateFood();
        }
    }


    // --- 그리기 함수 ---
    function drawSnakePart(snakePart) {
        ctx.fillStyle = 'lightgreen';
        ctx.strokeStyle = 'darkgreen';
        ctx.fillRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize);
    }

    function drawFoods() {
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'darkred';
        foods.forEach(food => {
            ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
            ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFoods(); // 모든 음식을 그림
        snake.forEach(drawSnakePart);
        gameInfo.textContent = `Snake Game: Score: ${score}`;
    }


    // --- 게임 로직 ---
    function advanceSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        let ateFood = false;
        // 여러 음식과의 충돌을 확인
        for (let i = foods.length - 1; i >= 0; i--) {
            if (head.x === foods[i].x && head.y === foods[i].y) {
                score += 10;
                ateFood = true;
                foods.splice(i, 1); // 먹힌 음식을 배열에서 제거
                break; 
            }
        }
        
        // 음식을 먹지 않았을 경우 꼬리 제거
        if (!ateFood) {
            snake.pop();
        } else {
            // 음식을 먹었다면, 새로운 음식을 생성하도록 관리
            manageFood();
        }
    }

    function didGameEnd() {
        // 자기 자신과 부딪혔는지 확인
        for (let i = 4; i < snake.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
        }
        // 벽과 부딪혔는지 확인
        const hitLeftWall = snake[0].x < 0;
        const hitRightWall = snake[0].x * gridSize >= canvas.width;
        const hitTopWall = snake[0].y < 0;
        const hitBottomWall = snake[0].y * gridSize >= canvas.height;
        return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
    }

    function changeDirection(event) {
        const LEFT_KEY = 37; const RIGHT_KEY = 39; const UP_KEY = 38; const DOWN_KEY = 40;

        if (changingDirection) return;
        changingDirection = true;

        const keyPressed = event.keyCode;
        const goingUp = dy === -1; const goingDown = dy === 1;
        const goingRight = dx === 1; const goingLeft = dx === -1;

        if (keyPressed === LEFT_KEY && !goingRight) { dx = -1; dy = 0; }
        if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -1; }
        if (keyPressed === RIGHT_KEY && !goingLeft) { dx = 1; dy = 0; }
        if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = 1; }
    }


    // --- 게임 루프 및 시작/중지 ---
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
            // 설정 적용
            gameSpeed = settings.snakeSpeed || 100;
            gridSize = settings.gridSize || 20;
            const initialLength = settings.initialLength || 3;
            foodSpawnRate = settings.foodSpawnRate || 1; // 기본값 1로 설정

            // 게임 상태 초기화
            snake = [];
            for(let i = 0; i < initialLength; i++) {
                snake.push({x: 10 - i, y: 10});
            }
            foods = []; // 음식 배열 초기화
            dx = 1; dy = 0;
            score = 0;
            
            manageFood(); // 초기 음식 생성

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
