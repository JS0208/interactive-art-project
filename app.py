from flask import Flask, render_template, request, redirect, url_for, jsonify
import io
import sys
import random

app = Flask(__name__)

# Project data
projects = {
    'brick_breaker': {
        'name': 'Brick Breaker',
        'description': 'A classic arcade game where you break bricks by bouncing a ball.',
    },
    'snake_game': {
        'name': 'Snake Game',
        'description': 'The classic snake game. Grow your snake by eating food.',
    },
    'colorful_swirls': {
        'name': 'Colorful Swirls',
        'description': 'A generative art piece with swirling colors. Click to generate new patterns.',
    },
    'particle_flow': {
        'name': 'Particle Flow',
        'description': 'Simulates particle movement based on mathematical functions. Explore different equations!',
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/projects')
def list_projects():
    return render_template('projects.html', projects=projects)

@app.route('/projects/<project_id>')
def project_detail(project_id):
    project = projects.get(project_id)
    if not project:
        return "Project not found", 404
    
    return render_template('project_detail.html', project=project, project_id=project_id)

@app.route('/generate_art/<project_id>')
def generate_art(project_id):
    # For game projects, this might return initial game state or configuration
    # For generative art, it might return parameters or even SVG/JSON data
    if project_id == 'colorful_swirls':
        # Example: return some random parameters for client-side rendering
        return jsonify({'color_count': random.randint(5, 20), 'line_width': random.randint(1, 5)})
    elif project_id == 'particle_flow':
        return jsonify({'particle_count': random.randint(50, 200), 'speed_factor': random.uniform(0.5, 2.0)})
    elif project_id in ['brick_breaker', 'snake_game']:
        return jsonify({'status': 'Game ready', 'project_id': project_id})
    else:
        return "Art project not found", 404

if __name__ == '__main__':
    app.run(debug=True)