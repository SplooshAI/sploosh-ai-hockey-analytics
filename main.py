from fastapi import FastAPI
from lib.qrcode_generator import generate_qr_code_html, generate_qr_code_download
from lib.nhl.nhl_shot_chart import generate_shot_chart_html

DEFAULT_NHL_GAME_ID = 2022030236  # 2023.05.13 Round 2 Game 6 of the 2023 Stanley Cup Playoffs

app = FastAPI()

@app.get("/")
@app.get("/nhl-shot-chart")
async def nhl_shot_chart(gameId: str = DEFAULT_NHL_GAME_ID):
   return generate_shot_chart_html(gameId)

@app.get("/nhl-shot-chart/qrcode")
async def nhl_shot_chart_qrcode(gameId: str = DEFAULT_NHL_GAME_ID):
    return generate_qr_code_html(gameId)

@app.get("/nhl-shot-chart/download")
async def nhl_shot_chart_download(gameId: str = DEFAULT_NHL_GAME_ID):
  return generate_qr_code_download(gameId)
