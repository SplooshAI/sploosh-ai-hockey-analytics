from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
import pytest

# Define the middleware class (provided in the question)
class QueryParamLoggerMiddleware:
    def __init__(self, app: FastAPI):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Separate output as desired
        dashed_line = "---------------"

        # Create a new request object from the scope
        request = Request(scope, receive=receive)

        # Log request method, path, and query string
        log_message = f"{request.method} {request.url.path}"
        if request.url.query:
            log_message += f"?{request.url.query}"
        print(f"{log_message}")

        # Log request headers
        print(f"\n\nRequest Headers\n{dashed_line}")
        for key, value in request.headers.items():
            print(f"{key}: {value}")

        # Call the next middleware or route handler
        response = await self.app(scope, receive, send)

        return response

# Create a sample FastAPI app with the middleware
app = FastAPI()
app.add_middleware(QueryParamLoggerMiddleware)

# Add a sample route to the app
@app.get("/sample")
def sample_endpoint():
    return {"message": "Sample endpoint"}

client = TestClient(app)

def test_query_param_logger_without_query_params(capfd):
    response = client.get("/sample")
    assert response.status_code == 200

    captured = capfd.readouterr()
    logs = captured.out.split("\n")

    # Check if the request method, path and headers are logged correctly
    assert "GET /sample" in logs
    assert "Request Headers" in logs

def test_query_param_logger_with_query_params(capfd):
    response = client.get("/sample?param1=value1&param2=value2")
    assert response.status_code == 200

    captured = capfd.readouterr()
    logs = captured.out.split("\n")

    # Check if the request method, path with query params and headers are logged correctly
    assert "GET /sample?param1=value1&param2=value2" in logs
    assert "Request Headers" in logs

# Additional tests can be added for other HTTP methods, headers, etc.
