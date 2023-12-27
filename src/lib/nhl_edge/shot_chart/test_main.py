# src/lib/nhl_edge/shot_chart/test_main.py

import asyncio
import unittest
from unittest.mock import patch, MagicMock, AsyncMock, Mock
from .main import generate_shot_chart, load_data_from_file

class TestShotChart(unittest.IsolatedAsyncioTestCase):

    @patch('src.lib.nhl_edge.shot_chart.main.load_data_from_file')
    @patch('src.lib.nhl_edge.shot_chart.main.generate_base64_image')
    @patch('src.lib.nhl_edge.shot_chart.main.generate_html_with_base64_image')
    async def test_generate_shot_chart_with_local_json(self, mock_html, mock_base64, mock_load):
        mock_load.return_value = AsyncMock(return_value={'mocked': 'data'})
        mock_base64.return_value = 'base64string'
        mock_html.return_value = '<html>Mocked HTML</html>'

        result = await generate_shot_chart('gameId', 'timezone', use_local_json=True, file_path='path/to/json')
        
        mock_load.assert_called_once_with('path/to/json')
        mock_base64.assert_called_once()
        mock_html.assert_called_once_with('base64string')
        self.assertEqual(result, '<html>Mocked HTML</html>')

    @patch('src.lib.nhl_edge.shot_chart.main.load_data_for_game_and_timezone')
    @patch('src.lib.nhl_edge.shot_chart.main.generate_base64_image')
    @patch('src.lib.nhl_edge.shot_chart.main.generate_html_with_base64_image')
    async def test_generate_shot_chart_with_api_data(self, mock_html, mock_base64, mock_api_load):
        mock_api_load.return_value = AsyncMock(return_value={'mocked': 'api_data'})
        mock_base64.return_value = 'base64string'
        mock_html.return_value = '<html>Mocked HTML</html>'

        result = await generate_shot_chart('gameId', 'timezone')

        mock_api_load.assert_called_once_with('gameId', 'timezone')
        mock_base64.assert_called_once()
        mock_html.assert_called_once_with('base64string')
        self.assertEqual(result, '<html>Mocked HTML</html>')

    @patch('builtins.open')
    def test_load_data_from_file(self, mock_open):
        # Mock file content
        mock_file_content = '{"mocked": "file_data"}'
        
        # Mock file object with a context manager
        mock_file = MagicMock()
        mock_file.__enter__.return_value.read.return_value = mock_file_content
        mock_open.return_value = mock_file

        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(load_data_from_file('path/to/file'))

        mock_open.assert_called_once_with('path/to/file', 'r')
        self.assertEqual(result, {'mocked': 'file_data'})

if __name__ == '__main__':
    unittest.main()
