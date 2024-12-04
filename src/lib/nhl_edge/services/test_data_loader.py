# test_data_loader.py
import sys
import os
from unittest.mock import patch, MagicMock, AsyncMock
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
@patch("aiofiles.open")
@patch("src.lib.nhl_edge.services.data_loader.fetch_url", side_effect=mock_fetch_url)
async def test_load_data_for_game_and_return_html(fetch_url_mock, mock_aiofiles):
    # Mock the SVG file content with proper SVG tags
    mock_svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
    <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle">Mock NHL Rink</text>
    </svg>'''
    
    # Create a mock context manager
    mock_context = AsyncMock()
    mock_file = AsyncMock()
    mock_file.read.return_value = mock_svg_content
    mock_context.__aenter__.return_value = mock_file
    mock_aiofiles.return_value = mock_context
    
    response = await load_data_for_game_and_return_html(DEFAULT_NHL_GAMEID)
    assert isinstance(response, HTMLResponse)
    assert '<svg' in response.body.decode()  # Check for SVG presence
    assert 'Mock NHL Rink' in response.body.decode()  # Check for specific SVG content

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

@pytest.mark.asyncio
@patch("aiofiles.open")
@patch("src.lib.nhl_edge.services.data_loader.fetch_url", side_effect=mock_fetch_url)
async def test_load_data_for_game_and_return_html_svg_file_error(fetch_url_mock, mock_aiofiles):
    # Mock aiofiles.open to raise an exception
    mock_aiofiles.side_effect = FileNotFoundError("SVG file not found")
    
    response = await load_data_for_game_and_return_html(DEFAULT_NHL_GAMEID)
    
    assert isinstance(response, HTMLResponse)
    assert '<!-- SVG file not found -->' in response.body.decode()  # Check for error comment
    # Verify the rest of the response still works
    assert 'Landing Data' in response.body.decode()
    assert 'Boxscore Data' in response.body.decode()
    assert 'Play-by-Play Data' in response.body.decode()

# Add more tests to cover edge cases, error handling, and exceptional scenarios