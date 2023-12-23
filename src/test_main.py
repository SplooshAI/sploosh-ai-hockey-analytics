# ==============[ IMPORTS ]==============
from fastapi.testclient import TestClient
from src.main import app

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
    response = client.get("/?gameId=2023020185&timezone=America/Los_Angeles")
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
    response = client.get("/api/load-game-data?gameId=2023020185&timezone=America/Los_Angeles")
    assert response.status_code == 200
    # Additional assertions for this specific gameId and timezone