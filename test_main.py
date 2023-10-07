from fastapi.testclient import TestClient
from unittest.mock import patch
import main

@patch('main.generate_shot_chart_html', return_value='<html>Shot Chart</html>')
@patch('main.generate_shot_chart_with_schedule_html', return_value='<html>Shot Chart with Schedule</html>')
def test_routes(mocked_generate_shot_chart_html, mocked_generate_shot_chart_with_schedule_html):
    client = TestClient(main.app)

    # Testing OPTIONS route
    response = client.options("/")
    assert response.status_code == 200
    assert response.json() == {"allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]}

    response = client.options("/random-path")
    assert response.status_code == 200
    assert response.json() == {"allowed_methods": ["GET", "POST", "OPTIONS", "HEAD"]}

    # Testing favicon route
    response = client.get("/favicon.ico")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/x-icon"

    # Testing default route for NHL shot chart
    response = client.get("/nhl-shot-chart")
    assert response.status_code == 200
    assert response.json() == "<html>Shot Chart</html>"

    response = client.head("/nhl-shot-chart")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "text/html"

    # Testing NHL shot chart with schedule route handler
    response = client.get("/nhl-schedule")
    assert response.status_code == 200
    assert response.json() == "<html>Shot Chart with Schedule</html>"

    response = client.head("/nhl-schedule")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "text/html"

    # Now, to ensure coverage, let's check that our mocked functions were indeed called
    mocked_generate_shot_chart_html.assert_called()
    mocked_generate_shot_chart_with_schedule_html.assert_called()
