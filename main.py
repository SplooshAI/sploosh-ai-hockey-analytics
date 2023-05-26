from fastapi import FastAPI, __version__
from time import time
from datetime import datetime

app = FastAPI()

@app.get("/")
async def hello():
    return {'res': 'pong', 'version': __version__, "time": time()}

@app.get("/nhl-shot-chart")
async def nhl_shot_chart(gameId: str = "2022030324"):
    server_time = datetime.now().isoformat()
    return {"gameId": gameId, "serverTime": server_time}
