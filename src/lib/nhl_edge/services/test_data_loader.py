# test_data_loader.py

import pytest
import asyncio
import json
from unittest.mock import patch
from aioresponses import aioresponses
from lib.nhl_edge.services.data_loader import load_data_for_game_and_timezone


@pytest.fixture
def mock_aioresponse():
    with aioresponses() as m:
        yield m

@pytest.mark.asyncio
async def test_load_data_for_game_and_timezone_successful(mock_aioresponse):
    # Mocking the external API responses
    mock_aioresponse.get("https://api-web.nhle.com/v1/gamecenter/12345/landing", payload={"data": "landing data"})
    mock_aioresponse.get("https://api-web.nhle.com/v1/gamecenter/12345/boxscore", payload={"data": "boxscore data"})
    mock_aioresponse.get("https://api-web.nhle.com/v1/gamecenter/12345/play-by-play", payload={"data": "play-by-play data"})

    # Mocking file operations
    with patch("lib.nhl_edge.services.data_loader.save_json_to_file") as mock_save:
        response = await load_data_for_game_and_timezone("12345")

        # Check if the function returns HTMLResponse
        assert response.media_type == "text/html"

        # Check if file save function is called correctly
        assert mock_save.call_count == 3

@pytest.mark.asyncio
async def test_load_data_for_game_and_timezone_with_error(mock_aioresponse):
    # Simulate an error in fetching data
    mock_aioresponse.get("https://api-web.nhle.com/v1/gamecenter/12345/landing", exception=Exception("Error"))

    with pytest.raises(Exception):
        await load_data_for_game_and_timezone("12345")
