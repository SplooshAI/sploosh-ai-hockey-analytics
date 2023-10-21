import unittest
from unittest.mock import patch, call
import nhl_shot_chart as nsc
import io
import sys

class TestNHLShotChart(unittest.TestCase):

    @patch('nhl_shot_chart.parse_game_details')
    @patch('nhl_shot_chart.plt.text')
    def test_generate_shot_chart_for_game_with_shot_attempts_annotation(self, mock_plt_text, mock_parse_game_details):
        # Mock the parse_game_details function to return predefined game details
        mock_parse_game_details.return_value = {
            "game": {
                "gameStart": "Sample Date",
                "currentPeriodTimeRemaining": "Sample Time Remaining",
                "currentPeriodOrdinal": "Sample Period",
                "awayTeam": "AWAY",
                "homeTeam": "HOME",
                "charts": {
                    "shotChart": {
                        "data": [
                            {
                                "x_calculated_shot_chart": 10,
                                "y_calculated_shot_chart": 10,
                                "markertype": "x",
                                "color": "#000000",
                                "markersize": 12,
                                "shot_attempts": 5
                            }
                        ]
                    }
                }
            }
        }
        
        # Set SHOW_SHOT_ATTEMPTS_ANNOTATION to True
        original_value = nsc.SHOW_SHOT_ATTEMPTS_ANNOTATION
        nsc.SHOW_SHOT_ATTEMPTS_ANNOTATION = True

        # Call the function
        nsc.generate_shot_chart_for_game(12345, 'America/Los_Angeles')

        # Check if plt.text was called with shot attempts
        expected_call = call(10 - 1.2, 10 - 1, 5, horizontalalignment="left", size="medium", color="black", weight="normal")
        self.assertIn(expected_call, mock_plt_text.call_args_list, f"Expected call not found. Actual calls: {mock_plt_text.call_args_list}")

        # Reset SHOW_SHOT_ATTEMPTS_ANNOTATION to its original value
        nsc.SHOW_SHOT_ATTEMPTS_ANNOTATION = original_value

# ... other test cases ...

# Ensure the tests run if executed directly
if __name__ == "__main__":
    unittest.main()
