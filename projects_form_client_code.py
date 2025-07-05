# This code is intended to be copied and pasted into the Anvil web editor for ProjectsForm.
# It will not run directly as a standalone Python file.

from anvil import *
import anvil.server

class ProjectsForm(ProjectsFormTemplate):
  def __init__(self, **properties):
    # Set Form properties and Data Bindings.
    self.init_components(**properties)

    # Dummy project data for demonstration
    # In a real app, this might come from a database or server call
    self.projects = [
      {'id': 'project1', 'name': 'Colorful Swirls', 'description': 'A generative art piece with swirling colors.'},
      {'id': 'project2', 'name': 'Particle Flow', 'description': 'Simulates particle movement based on mathematical functions.'},
      {'id': 'id_of_your_art_project', 'name': 'Your Art Project Title', 'description': 'A brief description of your art project.'}
    ]

    # Set the items for the RepeaterPanel
    self.projects_repeater.items = self.projects

  def view_button_click(self, **event_args):
    """This method is called when a 'View' button is clicked for a project"""
    # Get the data item associated with the clicked button
    clicked_project = event_args['sender'].parent.item
    project_id = clicked_project['id']

    # Open the ProjectDetailForm, passing the project ID
    open_form('ProjectDetailForm', project_id=project_id)

  def back_to_main_button_click(self, **event_args):
    """This method is called when the 'Back to Main' button is clicked"""
    open_form('MainForm')
