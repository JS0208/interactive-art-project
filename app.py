from flask import Flask, render_template, request, redirect, url_for
import io
import sys

app = Flask(__name__)

# Dummy project data (replace with database in a real application)
projects = {
    'colorful_swirls': {
        'name': 'Colorful Swirls',
        'description': 'A generative art piece with swirling colors. Enter Python code to generate patterns.',
        'code_example': 'import random\nfor _ in range(10):\n    print(f"Color: {random.choice(['red', 'green', 'blue'])}")'
    },
    'particle_flow': {
        'name': 'Particle Flow',
        'description': 'Simulates particle movement based on mathematical functions. Try different equations!',
        'code_example': 'x = 0\ny = 0\nfor i in range(5):\n    x += i\n    y -= i\n    print(f"Particle at ({x}, {y})")'
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/projects')
def list_projects():
    return render_template('projects.html', projects=projects)

@app.route('/projects/<project_id>', methods=['GET', 'POST'])
def project_detail(project_id):
    project = projects.get(project_id)
    if not project:
        return "Project not found", 404

    output = None
    if request.method == 'POST':
        user_code = request.form['code']
        try:
            old_stdout = sys.stdout
            redirected_output = io.StringIO()
            sys.stdout = redirected_output

            exec(user_code)

            output = redirected_output.getvalue()
            sys.stdout = old_stdout
        except Exception as e:
            output = f"Error: {e}"
    
    return render_template('project_detail.html', project=project, output=output)

if __name__ == '__main__':
    app.run(debug=True)