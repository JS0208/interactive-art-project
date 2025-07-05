// static/particle_flow.js

window.particle_flowGame = function(canvas, ctx, gameInfo) {
    let animationFrameId = null;
    let particles = [];
    let artParameters = {};

    function initParticles() {
        particles = [];
        const numParticles = artParameters.particle_count || 100;
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * (artParameters.speed_factor || 2),
                vy: (Math.random() - 0.5) * (artParameters.speed_factor || 2),
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateParticles() {
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off walls
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });
    }

    function gameLoop() {
        updateParticles();
        drawParticles();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function fetchAndStartArt() {
        gameInfo.textContent = "Particle Flow: Initializing...";
        fetch(`/generate_art/particle_flow`)
            .then(response => response.json())
            .then(data => {
                artParameters = data; // Use parameters from backend
                if (Object.keys(artParameters).length === 0) {
                    artParameters = {
                        particle_count: Math.floor(Math.random() * 150) + 50,
                        speed_factor: Math.random() * 1.5 + 0.5
                    };
                }
                initParticles();
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(gameLoop);
                gameInfo.textContent = "Particle Flow: Running!";
            })
            .catch(error => {
                console.error('Error fetching art parameters:', error);
                gameInfo.textContent = "Particle Flow: Error initializing.";
            });
    }

    function startArt() {
        fetchAndStartArt();
    }

    // Expose functions
    return {
        startGame: startArt // Renamed to startGame for consistency
    };
};
