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

            headers = dict(scope["headers"])
            formatted_headers = "\n".join([f"{k.decode('utf-8')}: {v.decode('utf-8')}" for k, v in headers.items()])
            logger.info(f"\n{log_message}\n\n{'-'*15}\nRequest Headers:\n{'-'*15}\n{formatted_headers}\n")

        response = await self.app(scope, receive, send)
        return response
