from fastapi.responses import Response
from fastapi.testclient import TestClient
import pytest
from main import app  # Import the app from your module
from unittest.mock import patch

client = TestClient(app)

def mocked_file_response(*args, **kwargs):
    return Response(content="Mocked content")

# Test for favicon
@patch('os.path.join', return_value='static_path')
@patch('main.FileResponse', side_effect=mocked_file_response)
def test_get_favicon(mock_file_response, mock_os_join):
    response = client.get("/favicon.ico")
    assert response.status_code == 200
    assert response.text == "Mocked content"

# Test for apple-touch-icon.png route handler
@patch('os.path.join', return_value='static_path')
@patch('main.FileResponse', side_effect=mocked_file_response)
def test_get_apple_touch_icon(mock_file_response, mock_os_join):
    response = client.get("/apple-touch-icon.png")
    assert response.status_code == 200
    assert response.text == "Mocked content"

# Test for apple-touch-icon-precomposed.png route handler
@patch('os.path.join', return_value='static_path')
@patch('main.FileResponse', side_effect=mocked_file_response)
def test_get_apple_touch_icon_precomposed(mock_file_response, mock_os_join):
    response = client.get("/apple-touch-icon-precomposed.png")
    assert response.status_code == 200
    assert response.text == "Mocked content"

# Test for the OPTIONS route
def test_get_options():
    response = client.options("/")
    assert response.status_code == 200
    assert response.json() == {"allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]}

# Test for the OPTIONS route with path
def test_get_options_for_all_paths():
    response = client.options("/some/path")
    assert response.status_code == 200
    assert response.json() == {"allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]}

# Test for default route with HEAD method
def test_nhl_shot_chart_head():
    response = client.head("/")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "text/html"

# Test for default route with GET method
@patch('main.generate_shot_chart_html')
def test_nhl_shot_chart_get(mock_generate_shot_chart_html):
    response = client.get("/")
    assert response.status_code == 200
