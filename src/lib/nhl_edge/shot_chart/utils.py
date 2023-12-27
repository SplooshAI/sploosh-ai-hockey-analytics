# src/lib/nhl_edge/shot_chart/utils.py

import base64
from io import BytesIO
from PIL import Image

def parse_data_for_shot_chart(data):
    # Parse and process the data here
    # This is a placeholder function
    return data

def generate_base64_image(data, gameId):
    # Generate a simple placeholder image
    image = Image.new('RGB', (100, 100), color = (73, 109, 137))

    # Convert the image to a base64 encoded string
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    # Return the base64 string
    return f"data:image/png;base64,{img_str}"

def generate_html_with_base64_image(base64_img_str):
    # Generate HTML content to embed the base64 encoded image
    html_content = f'<img src="{base64_img_str}" alt="Shot Chart">'
    return html_content
