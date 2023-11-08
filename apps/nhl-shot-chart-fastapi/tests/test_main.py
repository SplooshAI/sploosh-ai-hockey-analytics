# tests/test_main.py

from fastapi.testclient import TestClient
from main import app
import os
import unittest

client = TestClient(app)

class TestMain(unittest.TestCase):

    def test_get_favicon(self):
        response = client.get("/favicon.ico")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], "image/x-icon")

    def test_get_apple_touch_icon(self):
        response = client.get("/apple-touch-icon.png")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], "image/png")

    def test_get_apple_touch_icon_precomposed(self):
        response = client.get("/apple-touch-icon-precomposed.png")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], "image/png")

    def test_options_root(self):
        response = client.options("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]})

    def test_options_for_all_paths(self):
        response = client.options("/some/path")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]})

    def test_nhl_shot_chart_get(self):
        gameId = "test_game_id"
        timezone = "America/Los_Angeles"
        response = client.get(f"/?gameId={gameId}&timezone={timezone}")
        self.assertEqual(response.status_code, 200)
        self.assertIn(gameId, response.text)
        self.assertIn(timezone, response.text)

    def test_nhl_shot_chart_head(self):
        gameId = "test_game_id"
        response = client.head(f"/?gameId={gameId}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], "text/html")

if __name__ == '__main__':
    unittest.main()
