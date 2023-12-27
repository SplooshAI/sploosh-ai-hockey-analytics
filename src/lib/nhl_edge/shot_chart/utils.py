# src/lib/nhl_edge/shot_chart/utils.py

import base64
from io import BytesIO
from PIL import Image

def parse_data_for_shot_chart(data):
    # Parse and process the data here
    plays = data.get('play_by_play_data', {}).get('plays', [])
    filtered_plays = []

    for play in plays:
        type_desc_key = play.get('typeDescKey')
        if type_desc_key in ['missed-shot', 'shot-on-goal', 'blocked-shot', 'goal']:
            filtered_plays.append(play)

    # This is a placeholder function
    return filtered_plays

def get_all_play_by_play_typeDescKeys(data):
    plays = data.get('play_by_play_data', {}).get('plays', [])
    typeDescKeys = set()

    for play in plays:
        type_desc_key = play.get('typeDescKey')
        typeDescKeys.add(type_desc_key)

    return typeDescKeys

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
