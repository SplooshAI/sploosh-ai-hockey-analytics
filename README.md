# Welcome
This project will explore creating and deploying a FastAPI project to Vercel.

## Local development

### Install dependencies and run our project

```sh
# Verify that you have Python installed on your machine
% python3 --version

# Create a new virtual environment for the project
% python3 -m venv .venv

# Select your new environment by using the Python: Select Interpreter command in VS Code
#   - Enter the path: ./.venv/bin/python

# Activate your virtual environment
# % source /Users/rob/repos/explore-python-api-development/flask/.venv/bin/activate
% source .venv/bin/activate
(.venv) %

# Install Python packages in a virtual environment
(.venv) % pip install fastapi
(.venv) % pip install uvicorn

# Let's start our Flask server - Available at http://127.0.0.1:8000/
(.venv) % python main.py

# When you are ready to generate a requirements.txt file
(.venv) % pip freeze > requirements.txt

# Uninstall the package from your virtual environment
# (.venv) % pip uninstall simplejson

# Remove the dependency from requirements.txt if it exists
# (.venv) % pip uninstall -r requirements.txt

# PREFERRED: Install the packages from requirements.txt
(.venv) % pip install -r requirements.txt

# Let's start our FastAPI server - Available at http://127.0.0.1:8000/
(.venv) % uvicorn main:app --reload
```
