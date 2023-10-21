import unittest
from unittest.mock import patch
from .. import nhl_shot_chart as nsc
from fastapi.responses import HTMLResponse

class TestNHLShotChart(unittest.TestCase):
    
    @patch.object(nsc, 'generate_shot_chart_for_game')
    def test_generate_shot_chart_html_exception_handling(self, mock_generate_shot_chart_for_game):
        # Mock the generate_shot_chart_for_game function to raise an exception
        mock_generate_shot_chart_for_game.side_effect = Exception("Test Exception")
        
        # Call the function
        response = nsc.generate_shot_chart_html(12345, 'US/Pacific')
        
        # Check the response
        self.assertIsInstance(response, HTMLResponse)
        self.assertIn("Error Generating Shot Chart", response.body.decode('utf-8'))
        self.assertIn("Test Exception", response.body.decode('utf-8'))
        self.assertEqual(response.status_code, 500)

# ... other test cases ...

# Ensure the tests run if executed directly
if __name__ == "__main__":
    unittest.main()
