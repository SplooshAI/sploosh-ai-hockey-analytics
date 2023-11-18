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

# Test for default route (GET method)
def test_nhl_shot_chart_get():
    response = client.get("/")
    assert response.status_code == 200
    # Include more assertions here based on expected response content

# Test for default route (HEAD method)
def test_nhl_shot_chart_head():
    response = client.head("/")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/html"

# Additional tests for the default route with different query parameters
def test_nhl_shot_chart_with_params():
    response = client.get("/?gameId=2023020185&timezone=America/Los_Angeles")
    assert response.status_code == 200
    # Add more assertions based on the expected output

# ==============[ ADDITIONAL TESTS ]==============
# You may need to add additional tests if there are more functions, error handling,
# or specific scenarios that need to be covered.
