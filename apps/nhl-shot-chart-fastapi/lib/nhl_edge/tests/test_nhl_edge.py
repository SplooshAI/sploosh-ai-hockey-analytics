# tests/test_nhl_edge.py

import sys
import os
import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.responses import HTMLResponse
import asyncio

# Ensure the parent directory is in sys.path to locate the nhl_edge module
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from nhl_edge import load_data_for_game_and_timezone

class TestNHLedge(unittest.TestCase):

    def setUp(self):
        # Set up the event loop for the test case
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

    def tearDown(self):
        # Close the loop after the test case
        self.loop.close()

    @patch('nhl_edge.aiohttp.ClientSession.get')
    def test_load_data_for_game_and_timezone(self, mock_get):
        # Mock the response from aiohttp.ClientSession.get
        mock_response = MagicMock()
        mock_response.__aenter__.return_value = mock_response
        mock_response.__aexit__.return_value = None
        mock_response.status = 200
        # Ensure the Content-Type header is 'application/json'
        mock_response.headers = {'Content-Type': 'application/json'}
        # Use AsyncMock to mock the json() method
        mock_response.json = AsyncMock(return_value={"data": "mocked data"})
        mock_get.return_value = mock_response

        # Run the coroutine inside the event loop
        gameId = "2023020185"
        timezone = "America/Los_Angeles"
        response = self.loop.run_until_complete(load_data_for_game_and_timezone(gameId, timezone))
        html_content = response.body.decode()

        # Check that the response is of type HTMLResponse
        self.assertIsInstance(response, HTMLResponse)

        # Check that the gameId appears in the response and the link is properly formatted
        self.assertIn(gameId, html_content)
        self.assertIn(f'href="https://www.nhl.com/gamecenter/{gameId}" target="_blank"', html_content)

        # Check that the timezone appears in the response
        self.assertIn(timezone, html_content)

if __name__ == '__main__':
    unittest.main()
