from fastapi import FastAPI
from lib.qrcode_generator import generate_qr_code_html, generate_qr_code_download
from lib.nhl.nhl_shot_chart import generate_shot_chart_html

app = FastAPI()

@app.get("/")
@app.get("/nhl-shot-chart")
async def nhl_shot_chart(gameId: str = "2022030324"):
   return generate_shot_chart_html(gameId)

@app.get("/nhl-shot-chart/qrcode")
async def nhl_shot_chart_qrcode(gameId: str = "2022030324"):
    return generate_qr_code_html(gameId)

@app.get("/nhl-shot-chart/download")
async def nhl_shot_chart_download(gameId: str = "2022030324"):
  return generate_qr_code_download(gameId)
