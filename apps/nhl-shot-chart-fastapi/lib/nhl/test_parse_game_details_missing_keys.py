import unittest
from unittest.mock import patch
import nhl_shot_chart as nsc

class TestNHLShotChart(unittest.TestCase):

    @patch('nhl_shot_chart.load_live_data_for_game')
    def test_parse_game_details_missing_keys(self, mock_load_live_data_for_game):
        # Mock data that doesn't contain the keys 'currentPeriodTimeRemaining' and 'currentPeriodOrdinal'
        mock_load_live_data_for_game.return_value = {
            "gameData": {
                "datetime": {"dateTime": "2023-01-01T10:00:00Z"},
                "teams": {
                    "away": {"abbreviation": "AWAY"},
                    "home": {"abbreviation": "HOME"}
                }
            },
            "liveData": {
                "linescore": {},  # Empty linescore, missing the two keys
                "plays": {"allPlays": []}  # Empty plays list for simplicity
            }
        }

        # Call the function
        result = nsc.parse_game_details(12345, 'US/Pacific')

        # Check the resulting parsed data
        self.assertEqual(result["game"]["currentPeriodTimeRemaining"], "")
        self.assertEqual(result["game"]["currentPeriodOrdinal"], "")

# ... other test cases ...

# Ensure the tests run if executed directly
if __name__ == "__main__":
    unittest.main()
