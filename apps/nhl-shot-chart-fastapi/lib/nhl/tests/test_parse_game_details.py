from unittest.mock import patch
from ..nhl_shot_chart import parse_game_details

def test_basic_game_details_extraction_home_shootout_winner():
    NHL_GAME_ID = 2022020530  # 2022.12.22 - Seattle Kraken vs. Vancouver Canucks - Vancouver wins 6-5 in a shootout at home
    TIMEZONE = "America/Los_Angeles"

    # Live data from the NHL API
    result = parse_game_details(NHL_GAME_ID, TIMEZONE)

    # Expected values
    GAME_START = "2022-12-22 07:00 PM PST"
    CURRENT_PERIOD_TIME_REMAINING = "Final"
    CURRENT_PERIOD_ORDINAL = "SO"

    assert result["game"]["gameStart"] == GAME_START
    assert result["game"]["currentPeriodTimeRemaining"] == CURRENT_PERIOD_TIME_REMAINING
    assert result["game"]["currentPeriodOrdinal"] == CURRENT_PERIOD_ORDINAL

def test_basic_game_details_extraction_visiting_shootout_winner():
    NHL_GAME_ID = 2021020933  # 2022.03.12 - Seattle Kraken vs. Montréal Canadiens - Seattle wins 4-3 in a shootout on the road
    TIMEZONE = "America/Los_Angeles"

    # Live data from the NHL API
    result = parse_game_details(NHL_GAME_ID, TIMEZONE)

    # Expected values
    GAME_START = "2022-03-12 04:00 PM PST"
    CURRENT_PERIOD_TIME_REMAINING = "Final"
    CURRENT_PERIOD_ORDINAL = "SO"

    assert result["game"]["gameStart"] == GAME_START
    assert result["game"]["currentPeriodTimeRemaining"] == CURRENT_PERIOD_TIME_REMAINING
    assert result["game"]["currentPeriodOrdinal"] == CURRENT_PERIOD_ORDINAL