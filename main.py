from fastapi import FastAPI
from lib.qrcode_generator import generate_qr_code_html, generate_qr_code_download

app = FastAPI()

@app.get("/")
@app.get("/nhl-shot-chart")
async def nhl_shot_chart(gameId: str = "2022030324"):
    return generate_qr_code_html(gameId)

@app.get("/nhl-shot-chart/download")
async def nhl_shot_chart_download(gameId: str = "2022030324"):
  return generate_qr_code_download(gameId)
