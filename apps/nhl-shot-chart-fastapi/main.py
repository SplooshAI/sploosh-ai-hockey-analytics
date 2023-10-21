# ==============[ IMPORTS ]==============
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from lib.nhl.nhl_shot_chart import generate_shot_chart_html, generate_shot_chart_with_schedule_html
from middleware.queryparameters.logger import QueryParamLoggerMiddleware
import os

# ==============[ CONSTANTS ]==============
DEFAULT_NHL_SEASON_ID = '20232024'
DEFAULT_NHL_TEAM_ID = 55  # Seattle Kraken
DEFAULT_NHL_GAME_ID = 2023020046  # 2023.10.17 - Colorado Avalanche vs. Seattle Kraken

# ==============[ FASTAPI SETUP ]==============
# Create your FastAPI application
app = FastAPI()

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Apply the middleware to your FastAPI application
app.add_middleware(QueryParamLoggerMiddleware)

# ==============[ ROUTE HANDLERS ]==============
# OPTIONS route handlers
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

# Favicon route handler
@app.get("/favicon.ico")
async def get_favicon():
    return FileResponse(os.path.join("static", "favicon.ico"), media_type="image/x-icon")

# Default route handler - NHL shot chart
@app.get("/")
@app.head("/")
async def nhl_shot_chart(request: Request, gameId: str = DEFAULT_NHL_GAME_ID, timezone: str = "UTC"):
    if request.method == "HEAD":
        return Response(headers={"Content-Type": "text/html"})
    return generate_shot_chart_html(gameId, timezone)
