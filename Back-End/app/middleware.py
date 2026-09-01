"""Middleware global para captura de exceções e logging padronizado."""

import logging
import time

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.exceptions import AppException

logger = logging.getLogger("fazenda_urbana")


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except AppException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail, "status": "error"},
            )
        except Exception as e:
            logger.exception(f"Erro inesperado: {e}")
            return JSONResponse(
                status_code=500,
                content={"detail": "Erro interno do servidor", "status": "error"},
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = round((time.time() - start) * 1000, 2)
        logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration}ms)")
        return response
