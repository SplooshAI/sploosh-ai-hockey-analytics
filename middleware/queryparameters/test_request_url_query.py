import pytest
from unittest.mock import Mock, patch
from fastapi import FastAPI, Request
from logger import QueryParamLoggerMiddleware

@pytest.fixture
def setup_middleware():
    app = FastAPI()
    middleware = QueryParamLoggerMiddleware(app)
    return middleware

@patch("builtins.print")
@pytest.mark.asyncio
async def test_query_param_logging(mock_print, setup_middleware):
    # Mock the behavior of the FastAPI app
    async def mock_app(scope, receive, send):
        pass
    setup_middleware.app = mock_app

    # Craft a scope with a query string
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/test",
        "query_string": b"param1=value1&param2=value2",
        "headers": [(b"host", b"testserver")]
    }
    receive = Mock()
    send = Mock()

    # Call the middleware's __call__ method
    await setup_middleware.__call__(scope, receive, send)

    # Check whether the query string was logged
    mock_print.assert_any_call("GET /test?param1=value1&param2=value2")

# You don't need the if __name__ == "__main__": line when using pytest.
