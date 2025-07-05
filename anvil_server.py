import anvil.server
import io
import sys

anvil.server.connect("server_E6GLWIZ3D2TM2JMCPIXVGF4H-QFUHUDBRBPD6CTQD")

@anvil.server.callable
def run_user_code(code):
    output = ""
    try:
        # Redirect stdout to capture print statements
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output

        exec(code)

        output = redirected_output.getvalue()
        sys.stdout = old_stdout # Restore stdout
    except Exception as e:
        output = f"Error: {e}"
    
    return output

print("Anvil server is running. Waiting for calls...")
anvil.server.wait_forever()
