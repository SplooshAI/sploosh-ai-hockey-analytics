# /lib/nhl_edge/tests/test_nhl_edge.py

from fastapi.responses import HTMLResponse
import unittest
from lib.nhl_edge.nhl_edge import generate_html_response

class TestNHLedge(unittest.TestCase):
    
    def test_generate_html_response_default_timezone(self):
        """
        Test the generate_html_response function with default timezone.
        """
        gameId = "123456"
        response = generate_html_response(gameId)
        self.assertIsInstance(response, HTMLResponse)
        self.assertIn("<strong>123456</strong>", response.body.decode())
        self.assertIn("UTC", response.body.decode())

    def test_generate_html_response_custom_timezone(self):
        """
        Test the generate_html_response function with a custom timezone.
        """
        gameId = "123456"
        timezone = "America/Los_Angeles"
        response = generate_html_response(gameId, timezone)
        self.assertIsInstance(response, HTMLResponse)
        self.assertIn("<strong>123456</strong>", response.body.decode())
        self.assertIn("America/Los_Angeles", response.body.decode())

if __name__ == '__main__':
    unittest.main()
