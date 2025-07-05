from flask import Flask, render_template_string, request

app = Flask(__name__)

@app.route('/')
def index():
    return """
    <!doctype html>
    <title>Interactive Art</title>
    <h1>Enter your Python code</h1>
    <form method="POST" action="/run_code">
        <textarea name="code" rows="20" cols="80"></textarea><br>
        <input type="submit" value="Run Code">
    </form>
    """

@app.route('/run_code', methods=['POST'])
def run_code():
    user_code = request.form['code']
    output = ""
    try:
        # Redirect stdout to capture print statements
        import io
        import sys
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output

        exec(user_code)

        output = redirected_output.getvalue()
        sys.stdout = old_stdout # Restore stdout
    except Exception as e:
        output = f"Error: {e}"
    
    return f"""
    <!doctype html>
    <title>Interactive Art Output</title>
    <h1>Code Output</h1>
    <pre>{output}</pre>
    <a href="/">Run another code</a>
    """

if __name__ == '__main__':
    app.run(debug=True)
