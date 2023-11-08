import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestMain(unittest.TestCase):

    def test_favicon(self):
        response = client.get("/favicon.ico")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], 'image/x-icon')

    def test_apple_touch_icon(self):
        response = client.get("/apple-touch-icon.png")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], 'image/png')

    def test_apple_touch_icon_precomposed(self):
        response = client.get("/apple-touch-icon-precomposed.png")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], 'image/png')

    def test_options_root(self):
        response = client.options("/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue("allowed_methods" in response.json())

    def test_options_all_paths(self):
        response = client.options("/any/path")
        self.assertEqual(response.status_code, 200)
        self.assertTrue("allowed_methods" in response.json())

    def test_nhl_shot_chart_get(self):
        # You'll need to mock `load_data_for_game_and_timezone` here
        # ...
        pass

    def test_nhl_shot_chart_head(self):
        response = client.head("/", params={"gameId": "2023020185"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], 'text/html')

    # Additional tests for error cases and any other logic in your application...

    @patch('main.load_data_for_game_and_timezone')
    def test_nhl_shot_chart_get(self, mock_load_data):
        mock_load_data.return_value = "some HTML content"
        response = client.get("/", params={"gameId": "2023020185", "timezone": "UTC"})
        self.assertEqual(response.status_code, 200)
        mock_load_data.assert_called_once_with("2023020185", "UTC")

if __name__ == "__main__":
    unittest.main()
