# This code is intended to be copied and pasted into the Anvil web editor for MainForm.
# It will not run directly as a standalone Python file.

from anvil import *
import anvil.server

class MainForm(MainFormTemplate):
  def __init__(self, **properties):
    # Set Form properties and Data Bindings.
    self.init_components(**properties)

    # Any code you write here will run when the form opens.

  def view_projects_button_click(self, **event_args):
    """This method is called when the 'View Projects' button is clicked"""
    open_form('ProjectsForm')
