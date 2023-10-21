import unittest
from unittest.mock import patch, Mock, call
from nhl_shot_chart import generate_shot_chart_for_game

class TestGenerateShotChart(unittest.TestCase):

    @patch('nhl_shot_chart.parse_game_details')
    @patch('nhl_shot_chart.plt')
    @patch('nhl_shot_chart.NHLRink')
    def test_game_status_OT(self, MockNHLRink, MockPlt, MockParseGameDetails):
        mock_data = {
            "game": {
                "gameStart": "some_date",
                "currentPeriodTimeRemaining": "15:00",
                "currentPeriodOrdinal": "2OT",
                "awayTeam": "TeamA",
                "awayGoals": 1,
                "awayShotsOnGoal": 10,
                "awayShotAttempts": 15,
                "homeTeam": "TeamB",
                "homeGoals": 2,
                "homeShotsOnGoal": 20,
                "homeShotAttempts": 25,
                # ... other data ...
                "charts": {
                    "shotChart": {
                        "data": []
                    }
                }
            }
        }
        MockParseGameDetails.return_value = mock_data
        MockNHLRink.return_value.draw.return_value = Mock()
        generate_shot_chart_for_game("game_id", "timezone")
        expected_title = "TeamA 1 vs. TeamB 2\n15:00/2OT"
        MockPlt.title.assert_called_with(expected_title)

    @patch('nhl_shot_chart.parse_game_details')
    @patch('nhl_shot_chart.plt')
    @patch('nhl_shot_chart.NHLRink')
    def test_game_status_SO(self, MockNHLRink, MockPlt, MockParseGameDetails):
        mock_data = {
            "game": {
                "gameStart": "some_date",
                "currentPeriodTimeRemaining": "0:00",
                "currentPeriodOrdinal": "SO",
                "awayTeam": "TeamA",
                "awayGoals": 1,
                "awayShotsOnGoal": 10,
                "awayShotAttempts": 15,
                "homeTeam": "TeamB",
                "homeGoals": 2,
                "homeShotsOnGoal": 20,
                "homeShotAttempts": 25,
                # ... other data ...
                "charts": {
                    "shotChart": {
                        "data": []
                    }
                }
            }
        }
        MockParseGameDetails.return_value = mock_data
        MockNHLRink.return_value.draw.return_value = Mock()
        generate_shot_chart_for_game("game_id", "timezone")
        expected_title = "TeamA 1 vs. TeamB 2\n0:00/SO"
        MockPlt.title.assert_called_with(expected_title)

    @patch('nhl_shot_chart.parse_game_details')
    @patch('nhl_shot_chart.plt')
    @patch('nhl_shot_chart.NHLRink')
    def test_game_status_Final(self, MockNHLRink, MockPlt, MockParseGameDetails):
        mock_data = {
            "game": {
                "gameStart": "some_date",
                "currentPeriodTimeRemaining": "Final",
                "currentPeriodOrdinal": "3rd",
                "awayTeam": "TeamA",
                "awayGoals": 1,
                "awayShotsOnGoal": 10,
                "awayShotAttempts": 15,
                "homeTeam": "TeamB",
                "homeGoals": 2,
                "homeShotsOnGoal": 20,
                "homeShotAttempts": 25,
                # ... other data ...
                 "charts": {
                    "shotChart": {
                        "data": []
                    }
                }
            }
        }
        MockParseGameDetails.return_value = mock_data
        MockNHLRink.return_value.draw.return_value = Mock()
        generate_shot_chart_for_game("game_id", "timezone")
        expected_title = "TeamA 1 vs. TeamB 2\nFinal"
        MockPlt.title.assert_called_with(expected_title)

    @patch('nhl_shot_chart.parse_game_details')
    @patch('nhl_shot_chart.plt')
    @patch('nhl_shot_chart.NHLRink')
    def test_plotting(self, MockNHLRink, MockPlt, MockParseGameDetails):
        mock_data = {
            "game": {
                "gameStart": "some_date",
                "currentPeriodTimeRemaining": "10:00",
                "currentPeriodOrdinal": "2nd",
                "awayTeam": "TeamA",
                "awayGoals": 1,
                "awayShotsOnGoal": 10,
                "awayShotAttempts": 15,
                "homeTeam": "TeamB",
                "homeGoals": 2,
                "homeShotsOnGoal": 20,
                "homeShotAttempts": 25,
                "charts": {
                    "shotChart": {
                        "data": [
                            {
                                "x_calculated_shot_chart": 50,
                                "y_calculated_shot_chart": 20,
                                "markertype": "o",
                                "color": "red",
                                "markersize": "5",
                                "shot_attempts": 2
                            },
                            # ... additional shot data if needed ...
                        ]
                    }
                }
            }
        }
        MockParseGameDetails.return_value = mock_data
        MockNHLRink.return_value.draw.return_value = Mock()

        with patch('nhl_shot_chart.SHOW_SHOT_ATTEMPTS_ANNOTATION', True):
            generate_shot_chart_for_game("game_id", "timezone")
        
        MockPlt.plot.assert_called_with(50, 20, "o", color="red", markersize=5)
        
        # Asserting multiple calls to plt.text
        calls = [
            # This call asserts the detail line text
            call(0, -53, 'TeamA - 10 SOG (15 Total Shot Attempts)      TeamB - 20 SOG (25 Total Shot Attempts)\nsome_date', ha='center', fontsize=11, alpha=0.9),
            # This call asserts the shot attempts annotation
            call(48.8, 19, 2, horizontalalignment="left", size="medium", color="black", weight="normal")
        ]
        MockPlt.text.assert_has_calls(calls, any_order=True)
