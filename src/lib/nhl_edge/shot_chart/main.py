# src/lib/nhl_edge/shot_chart/main.py

# Import necessary libraries
import os
import json
from .utils import parse_data_for_shot_chart, generate_base64_image, generate_html_with_base64_image
from ..services.data_loader import load_data_for_game_and_timezone

async def load_data_from_file(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

async def generate_shot_chart(gameId, timezone, data=None, use_local_json=False, file_path=None):
    # Load data from local file if specified
    if use_local_json and file_path:
        data = await load_data_from_file(file_path)
    elif not data:
        # Load data from the NHL Edge API
        data = await load_data_for_game_and_timezone(gameId, timezone)

    # Parse and process data for shot chart
    shot_chart_data = parse_data_for_shot_chart(data)

    # Generate a base64 encoded shot chart image
    base64_img_str = generate_base64_image(shot_chart_data, gameId)

    # Generate HTML to embed the base64 encoded shot chart image
    html_content = generate_html_with_base64_image(base64_img_str)

    return html_content
