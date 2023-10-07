import unittest
from unittest.mock import patch, Mock
from nhl_shot_chart import parse_game_details

# Updated mocked data for the NHL API response
mocked_nhl_api_response = {
    "gameData": {
        "datetime": {
            "dateTime": "2022-09-27T02:00:00Z"
        },
        "teams": {
            "away": {
                "abbreviation": "AWAY"
            },
            "home": {
                "abbreviation": "HOME"
            }
        }
    },
    "liveData": {
        "linescore": {
            "currentPeriodTimeRemaining": "3rd",
            "currentPeriodOrdinal": "END"
        },
        "plays": {
            "allPlays": []
        }
    }
}

# Mocking the requests.get call to return the above mocked data
def mocked_requests_get(*args, **kwargs):
    mock_resp = Mock()
    mock_resp.json.return_value = mocked_nhl_api_response
    return mock_resp

# Unit tests
class TestNHLFunctions(unittest.TestCase):
    
    @patch('requests.get', side_effect=mocked_requests_get)
    def test_parse_game_details(self, mock_get):
        # Given a gameId and timezone
        gameId = 12345
        timezone = "America/Los_Angeles"
        
        # When the function is called
        result = parse_game_details(gameId, timezone)
        
        # Then the result should match the expected data based on the mock
        self.assertEqual(result["game"]["gameStart"], "2022-09-26 07:00 PM PDT")
        self.assertEqual(result["game"]["awayTeam"], "AWAY")
        self.assertEqual(result["game"]["homeTeam"], "HOME")
