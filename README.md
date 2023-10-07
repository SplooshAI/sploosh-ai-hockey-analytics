# Welcome

This project will explore creating and deploying a FastAPI project to Vercel.

You can view the [demo](https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/) on Vercel at [https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/](https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/)

![](./__screenshots__/01.png)

TL;DR Feel free to try the following sample URLs:

- [https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/](https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/) - Default shot chart
- [https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/?gameId=2022030236](https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/?gameId=2022030236) - Shot chart for a specific gameId from the NHL API
  - EXAMPLE: Clicking on a specific Gamecenter link for a game in the NHL scoreboard would take you to a URL that looks something like `https://www.nhl.com/gamecenter/vgk-vs-dal/2023/05/25/2022030324#game=2022030324,game_state=final1` - for this example URL, the `gameId` would be `2022030324`
- [https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/nhl-schedule?teamId=55](https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/nhl-schedule?teamId=55) - View all games for the Seattle Kraken from the 2022-2023 season
- [https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/nhl-schedule?teamId=55&seasonId=20212022](https://nhl-shot-chart-on-vercel-with-fastapi.vercel.app/nhl-schedule?teamId=55&seasonId=20212022) - View all games for the Seattle Kraken from their inaugural 2021-2022 season

When you are viewing the `/nhl-schedule` route, you can click links to automatically load team schedules for the current season and game details 🤓

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

# PREFERRED: Install the packages from requirements.txt
(.venv) % pip install -r requirements.txt

# Install Python packages in a virtual environment
(.venv) % pip install fastapi
(.venv) % pip install uvicorn

# Install QR code packages
(.venv) % pip install qrcode

# Install NHL shot chart visualization packages
(.venv) % pip install arrow
(.venv) % pip install matplotlib
(.venv) % pip install requests
(.venv) % pip install hockey-rink

# Install Python testing packages
(.venv) % pip install "fastapi[all]" pytest

# When you are ready to generate a requirements.txt file
(.venv) % pip freeze > requirements.txt

# Uninstall the package from your virtual environment
# (.venv) % pip uninstall simplejson

# Remove the dependency from requirements.txt if it exists
# (.venv) % pip uninstall -r requirements.txt

# Let's start our FastAPI server - Available at http://127.0.0.1:8000/
(.venv) % uvicorn main:app --reload

# To run the unit tests:
(.venv) % pytest

# To run a specific unit test:
(.venv) % pytest test_main.py

```
