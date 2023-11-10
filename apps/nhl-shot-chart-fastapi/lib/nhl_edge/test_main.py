import pytest
import asyncio
from unittest.mock import patch, MagicMock
from .main import load_data_for_game_and_timezone  # Relative import

@pytest.mark.asyncio
async def test_load_data_for_game_and_timezone():
    # Mock data to be returned by fetch_url and save_json_to_file
    mock_data = {'some': 'data'}

    # Mock the fetch_url function
    with patch('lib.nhl_edge.main.fetch_url', return_value=mock_data) as mock_fetch:
        # Mock the save_json_to_file function
        with patch('lib.nhl_edge.main.save_json_to_file', return_value=None) as mock_save:
            # Call your function
            response = await load_data_for_game_and_timezone('1234')

            # Ensure fetch_url is called with correct parameters
            assert mock_fetch.call_count == 3

            # Ensure save_json_to_file is called with correct parameters
            assert mock_save.call_count == 3

            # Check the response content
            assert 'NHL Data for Game 1234' in response.body.decode()
            assert 'Landing Data' in response.body.decode()
            assert 'Boxscore Data' in response.body.decode()
            assert 'Play-by-Play Data' in response.body.decode()

# Add more test cases as needed
