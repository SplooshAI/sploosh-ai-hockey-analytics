from datetime import datetime
from fastapi.responses import FileResponse, HTMLResponse

import base64
import io
import qrcode

def generate_qr_code_for_gameId(gameId: str):
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"NHL Game ID: {gameId}")
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    return qr_img

def generate_qr_code_base64(gameId: str):
    server_time = datetime.now().isoformat()

    # Generate the QR code
    qr_img = generate_qr_code_for_gameId(gameId)

    # Generate the HTML response with the embedded QR code image
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr)
    img_byte_arr.seek(0)
    qr_img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

    return qr_img_base64

def generate_qr_code_html(gameId: str):
    server_time = datetime.now().isoformat()

    # Generate the QR code
    qr_img = generate_qr_code_for_gameId(gameId)

    # Generate the HTML response with the embedded QR code image
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr)
    img_byte_arr.seek(0)
    qr_img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

    html_content = f"""
    <html>
    <body>
        <h1>NHL Shot Chart QR Code</h1>
        <p>Game ID: {gameId}<br />Generated at {server_time}</p>
        <img src="data:image/png;base64,{qr_img_base64}" alt="NHL Shot Chart QR Code">
    </body>
    </html>
    """

    return HTMLResponse(content=html_content, status_code=200)

def generate_qr_code_download(gameId: str):
    # Generate the QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"NHL Game ID: {gameId}")
    qr.make(fit=True)

    # Create a temporary file to save the QR code image
    filename = f"tmp/{gameId}_qrcode.png"
    qr_path = f"{filename}"
    qr.make_image(fill_color="black", back_color="white").save(qr_path)

    return FileResponse(qr_path, media_type="image/png", filename=filename)
