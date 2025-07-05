from flask import Flask, render_template, request, redirect, url_for, Response
import io
import sys
import random
from PIL import Image, ImageDraw # For image generation

app = Flask(__name__)

# Dummy project data (replace with database in a real application)
projects = {
    'colorful_swirls': {
        'name': 'Colorful Swirls',
        'description': 'A generative art piece with swirling colors. Click to generate new patterns.',
        'code_example': '' # No longer directly used for execution
    },
    'particle_flow': {
        'name': 'Particle Flow',
        'description': 'Simulates particle movement based on mathematical functions. Explore different equations!',
        'code_example': '' # No longer directly used for execution
    }
}

# --- Interactive Art Generation Functions ---
# These functions will generate the actual art (e.g., images, SVG, data)

def generate_colorful_swirls_image():
    img = Image.new('RGB', (400, 400), color = 'white')
    d = ImageDraw.Draw(img)
    for _ in range(50):
        x1, y1 = random.randint(0, 400), random.randint(0, 400)
        x2, y2 = random.randint(0, 400), random.randint(0, 400)
        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        d.line([(x1, y1), (x2, y2)], fill=color, width=random.randint(1, 5))
    
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return img_io

def generate_particle_flow_image():
    img = Image.new('RGB', (400, 400), color = 'black')
    d = ImageDraw.Draw(img)
    particles = []
    for _ in range(100):
        particles.append([random.randint(0, 400), random.randint(0, 400), random.uniform(-5, 5), random.uniform(-5, 5)])
    
    for _ in range(50):
        for p in particles:
            p[0] += p[2]
            p[1] += p[3]
            if p[0] < 0 or p[0] > 400: p[2] *= -1
            if p[1] < 0 or p[1] > 400: p[3] *= -1
            d.point((p[0], p[1]), fill=(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)))
    
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return img_io

# ---------------------------------------------

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
    if project_id == 'colorful_swirls':
        img_io = generate_colorful_swirls_image()
        return Response(img_io.getvalue(), mimetype='image/png')
    elif project_id == 'particle_flow':
        img_io = generate_particle_flow_image()
        return Response(img_io.getvalue(), mimetype='image/png')
    else:
        return "Art project not found", 404

if __name__ == '__main__':
    app.run(debug=True)
