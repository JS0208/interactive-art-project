from flask import Flask, render_template, request, redirect, url_for, jsonify
import io
import sys
import random

app = Flask(__name__)

# Project data
projects = {
    'brick_breaker': {
        'name': 'Brick Breaker',
        'description': 'A classic arcade game where you break bricks by bouncing a ball. Test your reflexes!',
    },
    'snake_game': {
        'name': 'Snake Game',
        'description': 'The timeless snake game. Guide your snake to eat food and grow, but avoid hitting walls or yourself!',
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
    # This route is now primarily for games, or could be removed if no generative art remains
    if project_id in ['brick_breaker', 'snake_game']:
        return jsonify({'status': 'Game ready', 'project_id': project_id})
    else:
        return "Art project not found", 404

if __name__ == '__main__':
    app.run(debug=True)