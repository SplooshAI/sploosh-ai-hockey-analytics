from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from lib.nhl.nhl_shot_chart import generate_shot_chart_html, generate_shot_chart_with_schedule_html
from middleware.queryparameters.logger import QueryParamLoggerMiddleware
import os

DEFAULT_NHL_SEASON_ID = '20222023'
DEFAULT_NHL_TEAM_ID = 55 # Seattle Kraken
DEFAULT_NHL_GAME_ID = 2022030236  # 2023.05.13 Round 2 Game 6 of the 2023 Stanley Cup Playoffs

# Create your FastAPI application
app = FastAPI()

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Apply the middleware to your FastAPI application
app.add_middleware(QueryParamLoggerMiddleware)

@app.get("/favicon.ico")
async def get_favicon():
    return FileResponse(os.path.join("static", "favicon.ico"), media_type="image/x-icon")

@app.get("/")
@app.get("/nhl-shot-chart")
async def nhl_shot_chart(gameId: str = DEFAULT_NHL_GAME_ID, timezone: str = "UTC"):
   return generate_shot_chart_html(gameId, timezone)

@app.get("/nhl-schedule")
async def nhl_shot_chart_with_schedule(gameId: str = DEFAULT_NHL_GAME_ID, teamId: str = DEFAULT_NHL_TEAM_ID, seasonId: str = DEFAULT_NHL_SEASON_ID, timezone: str = "UTC"):
   return generate_shot_chart_with_schedule_html(gameId, teamId, seasonId, timezone)
