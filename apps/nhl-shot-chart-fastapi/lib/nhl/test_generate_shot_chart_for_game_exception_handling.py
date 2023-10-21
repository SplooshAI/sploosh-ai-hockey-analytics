import unittest
from unittest.mock import patch
import nhl_shot_chart as nsc
import io
import sys

class TestNHLShotChart(unittest.TestCase):

    @patch('nhl_shot_chart.parse_game_details')
    def test_generate_shot_chart_for_game_exception_handling(self, mock_parse_game_details):
        # Mock the parse_game_details function to raise an exception
        mock_parse_game_details.side_effect = Exception("Test Exception in parse_game_details")
        
        # Redirect stdout to capture print statements
        captured_output = io.StringIO()
        sys.stdout = captured_output

        # Call the function
        try:
            nsc.generate_shot_chart_for_game(12345, 'America/Los_Angeles')
        except:
            pass

        # Reset stdout to its normal state
        sys.stdout = sys.__stdout__

        # Check if the expected error message was printed
        self.assertIn("Error parsing game details", captured_output.getvalue())

# ... other test cases ...

# Ensure the tests run if executed directly
if __name__ == "__main__":
    unittest.main()
