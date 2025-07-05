// static/colorful_swirls.js

window.colorful_swirlsGame = function(canvas, ctx, gameInfo) {
    let animationFrameId = null;
    let artParameters = {};

    function drawSwirls() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Example: Draw a simple swirl based on parameters
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        for (let i = 0; i < (artParameters.line_count || 100); i++) {
            const angle = i * (Math.PI * 2 / (artParameters.line_count || 100));
            const radius = i * (artParameters.max_radius || 2);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, (artParameters.dot_size || 2), 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${i * (artParameters.hue_step || 5)}, 70%, 50%)`;
            ctx.fill();
        }
        gameInfo.textContent = "Colorful Swirls: Art generated!";
    }

    function fetchAndDrawArt() {
        gameInfo.textContent = "Colorful Swirls: Generating...";
        // Fetch parameters from Flask backend (if needed)
        fetch(`/generate_art/colorful_swirls`)
            .then(response => response.json())
            .then(data => {
                artParameters = data; // Use parameters from backend
                // If backend doesn't provide parameters, use random client-side ones
                if (Object.keys(artParameters).length === 0) {
                    artParameters = {
                        line_count: Math.floor(Math.random() * 100) + 50,
                        max_radius: Math.floor(Math.random() * 3) + 1,
                        dot_size: Math.floor(Math.random() * 3) + 1,
                        hue_step: Math.floor(Math.random() * 10) + 1
                    };
                }
                drawSwirls();
            })
            .catch(error => {
                console.error('Error fetching art parameters:', error);
                gameInfo.textContent = "Colorful Swirls: Error generating art.";
            });
    }

    function startArt() {
        fetchAndDrawArt();
    }

    // Expose functions to the global scope for project_detail.html to call
    return {
        startGame: startArt // Renamed to startGame for consistency with project_detail.html
    };
};
