from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
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

@app.options("/")
async def get_options():
    return {
        "allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]
    }

@app.options("/{path:path}")
async def get_options_for_all_paths(path: str):
    return {
        "allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]
    }

@app.get("/favicon.ico")
async def get_favicon():
    return FileResponse(os.path.join("static", "favicon.ico"), media_type="image/x-icon")

@app.get("/")
@app.head("/")
@app.get("/nhl-shot-chart")
@app.head("/nhl-shot-chart")
async def nhl_shot_chart(request: Request, gameId: str = DEFAULT_NHL_GAME_ID, timezone: str = "UTC"):
    if request.method == "HEAD":
        return Response(headers={"Content-Type": "text/html"})

    return generate_shot_chart_html(gameId, timezone)

@app.get("/nhl-schedule")
@app.head("/nhl-schedule")
async def nhl_shot_chart_with_schedule(request: Request, gameId: str = DEFAULT_NHL_GAME_ID, teamId: str = DEFAULT_NHL_TEAM_ID, seasonId: str = DEFAULT_NHL_SEASON_ID, timezone: str = "UTC"):
    if request.method == "HEAD":
        return Response(headers={"Content-Type": "text/html"})

    return generate_shot_chart_with_schedule_html(gameId, teamId, seasonId, timezone)
