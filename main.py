from datetime import datetime
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

from lib.qrcode_generator import generate_qr_code_html, generate_qr_code_download
from lib.nhl.nhl_shot_chart import generate_shot_chart_for_game

import base64
import io

app = FastAPI()

@app.get("/")
@app.get("/nhl-shot-chart")
async def nhl_shot_chart(gameId: str = "2022030324"):
    shot_chart_img = generate_shot_chart_for_game(gameId)
    server_time = datetime.now().isoformat()

    # Generate the HTML response with the embedded shot chart image
    img_byte_arr = io.BytesIO()
    shot_chart_img.savefig(img_byte_arr, format='png', bbox_inches='tight')
    img_byte_arr.seek(0)
    shot_chart_img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

    html_content = f"""
    <html>
    <body>
        <h1>NHL Shot Chart</h1>
        <p>Game ID: {gameId} / Generated at {server_time}</p>
        <img src="data:image/png;base64,{shot_chart_img_base64}" alt="NHL Shot Chart QR Code">
    </body>
    </html>
    """

    return HTMLResponse(content=html_content, status_code=200)

@app.get("/nhl-shot-chart/qrcode")
async def nhl_shot_chart_qrcode(gameId: str = "2022030324"):
    return generate_qr_code_html(gameId)

@app.get("/nhl-shot-chart/download")
async def nhl_shot_chart_download(gameId: str = "2022030324"):
  return generate_qr_code_download(gameId)
