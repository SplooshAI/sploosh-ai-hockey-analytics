from time import time
from fastapi import FastAPI, __version__

app = FastAPI()

@app.get("/")
async def hello():
    return {'res': 'pong', 'version': __version__, "time": time()}
