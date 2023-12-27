# test_main.py

import pytest
from unittest.mock import patch
from src.lib.nhl_edge.shot_chart.main import generate_shot_chart

# Sample test data
test_data = {'play_by_play_data': {'plays': []}}

@pytest.mark.asyncio
@patch('src.lib.nhl_edge.shot_chart.main.load_data_from_file')
@patch('src.lib.nhl_edge.shot_chart.main.load_data_for_game_and_timezone')
async def test_generate_shot_chart_with_local_json(mock_load_api, mock_load_file):
    # Mock setup
    mock_load_file.return_value = test_data

    gameId = '2023020497'
    timezone = 'America/Los_Angeles'

    # Call the generate_shot_chart function with use_local_json flag
    result = await generate_shot_chart(gameId, timezone, use_local_json=True, file_path='path/to/file.json')

    # Assertions
    mock_load_file.assert_called_once_with('path/to/file.json')
    mock_load_api.assert_not_called()  # API should not be called
    assert 'data:image/png;base64,' in result

@pytest.mark.asyncio
@patch('src.lib.nhl_edge.shot_chart.main.load_data_for_game_and_timezone')
async def test_generate_shot_chart_with_api_data(mock_load_api):
    # Mock setup
    mock_load_api.return_value = test_data

    gameId = '2023020497'
    timezone = 'America/Los_Angeles'

    # Call the generate_shot_chart function without local JSON
    result = await generate_shot_chart(gameId, timezone)

    # Assertions
    mock_load_api.assert_called_once_with(gameId, timezone)
    assert 'data:image/png;base64,' in result

@pytest.mark.asyncio
async def test_generate_shot_chart_with_provided_data():
    gameId = '2023020497'
    timezone = 'America/Los_Angeles'

    # Call the generate_shot_chart function with provided data
    result = await generate_shot_chart(gameId, timezone, data=test_data)

    # Assertions
    assert 'data:image/png;base64,' in result

# Additional tests can be added for edge cases, error handling, etc.
