import logging
from fastapi import FastAPI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryParamLoggerMiddleware:
    def __init__(self, app: FastAPI):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            method = scope["method"]
            path = scope["path"]
            query_string = scope.get("query_string", b"").decode("utf-8")
            
            log_message = f"{method} {path}"
            if query_string:
                log_message += f"?{query_string}"

            # Vercel logging uses the print function
            print(f"{log_message}")

        response = await self.app(scope, receive, send)
        return response
