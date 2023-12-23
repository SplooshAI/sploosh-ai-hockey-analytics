# ==============[ IMPORTS ]==============
from fastapi.testclient import TestClient
from src.main import app, DEFAULT_NHL_GAMEID, DEFAULT_TIMEZONE

client = TestClient(app)

# ==============[ TESTS ]==============

# Test for favicon.ico route
def test_get_favicon():
    response = client.get("/favicon.ico")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/x-icon"

# Test for apple-touch-icon.png route
def test_get_apple_touch_icon():
    response = client.get("/apple-touch-icon.png")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"

# Test for apple-touch-icon-precomposed.png route
def test_get_apple_touch_icon_precomposed():
    response = client.get("/apple-touch-icon-precomposed.png")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"

# Test for OPTIONS route
def test_get_options():
    response = client.options("/")
    assert response.status_code == 200
    assert response.json() == {"allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]}

# Test for OPTIONS route with path
def test_get_options_for_all_paths():
    response = client.options("/somepath")
    assert response.status_code == 200
    assert response.json() == {"allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]}

# Test for load_game_data_and_return_html route (GET method)
def test_load_game_data_and_return_html_get():
    response = client.get("/")
    assert response.status_code == 200
    # Include more assertions here based on expected response content

# Test for load_game_data_and_return_html route (HEAD method)
def test_load_game_data_and_return_html_head():
    response = client.head("/")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/html"

# Test for load_game_data_and_return_html route with different query parameters
def test_load_game_data_and_return_html_with_params():
    response = client.get(f"/?gameId={DEFAULT_NHL_GAMEID}&timezone={DEFAULT_TIMEZONE}")
    assert response.status_code == 200
    # Add more assertions based on the expected output

# Test for /load-game-data route
def test_load_game_data_and_return_json():
    response = client.get("/api/load-game-data")
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]
    # Assert the structure of the JSON response
    data = response.json()
    assert "landing_data" in data
    assert "boxscore_data" in data
    assert "play_by_play_data" in data

# Test for /load-game-data route with query parameters
def test_load_game_data_and_return_json_with_params():
    response = client.get(f"/api/load-game-data?gameId={DEFAULT_NHL_GAMEID}&timezone={DEFAULT_TIMEZONE}")
    assert response.status_code == 200
    # Additional assertions for this specific gameId and timezone

# ==============[ SHOT CHART TESTS ]==============

# Test for /shot-chart route with default parameters
def test_load_game_data_and_return_shot_chart_html_default():
    response = client.get("/shot-chart")
    assert response.status_code == 200
    # Include more assertions here based on expected response content, like HTML structure

# Test for /shot-chart route with specific game ID
def test_load_game_data_and_return_shot_chart_html_with_game_id():
    response = client.get(f"/shot-chart?gameId={DEFAULT_NHL_GAMEID}")
    assert response.status_code == 200
    # Include assertions based on the specific game data

# Test for /shot-chart route with specific timezone
def test_load_game_data_and_return_shot_chart_html_with_timezone():
    response = client.get(f"/shot-chart?timezone={DEFAULT_TIMEZONE}")
    assert response.status_code == 200
    # Include assertions based on the specific timezone

# Test for /shot-chart route with both game ID and timezone
def test_load_game_data_and_return_shot_chart_html_with_params():
    response = client.get(f"/shot-chart?gameId={DEFAULT_NHL_GAMEID}&timezone={DEFAULT_TIMEZONE}")
    assert response.status_code == 200
    # Include assertions based on both gameId and timezone
