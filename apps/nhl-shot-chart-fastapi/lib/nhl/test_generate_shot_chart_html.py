import unittest
from nhl_shot_chart import generate_shot_chart_html

class TestGenerateShotChartHtml(unittest.TestCase):

    def test_generate_shot_chart_html_success(self):
        # Test successful generation of shot chart HTML
        gameId = "2022030236"
        timezone = "America/Los_Angeles"
        response = generate_shot_chart_html(gameId, timezone)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"<html>", response.body)
        self.assertIn(b"Shot Chart for Game ID", response.body)
        self.assertIn(b"Generated at", response.body)

    def test_generate_shot_chart_html_error(self):
        # Test error handling when generating shot chart HTML
        gameId = "invalid_game_id"
        timezone = "America/Los_Angeles"
        response = generate_shot_chart_html(gameId, timezone)
        self.assertEqual(response.status_code, 200)
