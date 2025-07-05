# This code is intended to be copied and pasted into the Anvil web editor for ProjectDetailForm.
# It will not run directly as a standalone Python file.

from anvil import *
import anvil.server

class ProjectDetailForm(ProjectDetailFormTemplate):
  def __init__(self, project_id=None, **properties):
    # Set Form properties and Data Bindings.
    self.init_components(**properties)

    self.project_id = project_id
    self.load_project_data()

  def load_project_data(self):
    # In a real app, you would fetch project data from a database or server call
    # For now, use dummy data based on project_id
    dummy_projects = {
      'project1': {'name': 'Colorful Swirls', 'description': 'A generative art piece with swirling colors.'},
      'project2': {'name': 'Particle Flow', 'description': 'Simulates particle movement based on mathematical functions.'},
      'id_of_your_art_project': {'name': 'Your Art Project Title', 'description': 'A brief description of your art project.'}
    }

    if self.project_id in dummy_projects:
      project_data = dummy_projects[self.project_id]
      self.project_name_label.text = project_data['name']
      self.project_description_label.text = project_data['description']
    else:
      self.project_name_label.text = "Project Not Found"
      self.project_description_label.text = "The requested project could not be found."

  def run_code_button_click(self, **event_args):
    """This method is called when the 'Run Code' button is clicked"""
    code_to_run = self.code_input.text
    self.output_area.text = "Running code..."
    try:
      # Call the server function to execute the user's Python code
      result = anvil.server.call('run_user_code', code_to_run)
      self.output_area.text = result
    except Exception as e:
      self.output_area.text = f"Anvil Client Error: {e}"

  def back_to_projects_button_click(self, **event_args):
    """This method is called when the 'Back to Projects' button is clicked"""
    open_form('ProjectsForm')
