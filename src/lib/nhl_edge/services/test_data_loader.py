# test_data_loader.py
import sys
import os
from unittest.mock import patch, MagicMock
import asyncio
import json
from fastapi.responses import HTMLResponse

import pytest

# Assuming your project root is in sys.path, use the full import path
from src.lib.nhl_edge.services.data_loader import load_data_for_game_and_return_html, load_data_for_game_and_timezone
from src.main import DEFAULT_NHL_GAMEID, DEFAULT_TIMEZONE

# Sample data to use as mock responses
sample_landing_data = {"landing": "data"}
sample_boxscore_data = {"boxscore": "data"}
sample_play_by_play_data = {"play-by-play": "data"}

# Mock URL fetch response
async def mock_fetch_url(session, url):
    if "landing" in url:
        return sample_landing_data
    elif "boxscore" in url:
        return sample_boxscore_data
    elif "play-by-play" in url:
        return sample_play_by_play_data

@pytest.mark.asyncio
@patch("src.lib.nhl_edge.services.data_loader.fetch_url", side_effect=mock_fetch_url)
async def test_load_data_for_game_and_return_html(fetch_url_mock):
    response = await load_data_for_game_and_return_html(DEFAULT_NHL_GAMEID)
    assert isinstance(response, HTMLResponse)
    # You can add more assertions here to check if the HTML content is as expected

@pytest.mark.asyncio
@patch("src.lib.nhl_edge.services.data_loader.fetch_url", side_effect=mock_fetch_url)
async def test_load_data_for_game_and_timezone(fetch_url_mock):
    result = await load_data_for_game_and_timezone(DEFAULT_NHL_GAMEID, DEFAULT_TIMEZONE)
    assert result == {
        "landing_data": sample_landing_data,
        "boxscore_data": sample_boxscore_data,
        "play_by_play_data": sample_play_by_play_data
    }
    # Additional assertions can be added here for more thorough testing

# Add more tests to cover edge cases, error handling, and exceptional scenarios