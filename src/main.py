# ==============[ IMPORTS ]==============
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response, JSONResponse
from lib.nhl_edge.main import load_data_for_game_and_return_html, load_data_for_game_and_timezone
from lib.nhl_edge.shot_chart.main import generate_shot_chart
from middleware.queryparameters.logger import QueryParamLoggerMiddleware
import os

DEFAULT_NHL_GAMEID = "2023020573" # https://www.nhl.com/gamecenter/sea-vs-vgk/2024/01/01/2023020573 - Seattle wins the 2024 Winter Classic with Joey Daccord in net with a 3-0 shutout over the Las Vegas Golden Knights
DEFAULT_TIMEZONE = "America/Los_Angeles"

# ==============[ FASTAPI SETUP ]==============
# Create your FastAPI application
app = FastAPI()

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Apply the middleware to your FastAPI application
app.add_middleware(QueryParamLoggerMiddleware)

# ==============[ ROUTE HANDLERS ]==============
# Favicon route handler
@app.get("/favicon.ico")
async def get_favicon():
    return FileResponse(os.path.join("static", "favicon.ico"), media_type="image/x-icon")

# apple-touch-icon.png route handler
@app.get("/apple-touch-icon.png")
async def get_apple_touch_icon():
    return FileResponse(os.path.join("static", "apple-touch-icon.png"), media_type="image/png")

# apple-touch-icon-precomposed.png route handler
@app.get("/apple-touch-icon-precomposed.png")
async def get_apple_touch_icon_precomposed():
    return FileResponse(os.path.join("static", "apple-touch-icon-precomposed.png"), media_type="image/png")

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

# Default route handler
@app.get("/")
@app.head("/")
async def load_game_data_and_return_html(request: Request, gameId: str = DEFAULT_NHL_GAMEID, timezone: str = DEFAULT_TIMEZONE):
    if request.method == "HEAD":
        return Response(headers={"Content-Type": "text/html"})
    return await load_data_for_game_and_return_html(gameId, timezone)

# Shot chart route handler using the new shot_chart module
@app.get("/shot-chart")
async def load_game_data_and_return_shot_chart_html(gameId: str = DEFAULT_NHL_GAMEID, timezone: str = DEFAULT_TIMEZONE):
    # Load data from the NHL Edge API
    html_content = await generate_shot_chart(gameId, timezone)
    return Response(content=html_content, media_type="text/html")

# Shot chart route handler using local JSON files instead of the NHL Edge API
@app.get("/shot-chart/file")
async def load_shot_chart_using_test_local_data(gameId: str = "2023020497", timezone: str = DEFAULT_TIMEZONE):
    json_file_name = f"{gameId}-results.json"
    json_file_path = os.path.join("lib", "nhl_edge", "json", json_file_name)
    html_content = await generate_shot_chart(gameId, timezone, use_local_json=True, file_path=json_file_path)
    return Response(content=html_content, media_type="text/html")

# New route handler for returning JSON data
@app.get("/api/load-game-data")
async def load_game_data_and_return_json(gameId: str = DEFAULT_NHL_GAMEID, timezone: str = DEFAULT_TIMEZONE):
    data = await load_data_for_game_and_timezone(gameId, timezone)
    return JSONResponse(content=data)
