# ==============[ IMPORTS ]==============
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from lib.nhl_edge.main import load_data_for_game_and_return_html
from middleware.queryparameters.logger import QueryParamLoggerMiddleware
import os

DEFAULT_NHL_GAMEID = "2023020248" # https://www.nhl.com/gamecenter/nyi-vs-sea/2023/11/16/2023020248 - Seattle wins their first shootout in 579 days in eight rounds over the New York Islanders

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

# Default route handler - NHL shot chart
@app.get("/")
@app.head("/")
async def nhl_shot_chart(request: Request, gameId: str = DEFAULT_NHL_GAMEID, timezone: str = "UTC"):
    if request.method == "HEAD":
        return Response(headers={"Content-Type": "text/html"})
    return await load_data_for_game_and_return_html(gameId, timezone)
