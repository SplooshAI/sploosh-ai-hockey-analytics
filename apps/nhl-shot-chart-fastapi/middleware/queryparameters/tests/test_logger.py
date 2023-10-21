import pytest
from unittest.mock import AsyncMock
from ..logger import QueryParamLoggerMiddleware, FastAPI

@pytest.mark.asyncio
async def test_log_message(capfd):
    # Create an instance of the middleware
    app = AsyncMock(return_value=None)  # Mock the app to be an asynchronous mock
    middleware = QueryParamLoggerMiddleware(app)

    # Mock the scope, receive, and send
    mock_scope = {
        "type": "http",
        "method": "GET",
        "path": "/test",
        "query_string": b"param1=value1&param2=value2",
        "headers": [
            (b"host", b"example.com"),
            (b"user-agent", b"test-agent")
        ]
    }
    mock_receive = AsyncMock(return_value=None)
    mock_send = AsyncMock(return_value=None)

    # Call the middleware
    await middleware(mock_scope, mock_receive, mock_send)

    # Use pytest's capfd to capture print statements
    captured = capfd.readouterr()
    expected_output = """
GET /test?param1=value1&param2=value2

---------------
Request Headers:
---------------
host: example.com
user-agent: test-agent

"""

    assert captured.out == expected_output
