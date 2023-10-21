import pytest
from unittest.mock import patch, MagicMock
from logger import QueryParamLoggerMiddleware, FastAPI

# Make the MagicMock awaitable
class AwaitableMagicMock(MagicMock):
    async def __call__(self, *args, **kwargs):
        return super().__call__(*args, **kwargs)
    
    def __await__(self):
        return self().__await__()

@pytest.fixture
def setup_middleware():
    app = FastAPI()
    middleware = QueryParamLoggerMiddleware(app)
    return middleware

@pytest.mark.asyncio
async def test_log_message(setup_middleware):
    middleware = setup_middleware

    with patch("logger.logger") as mock_logger:
        # Mock the app call using the awaitable mock
        middleware.app = AwaitableMagicMock()
        
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
        mock_receive = MagicMock()
        mock_send = MagicMock()
        
        print("Calling middleware...")  # Added print statement for debugging
        await middleware.__call__(mock_scope, mock_receive, mock_send)  # Note the 'await' here
        print("Middleware call finished.")  # Added print statement for debugging

        if mock_logger.info.called:
            print("Logger was called with:", mock_logger.info.call_args[0][0])
        else:
            print("Logger was not called.")
            
        expected_log_message = """
GET /test?param1=value1&param2=value2

---------------
Request Headers:
---------------
host: example.com
user-agent: test-agent
"""
        mock_logger.info.assert_called_once_with(expected_log_message)
